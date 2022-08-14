
# read-in data
ifsc_data <- jsonlite::fromJSON(readLines("data/raw_data_2004_2022.json"), flatten = TRUE)

# keep only post 2003 events
ifsc_data <- ifsc_data |> dplyr::filter(year > 2003)

# get indices of rows that have non-null bouldering results
# these are those events that featured a bouldering comp
boulder_ind <- ifsc_data |>
    apply(1, \(x) !(is.null(x$results.Boulder.men) |
        is.null(x$results.Boulder.women))) |>
    unlist()

# keep only bouldering events and relevant columns
boulder_data <- ifsc_data[boulder_ind, ] |>
    dplyr::select(
        year, name, results.location, results.type, results.Boulder.men, results.Boulder.women
    )

# rename columns
names(boulder_data) <- c("year", "full_title", "location", "type", "men", "women")

boulder_data <- boulder_data |>
    ### extract start and end date from full_title
    # perform the following operation by row
    dplyr::rowwise() |>
    # extract start and end date into a column called date
    dplyr::mutate(
        date = dplyr::if_else(
            # if date doesn't spill into two calendar months
            grepl("^.*?(\\d+)\\s*-\\s*(\\d+)\\n([A-z]+)$", full_title),
            # e.g., "...\n11 - 13\nApr" -> "11-Apr-2008; 13-Apr-2008"
            sub(
                pattern = "^.*?(\\d+)\\s*-\\s*(\\d+)\\n([A-z]+)$",
                replacement = paste0("\\1-\\3-", year, "; \\2-\\3-", year),
                x = full_title
            ),
            # e.g., "...\n30 - 2\nApr - May" -> "30-Apr-2008; 2-May-2008"
            sub(
                pattern = "^.*?(\\d+)\\s*-\\s*(\\d+)\\n([A-z]+)\\s*-\\s*([A-z]+)$",
                replacement = paste0("\\1-\\3-", year, "; \\2-\\4-", year),
                x = full_title
            )
        )
    ) |>
    # split the new data column into start and end columns
    tidyr::separate(date, c("start", "end"), sep = "; ") |>
    # convert start and end columns from string to date
    dplyr::mutate(
        dplyr::across(start:end, ~ as.Date(.x, format = "%d-%b-%Y"))
    ) |>
    # transform data long format with one row per event per gender
    tidyr::pivot_longer(cols = c(men, women), names_to = "gender", values_to = "results")

# convert the list inside the results column into a column of data frames
boulder_data$results_clean <- boulder_data |>
    # apply function row-wise
    apply(1, \(x) {
        # get first row of the given results vector
        # this will be the header of the data frame
        header <- x$results[1] |>
            strsplit("\\n") |>
            unlist() |>
            tolower()
        # insert "rem" as a third column name
        header <- c(header[1:2], "rem", header[-(1:2)])
        # create body of data frame
        res_data <- x$results[-1] |>
            data.frame() |>
            # separate into columns by line break character
            tidyr::separate(1, into = header, sep = "\\n") |>
            # remove "rem" column
            dplyr::select(-rem) |>
            # coerce "rank" column into numeric
            dplyr::mutate(rank = as.numeric(rank)) |>
            # remove rows with NA in "rank"
            dplyr::filter(!is.na(rank))
    })

boulder_data <- boulder_data |>
    # unnest cleaned results
    tidyr::unnest(results_clean) |>
    # remove "results column"
    dplyr::select(-results) |>
    # make sure athlete names are in title case, e.g., First Last
    dplyr::mutate(athlete = stringr::str_to_title(athlete)) |>
    # transform to long format with one row per event/gender/athlete/round
    tidyr::pivot_longer(cols = qualification:final, names_to = "round", values_to = "score") |>
    # extract data from the "score" column
    dplyr::mutate(
        # replace "DNS"
        score = gsub("DNS", "0T0z 0 0 (00)", score),
        # add attempts info when no bonuses or tops were secured
        score = gsub("t\\s", "t0 ", score, ignore.case = TRUE),
        score = gsub("b\\s", "b0 ", score, ignore.case = TRUE),
        # convert score strings into a string "[No. of tops]; [top attempts]; [No. of zones]; [zone attempts]; [round rank]"
        score = dplyr::if_else(
            grepl("z", score), # if score contains z...
            # ... do this...
            sub(
                pattern = "(\\d)t(\\d)z\\s+(\\d+)\\s+(\\d+)\\s+\\((\\d+)\\)",
                replacement = "\\1; \\3; \\2; \\4; \\5",
                x = score,
                ignore.case = TRUE
            ),
            # ... else do this
            sub(
                pattern = "(\\d)t(\\d+)\\s+(\\d)b(\\d+)\\s+\\((\\d+)\\)",
                replacement = "\\1; \\2; \\3; \\4; \\5",
                x = score,
                ignore.case = TRUE
            )
        )
    ) |>
    # split new score string into columns
    tidyr::separate(
        score,
        into = c("tops", "top_attempts", "zones", "zone_attempts", "round_rank"),
        sep = "; "
    ) |>
    # select relevant columns
    dplyr::select(
        year, start, end, location, type, gender, rank, athlete, round, tops,
        top_attempts, zones, zone_attempts, round_rank
    )
