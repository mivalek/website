---
title: "Making an interactive data visualisation, Part 2"
subtitle: "Data wrangling"
date: 2022-08-13T12:21:24+01:00
tags:
    - data science
    - R
    - tutorial
featured: false
# draft: true
# for Quarto posts (must rename to .qmd)
format: hugo
execute:
    cache: true
preamble:
    Welcome to the second part of a mini-series about creating the [interactive visualisation of bouldering data](/portfolio/boulder-viz/) shown on the main page of this website.

    In the {{< link "first part" "blog/01_boulder_viz_pt1/index.md" >}}, I showed how to use Python to scrape some of the data the visualisation is based on from the web. If you haven't read it, I would encourage you to do that before reading on.

    This part deals with processing the scraped data using R to get them in a shape that's suitable for building the visualisation.

    Finally, in {{< link "Part 3" "blog/03_boulder_viz_pt3/index.md" >}}, I will show how I built the viz using HTML, CSS, and JavaScript.
---

We left off in the previous part in a place where we ended up with quite a lot of IFSC bouldering world cup data scraped from Wikipedia and saved in a CSV file.
Today, we will talk about data cleaning and wrangling, two steps that are integral to most data science projects.
To spice things up a little, we won't be using the CSV file from Part 1 but, instead, we'll use a file including all [world cup and world championships results](data/raw_data_2004_2022.json) since 2004.
The data set is stored in JSON[^1] format and is pretty messy!

I will be performing the data-wrangling in `R` using several packages from the `tidyverse` dialect.
Of course, you can, more or less easily, do the same thing in any other language but I think `R`/`tiydverse` provide a pretty neat toolset for this kind of data processing.

<div class="warn-box">

#### A little disclaimer

This post only covers a part of the data wrangling I had to do to make the visualisation.
The reason for this is that, in order to walk you through the thinking and coding behind the entire process, the blog post would have to be unbearable long.
It's already a pretty long read as is.

Also, just like last time with Python, I am assuming a certain level of familiarity with R here.

</div>

With all that out of the way, let's get to work!

## Exploring the data set

### Start point and end goal

There is quite a lot of data in the first file so, to make talking about the data a little easier, here is a heavily truncated version of the JSON file:

<div style="font-size:.85em;">

    [
      {
        "year": 2022,
        "name": "Boulder\nIFSC - Climbing World Cup (B) - Meiringen (SUI) 2022\nMeiringen\n8 - 10\nApr",
        "url": "https://ifsc.results.info/#/event/1233",
        "results": {
          "Boulder": {
            "men": [
              "Rank\nAthlete\nQualification\nSemi-final\nFinal",
              "1\nTomoa Narasaki\n148 • JPN\n4T5z 6 8 (1)\n4T4z 14 11 (2)\n2T3z 3 6 (1)",
              "2\nYoshiyuki Ogata\n147 • JPN\n4T5z 10 13 (3)\n2T4z 5 6 (5)\n2T3z 5 19 (2)",
              "3\nMejdi Schalck\n92 • FRA\n4T5z 10 10 (11)\n3T4z 8 5 (3)\n2T3z 7 9 (3)",
              "4\nPaul Jenft\n116 • FRA\n4T5z 8 17 (9)\n2T4z 5 7 (6)\n2T3z 15 18 (4)",
              "5\nColin Duffy\n99 • USA\n5T5z 14 12 (3)\n3T4z 10 12 (4)\n1T4z 19 27 (5)",
              ...
            ],
            "women": [
              "Rank\nAthlete\nQualification\nSemi-final\nFinal",
              "1\nJanja GARNBRET\n2 • SLO\n5T5z 10 10 (1)\n4T4z 6 6 (1)\n4T4z 5 5 (1)",
              "2\nNatalia GROSSMAN\n1 • USA\n4T5z 4 5 (3)\n3T4z 6 7 (2)\n3T4z 8 16 (2)",
              "3\nAndrea Kümin\n5 • SUI\n3T5z 6 6 (9)\n2T3z 3 6 (5)\n1T2z 1 3 (3)",
              "4\nOriane BERTONE\n3 • FRA\n3T5z 10 6 (15)\n2T4z 3 5 (3)\n1T2z 1 5 (4)",
              "5\nFutaba ITO\n4 • JPN\n4T5z 6 6 (7)\n2T3z 4 8 (6)\n0T2z 0 8 (5)",
              ...
            ]
          },
          "location": "Meiringen (SUI)",
          "year": 2022,
          "type": "World cup"
        }
      },
      ...
    ]

</div>

If you are familiar with JSON, you'll notice that this is an array of objects.
Each object (only one is showing in the output above) represents a single competition.
There are a number of `"key": "value"` pairs with all sorts of information about the details of the event.
The `"results"` element contains an object of objects, each one representing a climbing discipline (bouldering, lead, speed, combined).
Every one of these contains two arrays of results: one for men and one for women, respectively.
Inside these, is an array of character strings but if you look at it, you'll notice that it's basically a table, with each of the elements corresponding to a row (the first one is the table's header) and with individual columns separated by a new line character `\n`.

At this point, I think it makes sense to look at the actual values in the JSON file to anticipate what kinds of operations we might want to perform.
For instance, it might be interesting to extract the date of each event from the `"name"` element, while the rest of the info contained therein can already be found elsewhere.
Likewise, the last three "columns" of the results tables-to-be will need a little more processing to extract details about number of tops, bonuses/zones, and attempts as well as the athlete's rank in the particular round of the competition.
If the last sentence read like word salad, you might want to check out the {{< link "section in the previous blogpost" "blog/01_boulder_viz_pt1/index.md" "a-rough-guide-to-competitive-bouldering" >}} that explains the basic rules of international bouldering competitions.

Ultimately, we're after a neatly processed data set with each row corresponding to an athlete's performance in a given round of a single competition.
This data set will likely have thousands of rows (45,876 to be precise), so here's the first 30 in a table, just to give you an idea:

<div class="scroll-tab" data-height="337px">

| year | start      | end        | location        | type      | gender | rank | athlete           | round         | tops | top_attempts | zones | zone_attempts | round_rank |
| ---: | :--------- | :--------- | :-------------- | :-------- | :----- | ---: | :---------------- | :------------ | :--- | :----------- | :---- | :------------ | :--------- |
| 2022 | 2022-04-08 | 2022-04-10 | Meiringen (SUI) | World cup | men    |    1 | Tomoa Narasaki    | qualification | 4    | 6            | 5     | 8             | 1          |
| 2022 | 2022-04-08 | 2022-04-10 | Meiringen (SUI) | World cup | men    |    1 | Tomoa Narasaki    | semi-final    | 4    | 14           | 4     | 11            | 2          |
| 2022 | 2022-04-08 | 2022-04-10 | Meiringen (SUI) | World cup | men    |    1 | Tomoa Narasaki    | final         | 2    | 3            | 3     | 6             | 1          |
| 2022 | 2022-04-08 | 2022-04-10 | Meiringen (SUI) | World cup | men    |    2 | Yoshiyuki Ogata   | qualification | 4    | 10           | 5     | 13            | 3          |
| 2022 | 2022-04-08 | 2022-04-10 | Meiringen (SUI) | World cup | men    |    2 | Yoshiyuki Ogata   | semi-final    | 2    | 5            | 4     | 6             | 5          |
| 2022 | 2022-04-08 | 2022-04-10 | Meiringen (SUI) | World cup | men    |    2 | Yoshiyuki Ogata   | final         | 2    | 5            | 3     | 19            | 2          |
| 2022 | 2022-04-08 | 2022-04-10 | Meiringen (SUI) | World cup | men    |    3 | Mejdi Schalck     | qualification | 4    | 10           | 5     | 10            | 11         |
| 2022 | 2022-04-08 | 2022-04-10 | Meiringen (SUI) | World cup | men    |    3 | Mejdi Schalck     | semi-final    | 3    | 8            | 4     | 5             | 3          |
| 2022 | 2022-04-08 | 2022-04-10 | Meiringen (SUI) | World cup | men    |    3 | Mejdi Schalck     | final         | 2    | 7            | 3     | 9             | 3          |
| 2022 | 2022-04-08 | 2022-04-10 | Meiringen (SUI) | World cup | men    |    4 | Paul Jenft        | qualification | 4    | 8            | 5     | 17            | 9          |
| 2022 | 2022-04-08 | 2022-04-10 | Meiringen (SUI) | World cup | men    |    4 | Paul Jenft        | semi-final    | 2    | 5            | 4     | 7             | 6          |
| 2022 | 2022-04-08 | 2022-04-10 | Meiringen (SUI) | World cup | men    |    4 | Paul Jenft        | final         | 2    | 15           | 3     | 18            | 4          |
| 2022 | 2022-04-08 | 2022-04-10 | Meiringen (SUI) | World cup | men    |    5 | Colin Duffy       | qualification | 5    | 14           | 5     | 12            | 3          |
| 2022 | 2022-04-08 | 2022-04-10 | Meiringen (SUI) | World cup | men    |    5 | Colin Duffy       | semi-final    | 3    | 10           | 4     | 12            | 4          |
| 2022 | 2022-04-08 | 2022-04-10 | Meiringen (SUI) | World cup | men    |    5 | Colin Duffy       | final         | 1    | 19           | 4     | 27            | 5          |
| 2022 | 2022-04-08 | 2022-04-10 | Meiringen (SUI) | World cup | men    |    6 | Kokoro Fujii      | qualification | 4    | 16           | 4     | 7             | 17         |
| 2022 | 2022-04-08 | 2022-04-10 | Meiringen (SUI) | World cup | men    |    6 | Kokoro Fujii      | semi-final    | 4    | 12           | 4     | 8             | 1          |
| 2022 | 2022-04-08 | 2022-04-10 | Meiringen (SUI) | World cup | men    |    6 | Kokoro Fujii      | final         | 1    | 4            | 3     | 27            | 6          |
| 2022 | 2022-04-08 | 2022-04-10 | Meiringen (SUI) | World cup | men    |    7 | Yuji Inoue        | qualification | 3    | 16           | 5     | 12            | 11         |
| 2022 | 2022-04-08 | 2022-04-10 | Meiringen (SUI) | World cup | men    |    7 | Yuji Inoue        | semi-final    | 2    | 8            | 4     | 9             | 7          |
| 2022 | 2022-04-08 | 2022-04-10 | Meiringen (SUI) | World cup | men    |    7 | Yuji Inoue        | final         | NA   | NA           | NA    | NA            | NA         |
| 2022 | 2022-04-08 | 2022-04-10 | Meiringen (SUI) | World cup | men    |    8 | Maximillian Milne | qualification | 4    | 7            | 5     | 9             | 7          |
| 2022 | 2022-04-08 | 2022-04-10 | Meiringen (SUI) | World cup | men    |    8 | Maximillian Milne | semi-final    | 2    | 9            | 4     | 20            | 8          |
| 2022 | 2022-04-08 | 2022-04-10 | Meiringen (SUI) | World cup | men    |    8 | Maximillian Milne | final         | NA   | NA           | NA    | NA            | NA         |
| 2022 | 2022-04-08 | 2022-04-10 | Meiringen (SUI) | World cup | men    |    9 | Keita Dohi        | qualification | 3    | 7            | 4     | 5             | 13         |
| 2022 | 2022-04-08 | 2022-04-10 | Meiringen (SUI) | World cup | men    |    9 | Keita Dohi        | semi-final    | 2    | 4            | 3     | 3             | 9          |
| 2022 | 2022-04-08 | 2022-04-10 | Meiringen (SUI) | World cup | men    |    9 | Keita Dohi        | final         | NA   | NA           | NA    | NA            | NA         |
| 2022 | 2022-04-08 | 2022-04-10 | Meiringen (SUI) | World cup | men    |   10 | Manuel Cornu      | qualification | 4    | 15           | 5     | 13            | 13         |
| 2022 | 2022-04-08 | 2022-04-10 | Meiringen (SUI) | World cup | men    |   10 | Manuel Cornu      | semi-final    | 2    | 7            | 3     | 10            | 10         |
| 2022 | 2022-04-08 | 2022-04-10 | Meiringen (SUI) | World cup | men    |   10 | Manuel Cornu      | final         | NA   | NA           | NA    | NA            | NA         |

</div>

Technically, we don't need any of the even information (dates, location, _etc._), an even ID would suffice.
But given that we have the data, it makes sense to tidy it up like this.

### R begins

OK, now that we have a better notion of what the data contains and what the end goal is, let's go ahead and read it into `R`.
The `jsonlite` package offers pretty powerful tools for working with JSON and for translating it into `R`'s data frames and _vice-versa_.
Here, I'm reading in the JSON file and converting it to a data frame.
Because of the multiple levels of nesting in the data, I am telling `R` to flatten the resulting data frame instead of creating a nested one.
It's really down to your preference: if you like working with nested data frames, knock yourself out!

```r
ifsc_data <- jsonlite::fromJSON(readLines("data/raw_data_2004_2022.json"), flatten = TRUE)
```

Let's see what columns we end up with:

```r
names(ifsc_data)
```

     [1] "year"                   "name"                   "url"
     [4] "results.location"       "results.year"           "results.type"
     [7] "results.Boulder.men"    "results.Boulder.women"  "results.Lead.men"
    [10] "results.Lead.women"     "results.Combined.men"   "results.Combined.women"

As a very quick data check, let's look at the `year` column to make sure the values in it make sense:

```r
ifsc_data$year |> range()
```

    [1] 2000 2022

It looks like, despite the file name, there are some records going as far back as 2000.
Let's see what pre-2004 events we have here:

```r
ifsc_data |> dplyr::filter(year < 2004) |> dplyr::pull(name)
```

     [1] "Lead\nUIAA Worldcup - Imst (AUT) 2003\nImst\n22 - 23\nMay"
     [2] "Boulder • Speed\nUIAA Worldcup - Yekaterinburg (RUS) 2003 (B+S)\nYekaterinburg B+S\n30 - 1\nMay - Jun"
     [3] "Speed\nUIAA Worldcup - Yekaterinburg (RUS) 2003 (S)\nYekaterinburg S\n4\nJun"
     [4] "Lead • Speed\nUIAA Worldcup - Yekaterinburg (RUS) 2003 (D+S)\nYekaterinburg D+S\n6 - 8\nJun"
     [5] "Boulder\nUIAA Worldcup - Fiera di Primiero (ITA) 2003\nFiera di Primiero\n13 - 15\nJun"
     [6] "Speed\nUIAA Worldcup - Lecco (ITA) 2003 (speed)\nLecco Speed\n23\nJun"
     [7] "Boulder\nUIAA Worldcup - Lecco (ITA) 2003 (boulder)\nLecco Bouldern\n24 - 25\nJun"
     [8] "Lead\nUIAA Worldcup - Lecco (ITA) 2003 (difficulty)\nLecco\n27 - 28\nJun"
     [9] "Lead • Boulder • Speed\nUIAA Worldchampionship - Chamonix (FRA) 2003\nChamonix\n9 - 13\nJul"
    [10] "Boulder\nUIAA Worldcup - L'Argentière (FRA) 2003\nArgentiere\n24 - 25\nJul"

    [output truncated]

As you can see, these events were all organised under the auspices of UIAA, the International Climbing and Mountaineering Federation (actually, the _Union Internationale des Associations d'Alpinisme_) and not those of the IFSC.
The IFSC took over the world cups championships in 2004 and so, let's just focus on this data:

```r
ifsc_data <- ifsc_data |> dplyr::filter(year > 2003)
```

OK, now, the data frame is flattened to some extent but there are still nested data for each results table:

```r
class(ifsc_data$results.Boulder.women)
```

    [1] "list"

```r
head(ifsc_data$results.Boulder.women[[1]])
```

    [1] "Rank\nAthlete\nQualification\nSemi-final\nFinal"
    [2] "1\nJanja GARNBRET\n2 • SLO\n5T5z 10 10 (1)\n4T4z 6 6 (1)\n4T4z 5 5 (1)"
    [3] "2\nNatalia GROSSMAN\n1 • USA\n4T5z 4 5 (3)\n3T4z 6 7 (2)\n3T4z 8 16 (2)"
    [4] "3\nAndrea Kümin\n5 • SUI\n3T5z 6 6 (9)\n2T3z 3 6 (5)\n1T2z 1 3 (3)"
    [5] "4\nOriane BERTONE\n3 • FRA\n3T5z 10 6 (15)\n2T4z 3 5 (3)\n1T2z 1 5 (4)"
    [6] "5\nFutaba ITO\n4 • JPN\n4T5z 6 6 (7)\n2T3z 4 8 (6)\n0T2z 0 8 (5)"

We can break down the procedure of getting the date into the desired format above into reshaping and cleaning.
I am not using these terms in some well-defined technical sense here and, as we will see, these two processes share some of the operations but I think that, whenever there's a complex task to be dealt with, it makes sense to break it down into more manageable chunks and tackle them one at a time.
Let's do that then!

## Reshaping the data

### Keeping only bouldering data

Notice that all competitions have two of these results list per discipline (one for women, one for men), regardless of whether or not the event in question included the given discipline.
For instance, the 2022 World Cup in Meiringen, Switzerland was a bouldering only even and so the lead and combined results columns will be empty:

```r
ifsc_data$results.Combined.women[1]
```

    [[1]]
    NULL

```r
ifsc_data$results.Lead.men[1]
```

    [[1]]
    NULL

Because we're only interested in bouldering data, let's subset the data.
Just like with everything else, there are several ways of doing this.
What we can do is first get a logical vector (_e.g._, one that only contains `TRUE` and `FALSE` values), with each element of the vector corresponding to whether or not the given row in `ifsc_data` contains bouldering results for either men or women.
In more functional terms, we will apply a function that returns `TRUE` if that row contains a non-null list in either `results.Boulder.men` or `results.Boulder.women` to each row of our data.
I am using base R's `apply()` instead of the appropriate `tidyverse` counterpart because, well, I just can never remember which of the `purrr::map`s or `purrr::walk`s to use. `¯\_(ツ)_/¯`
As `apply()` returns a list, the final step of the pipeline turns the output into a single logical vector.

In case you're not familiar with the `|>` or `\(x)` syntax, the former (added to R 4.0) is the [forward pipe operator](https://rdrr.io/r/base/pipeOp.html) very similar to `magrittr`'s `%>%`, while the latter is a lambda syntax for anonymous functions (added to R 4.1).
`\(x) x + 1` is the same as `function(x) x + 1`.

```r
boulder_ind <- ifsc_data |>
    apply(1, \(x) !(is.null(x$results.Boulder.men) |
                    is.null(x$results.Boulder.women))) |>
    unlist()
```

As promised, we get a logical vector identifying rows that do contain bouldering results.
Here's the first 20 elements:

     [1]  TRUE  TRUE  TRUE  TRUE  TRUE  TRUE  TRUE  TRUE  TRUE  TRUE FALSE FALSE
    [13] FALSE FALSE  TRUE FALSE FALSE  TRUE  TRUE  TRUE

Now we can simply use the `boulder_ind` vector to subset our data.
Another thing we can do in the same command is get rid of the `results...` columns we don't need.
I'm using `dplyr::select()` to do this as well as rearrange the columns a little:

```r
boulder_data <- ifsc_data[boulder_ind, ] |>
    dplyr::select(
        year, name, results.location, results.type, results.Boulder.men, results.Boulder.women
    )
```

### Tidier format

Let's give the columns better names:

```r
    names(boulder_data) <- c("year", "full_title", "location", "type", "men", "women")
```

At this stage, it would be useful to see the first few rows of the data frame, just to get a feel for it.
However, because the `men` and `women` columns still contain lists of results, the raw printout would be really messy.
To get around that, here's a somewhat edited printout:

      year               full_title             location      type             men             women
    1 2022 Boulder\nIFSC - Climb...      Meiringen (SUI) World cup [men's results] [women's results]
    2 2022 Boulder • Speed\nIFSC...          Seoul (KOR) World cup [men's results] [women's results]
    3 2022 Boulder • Speed\nIFSC... Salt Lake City (USA) World cup [men's results] [women's results]
    4 2022 Boulder • Speed\nIFSC... Salt Lake City (USA) World cup [men's results] [women's results]
    5 2022 Boulder\nIFSC - Climb...         Brixen (ITA) World cup [men's results] [women's results]
    6 2022 Boulder • Lead\nIFSC ...      Innsbruck (AUT) World cup [men's results] [women's results]

The last thing in the "reshaping" chapter is to transform the data set into the long format, where every row represents a single set results.
In other words, we want two rows per event, one for women's results and one for men's results.
The `pivot_longer()` function form the `tidyr` package does this job with remarkable ease.

```r
boulder_data <- boulder_data |>
    tidyr::pivot_longer(cols=c(men, women), names_to = "gender", values_to = "results")
```

      year               full_title             location      type gender           results
    1 2022 Boulder\nIFSC - Climb...      Meiringen (SUI) World cup    men   [men's results]
    2 2022 Boulder\nIFSC - Climb...      Meiringen (SUI) World cup  women [women's results]
    3 2022 Boulder • Speed\nIFSC...          Seoul (KOR) World cup    men   [men's results]
    4 2022 Boulder • Speed\nIFSC...          Seoul (KOR) World cup  women [women's results]
    5 2022 Boulder • Speed\nIFSC... Salt Lake City (USA) World cup    men   [men's results]
    6 2022 Boulder • Speed\nIFSC... Salt Lake City (USA) World cup  women [women's results]

The benefit of this format is that now we can start extracting the results data from a single column.
To do that, we need to figure out an algorithm to apply to each row of our data set.
Let's get cleaning!

## Data cleaning

To start the data cleaning part, let's remind ourselves what the results look like.
Because the `results` column is a list, it's easier to just work with a single element.

```r
class(boulder_data$results)
```

    [1] "list"

```r
boulder_data$results[[1]] |>
    head() |>
    as.matrix()
```

         [,1]
    [1,] "Rank\nAthlete\nQualification\nSemi-final\nFinal"
    [2,] "1\nTomoa Narasaki\n148 • JPN\n4T5z 6 8 (1)\n4T4z 14 11 (2)\n2T3z 3 6 (1)"
    [3,] "2\nYoshiyuki Ogata\n147 • JPN\n4T5z 10 13 (3)\n2T4z 5 6 (5)\n2T3z 5 19 (2)"
    [4,] "3\nMejdi Schalck\n92 • FRA\n4T5z 10 10 (11)\n3T4z 8 5 (3)\n2T3z 7 9 (3)"
    [5,] "4\nPaul Jenft\n116 • FRA\n4T5z 8 17 (9)\n2T4z 5 7 (6)\n2T3z 15 18 (4)"
    [6,] "5\nColin Duffy\n99 • USA\n5T5z 14 12 (3)\n3T4z 10 12 (4)\n1T4z 19 27 (5)"

### Converting results to data frame

As a first step towards extracting the data out of the vector of results, it would make sense to transform it into tabular data, _i.e._, a data frame.
However, if you look carefully, you'll see that the number of column headings, separated by "`\n`" is one less than the number of columns in the subsequent rows.
That is because what's supposed to be the "Athlete" column comprises 2 lines: the name of the athlete and the athlete's starting number and country code.

Because of this, a reasonable algorithm would be to:

1.  extract the vector of column names from the first element of `results`
2.  add an extra column name `"rem"` as the third element of 1.
3.  convert the rest of the elements into a one-column data frame
4.  separate the values into columns by the `\n` character, passing vector from 1. as column names
5.  remove the `rem` column

The above algorithm can be implemented as follows:

```r
header <- boulder_data$results[[1]][1] |>
    strsplit("\\n") |>
    unlist()
header <- c(header[1:2], "rem", header[-(1:2)])
header
```

    [1] "Rank"          "Athlete"       "rem"           "Qualification" "Semi-final"    "Final"

```r
res_data <- boulder_data$results[[1]][-1] |>
    data.frame() |>
    tidyr::separate(1, into = header, sep = "\\n") |>
    dplyr::select(-rem)
```

Here's a selection of the resulting data frame:

                          Rank        Athlete  Qualification     Semi-final        Final
    1                        1 Tomoa Narasaki   4T5z 6 8 (1) 4T4z 14 11 (2) 2T3z 3 6 (1)
    15                      15 Benjamin Hanna  3T5z 6 20 (9) 1T4z 6 13 (15)         <NA>
    30                      29     Sam Avezou 2T5z 4 18 (29)           <NA>         <NA>
    113 Thilo Jeldrik Schröter      145 • NOR           <NA>           <NA>         <NA>

In the output above, you can see that Benjamin Hanna has a missing value in the `Final` column and Sam Avezou has one in the `Final` and `Semi-final` columns.
This is not a problem at all, it just means that these athletes did not progress to the given rounds and so don't have a result for them.
The final row is a different story, though.
This athlete had a "Did Not Start" (DNS) status and so they do not have a rank.
The absence of rank causes the data to shift columns.

Because entries without a rank will not contain any useful information, we may as well get rid of them.
One way to do that is to convert the `Rank` column into `numeric`,
This will result in entries such as the one we are talking about having `NA` in this column.
After this conversion, we can simply remove any rows that have a missing value in the `Rank` column.

```r
res_data <- res_data |>
    dplyr::mutate(Rank = as.numeric(Rank)) |>
    dplyr::filter(!is.na(Rank))
```

Looking at the last few rows of the data, you can see that the offending entry has been removed:

        Rank                      Athlete   Qualification Semi-final Final
    107  107               Tuukka Simonen  0T1z 0 2 (107)       <NA>  <NA>
    108  108               Roman Batsenko  0T1z 0 4 (108)       <NA>  <NA>
    109  108 Frederik Viberg Christiansen  0T1z 0 4 (108)       <NA>  <NA>
    110  110                 Amiad Lipman 0T1z 0 11 (110)       <NA>  <NA>
    111  111                 Pedro Avelar  0T0z 0 0 (111)       <NA>  <NA>
    112  111    Mateus Rodrigues Bellotto  0T0z 0 0 (111)       <NA>  <NA>

Now that the results are tabulated, we can combine results across rows of `boulder_data`.
That, however, assumes that the raw data are all formatted uniformly.
If there's one thing that's always true about real-world data, it's that **they are messy AF** and so this assumption is likely to not hold.
To check it, can have a look at the **unique values** of the individual result header rows:

```r
apply(boulder_data, 1, \(x) x$results[1]) |>
    unique() |>
    as.matrix()
```

         [,1]
    [1,] "Rank\nAthlete\nQualification\nSemi-final\nFinal"
    [2,] "Rank\nAthlete\nQualification\nSemi-Final\nFinal"
    [3,] "Rank\nAthlete\nQualification\nFinal"
    [4,] "Rank\nAthlete"

Our assumption of uniformity is clearly wrong as there are four different formats in the data.
This is not a huge problem, though, because the code above can handle all of these.
However, when it comes to combining the individual results data frames, they should have the same column names and, while missing columns can easily be filled with `NA`s, spelling differences are a bit of an issue.
Luckily, the only spelling difference is "`Semi-Final`" vs "`Semi-final`" which can easily be resolved by converting the header names to lower case.

It stands to reason that if the format of the headers differs across events, the data will do so too.
To illustrate this point, here's a little printout of the different kinds of formats:

      year                                                                   result
    1 2022 1\nTomoa Narasaki\n148 • JPN\n4T5z 6 8 (1)\n4T4z 14 11 (2)\n2T3z 3 6 (1)
    2 2014        1\nJuliane Wurm\n4 • GER\n5t10 5b10 (2)\n4t5 4b4 (1)\n3t8 4b8 (1)
    3 2010                   1\nChloé Graftiaux\n62 • BEL\n4t4 5b5 (9)\n4t5 4b4 (2)
    4 2006                                                       1\nOlga Bibik\nRUS

Nothing catastrophic here either but notice that there are two different formats for results, _e.g._, "4T5z 6 8 (1)" and "5t10 5b10 (2)".
Let's put a pin in this nuisance and get back to it once we've combined the results across events.
By the way, it is really only one event in Sheffield, UK, in 2010 that was a 2-rounder, which is why there is no semi-final in the data.
Ain't that just grand!

Let's try using the code above (with a couple of minor tweaks) applying it as a function to every row of `boulder_data` to create a nw column in our data set, `results_clean`:

```r
boulder_data$results_clean <- boulder_data |>
    apply(1, \(x) {
        header <- x$results[1] |>
            strsplit("\\n") |>
            unlist() |>
            tolower()
        header <- c(header[1:2], "rem", header[-(1:2)])
        res_data <- x$results[-1] |>
            data.frame() |>
            tidyr::separate(1, into = header, sep = "\\n") |>
            dplyr::select(-rem) |>
            dplyr::mutate(rank = as.numeric(rank)) |>
            dplyr::filter(!is.na(rank))
        }
    )
```

Now, we can finally get rid of the nesting within the data set:

```r
boulder_data <- boulder_data |> tidyr::unnest(results_clean)
```

Let's take a look at 20 randomly selected rows of the resulting data to see that the unnesting was performed correctly and that we indeed ended up with one row per event per athlete:

    # A tibble: 20 × 11
        year full_title                                                                                                               location           type         gender results      rank athlete                 qualification `semi-final`  final
       <int> <chr>                                                                                                                    <chr>              <chr>        <chr>  <list>      <dbl> <chr>                   <chr>         <chr>         <chr>
     1  2019 "Boulder\nIFSC Climbing Worldcup (B) - Meiringen (SUI) 2019\nMeiringenWC\n5 - 6\nApr"                                    Meiringen (SUI)    World cup    men    <chr [116]>    87 Dylan Chuat             2T3z 7 6 (44) <NA>          <NA>
     2  2019 "Boulder\nIFSC Climbing Worldcup (B) - Munich (GER) 2019\nMunichWC\n18 - 19\nMay"                                        Munich (GER)       World cup    men    <chr [120]>    75 Vladislav Budnik        0T3z 0 6 (38) <NA>          <NA>
     3  2018 "Boulder\nIFSC Climbing Worldcup (B) - Munich (GER) 2018\nMunichWC\n17 - 18\nAug"                                        Munich (GER)       World cup    men    <chr [129]>    93 Ciarán Scanlon          1T1z 3 3 (47) <NA>          <NA>
     4  2017 "Boulder\nIFSC Climbing Worldcup (B) - Vail (USA) 2017\nVailWC\n9 - 10\nJun"                                             Vail (USA)         World cup    women  <chr [56]>     39 Alexis Mascarenas       2t7 2b5 (20)  <NA>          <NA>
     5  2016 "Boulder\nIFSC Climbing Worldcup (B) - Meiringen (SUI) 2016\nMeiringenWC\n15 - 16\nApr"                                  Meiringen (SUI)    World cup    women  <chr [60]>     49 Itziar ZABALA Zurinaga  0t 3b3 (25)   <NA>          <NA>
     6  2016 "Lead • Boulder • Speed\nIFSC Climbing World Championships - Paris (FRA) 2016\nWCH Paris\n14 - 18\nSep"                  Paris (FRA)        World champs men    <chr [124]>    65 Stephane Hanssens       1t1 1b1 (33)  <NA>          <NA>
     7  2016 "Lead • Boulder • Speed\nIFSC Climbing World Championships - Paris (FRA) 2016\nWCH Paris\n14 - 18\nSep"                  Paris (FRA)        World champs men    <chr [124]>   111 Efe Can Sevil           0t 0b (56)    <NA>          <NA>
     8  2015 "Boulder\nIFSC Climbing Worldcup (B) - Munich (GER) 2015\nMunich\n14 - 15\nAug"                                          Munich (GER)       World cup    men    <chr [125]>    65 Pawel Jelonek           1t2 3b12 (33) <NA>          <NA>
     9  2015 "Boulder\nIFSC Climbing Worldcup (B) - Munich (GER) 2015\nMunich\n14 - 15\nAug"                                          Munich (GER)       World cup    women  <chr [87]>      6 Katja Debevec           3t5 4b9 (5)   4t15 4b15 (4) 1t3 3b4 (6)
    10  2014 "Boulder • Speed\nIFSC Climbing Worldcup (B,S) - Baku (AZE) 2014\nBaku\n3 - 4\nMay"                                      Baku (AZE)         World cup    women  <chr [39]>     37 Konul Huseynova         0t 0b (37)    <NA>          <NA>
    11  2014 "Lead • Boulder • Speed\nIFSC Climbing Worldcup (L, B, S) - Haiyang (CHN) 2014\nHaiyang\n20 - 22\nJun"                   Haiyang (CHN)      World cup    men    <chr [26]>     18 Jabee Kim               2t5 4b10 (15) 0t 1b3 (18)   <NA>
    12  2013 "Boulder\nIFSC Climbing Worldcup (B) - Vail (USA) 2013\nVail\n7 - 8\nJun"                                                Vail (USA)         World cup    women  <chr [38]>     12 Monika Retschy          4t6 5b5 (6)   0t 1b1 (12)   <NA>
    13  2012 "Boulder\nIFSC Climbing Worldcup (B) - Munich (GER) 2012\nMunich\n25 - 26\nAug"                                          Munich (GER)       World cup    women  <chr [52]>     27 Diane Merrick           2t4 5b11 (27) <NA>          <NA>
    14  2010 "Boulder\nIFSC Climbing Worldcup (B) - Eindhoven (NED) 2010\nWC Eindhoven\n25 - 26\nJun"                                 Eindhoven (NED)    World cup    women  <chr [41]>     39 Radka Petkova           0t 3b3 (39)   <NA>          <NA>
    15  2009 "Boulder\nIFSC Climbing Worldcup (B) - Hall (AUT) 2009\nWC Hall\n1 - 2\nMay"                                             Hall (AUT)         World cup    women  <chr [48]>     31 Diane Merrick           2t3 5b5 (16)  <NA>          <NA>
    16  2009 "Boulder\nIFSC Climbing Worldcup (B) - Vail (USA) 2009\nWC Vail\n5 - 6\nJun"                                             Vail (USA)         World cup    men    <chr [41]>     14 Julian Bautista         4t6 5b8 (20)  1t2 2b5 (14)  <NA>
    17  2009 "Lead • Boulder • Speed • Combined\nIFSC Climbing World Championships - Qinghai (CHN) 2009\nQuinghai\n30 - 5\nJun - Jul" Qinghai (CHN)      World champs men    <chr [70]>      6 Sean McColl             4t5 4b4 (6)   3t5 3b4 (4)   3t4 4b5 (6)
    18  2009 "Lead • Boulder • Speed • Combined\nIFSC Climbing World Championships - Qinghai (CHN) 2009\nQuinghai\n30 - 5\nJun - Jul" Qinghai (CHN)      World champs women  <chr [52]>     41 Nadezhda Bryakina       1t2 1b2 (41)  <NA>          <NA>
    19  2007 "Lead • Boulder • Speed\nIFSC Climbing World Championship (L + B + S) - Aviles (ESP) 2007\nAviles\n17 - 23\nSep"         Aviles (ESP)       World champs men    <chr [132]>    55 Ignasi TARRAZONA GASQUE 2t2 3b3 (28)  <NA>          <NA>
    20  2004 "Boulder\nUIAA Worldcup - Bardonecchia (ITA) 2004\nBardonecchia\n19 - 21\nAug"                                           Bardonecchia (ITA) World cup    women  <chr [28]>      8 Nataliya Perlova        <NA>          <NA>          <NA>

One more step till our data is in true long format, _i.e._, one row per athlete per round within each competition.
This is just `tidyr::pivot_longer()` again with the `cols=` argument set to columns from `qualification` to `final`:

```r
boulder_data <- boulder_data |>
    dplyr::select(-results) |>
    tidyr::pivot_longer(cols = qualification:final, names_to = "round", values_to = "score")
```

Et voilà!

    # A tibble: 6 × 9
       year full_title                                                                              location        type      gender  rank athlete         round         score
      <int> <chr>                                                                                   <chr>           <chr>     <chr>  <dbl> <chr>           <chr>         <chr>
    1  2022 "Boulder\nIFSC - Climbing World Cup (B) - Meiringen (SUI) 2022\nMeiringen\n8 - 10\nApr" Meiringen (SUI) World cup men        1 Tomoa Narasaki  qualification 4T5z 6 8 (1)
    2  2022 "Boulder\nIFSC - Climbing World Cup (B) - Meiringen (SUI) 2022\nMeiringen\n8 - 10\nApr" Meiringen (SUI) World cup men        1 Tomoa Narasaki  semi-final    4T4z 14 11 (2)
    3  2022 "Boulder\nIFSC - Climbing World Cup (B) - Meiringen (SUI) 2022\nMeiringen\n8 - 10\nApr" Meiringen (SUI) World cup men        1 Tomoa Narasaki  final         2T3z 3 6 (1)
    4  2022 "Boulder\nIFSC - Climbing World Cup (B) - Meiringen (SUI) 2022\nMeiringen\n8 - 10\nApr" Meiringen (SUI) World cup men        2 Yoshiyuki Ogata qualification 4T5z 10 13 (3)
    5  2022 "Boulder\nIFSC - Climbing World Cup (B) - Meiringen (SUI) 2022\nMeiringen\n8 - 10\nApr" Meiringen (SUI) World cup men        2 Yoshiyuki Ogata semi-final    2T4z 5 6 (5)
    6  2022 "Boulder\nIFSC - Climbing World Cup (B) - Meiringen (SUI) 2022\nMeiringen\n8 - 10\nApr" Meiringen (SUI) World cup men        2 Yoshiyuki Ogata final         2T3z 5 19 (2)

With the data set in the long format, we can now start extracting information from the `full_title` and `score` columns.
Let's start with the former.

### Extracting event dates

Now, technically, it would be a better idea to work with this column before we unnested our data as it now contains about 100 times more rows but that felt out of order within the narrative of the blog.
Besides the computational overheads are not going to be significant, so who really cares?

OK, so the only interesting bit of data that we don't yet have in a dedicated column is the start and end date of the event.
What we need is to extract the relevant bits of the individual `character` string.
I have a personal preference for doing this kind of thing using [regular expressions](https://cran.r-project.org/web/packages/stringr/vignettes/regular-expressions.html) but again, different folks, different strokes...

In order to do this my way, we need to identify the pattern that tells the computer which pieces of the string to grab and which ones to disregard.
Looking at the `full_title` column, we can see that the dates are the last bit of each of the string:

"\[beginning-of-string\]...whatever...\[digit(s)\] - \[digit(s)\]"

We can translate this pattern into regular expressions like so:

<div class="hl-inline-code">

<style>
    .hl-inline-code code {
        color: rgb(var(--theme-col));
        font-weight: 600
    }
</style>

`"^.*?\\d+ - \\d+\\n[A-z]+$"`, where:

-   `^` and `$` stand for beginning and end of string, respectively
-   `\\d` stands for digit
-   `[A-z]` means any upper- or lower-case letter
-   `\\` is simply the escaped backslash
-   `.` is any character
-   `+` means _one or more_ occurrences of the preceding character
-   `*` means _zero or more_ occurrences of the preceding character
-   `?` indicates lazy search; it tells the program to grab _as few instances_ identified by the preceding expression _as possible so that the entire pattern still makes sense_

With this in mind, let's break down the entire pattern:

<div class="no-marker">

-   `^.*?` - starting from the beginning of a string, find any characters but only as few as possible for the rest of the pattern to still be valid
-   `\\d+` - then, find one or more digits
-   `-`  - then a space, followed by a dash, followed by another space
-   `\\d+` - then again, one or more digits
-   `\\n` - then the line break character `\n`
-   `[A-z]+$` - and finally any letter (big or small) at the end of the string

</div>

Great, so now we have a pattern that identifies the individual components of interest but we also need to tell the program to _extract_ them.
For this, we can use the grouping operators `()`, to get:

`"^.*?(\\d+ - \\d+\\n[A-z]+)$"`

</div>

All we have to do now is replace the identified pattern with the part captured within the parentheses using the `sub()` function:

```r
sub(pattern = "^.*?(\\d+ - \\d+\\n[A-z]+)$",
    replacement = "\\1" , # \\1 just inserts the group inside of the first set of ()s
    x = "Boulder\nIFSC - Climbing World Cup (B) - Meiringen (SUI) 2022\nMeiringen\n8 - 10\nApr")
```

    [1] "8 - 10\nApr"

This is already pretty neat but we can do even better.
We can identify multiple groups with `()`s, not just one, which allows us to do something like this:

```r
sub(pattern = "^.*?(\\d+) - (\\d+)\\n([A-z]+)$",
    replacement = "\\1-\\3; \\2-\\3" , # \\1 just inserts the group inside of the first set of ()s
    x = "Boulder\nIFSC - Climbing World Cup (B) - Meiringen (SUI) 2022\nMeiringen\n8 - 10\nApr")
```

    [1] "8-Apr; 10-Apr"

What's more, if we know the year, we can insert it in the `replacement=` string:

```r
year <- 2022
sub(pattern = "^.*?(\\d+) - (\\d+)\\n([A-z]+)$",
    replacement = paste0("\\1-\\3-", year, "; \\2-\\3-", year), # \\1 just inserts the group inside of the first set of ()s
    x = "Boulder\nIFSC - Climbing World Cup (B) - Meiringen (SUI) 2022\nMeiringen\n8 - 10\nApr")
```

    [1] "8-Apr-2022; 10-Apr-2022"

Awesome!
A couple more things though.
Firstly, every time I work with white spaces, I like to account for the option of there being two spaces instead of one or even maybe a tab character.
To do that, we can replace the spaces in our patter with `\\s+` meaning one or more white characters.

Secondly, and much more importantly, our regular expression above doesn't account for the possibility of an event spilling into two calendar months.
For these cases, we need a different pattern:

```r
year <- 2016
sub(pattern = "^.*?(\\d+)\\s*-\\s*(\\d+)\\n([A-z]+)\\s*-\\s*([A-z]+)$",
    replacement = paste0("\\1-\\3-", year, "; \\2-\\4-", year), # \\1 just inserts the group inside of the first set of ()s
    x = "Boulder  Speed\nIFSC Climbing Worldcup (B, S) - Chongqing (CHN) 2016\nChongqingWC\n30 - 1\nApr - May")
```

    [1] "30-Apr-2016; 1-May-2016"

Putting it all together, we can _conditionally_ create a new column `dates` in our data set using `dplyr::mutate()` and `dplyr::ifelse()`, and then separate it into `start` and `end` variables and convert the strings to dates.
The only caveat here is that, to put the correct year inside the `replacement=` argument, we have to perform the operation by row.
Otherwise we would essentially be passing the entire vector of years to the `paste0()` function.
This function would then only use the first element, which would result in all dates having the year 2022 in them.
Running the `dplyr::mutate()` command in a row-wise fashion gets around this problem.
This is exactly what `dplyr::rowwise()` is for:

```r
boulder_data <- boulder_data |>
    dplyr::rowwise() |>
    dplyr::mutate(
        date = dplyr::if_else(
            grepl("^.*?(\\d+) - (\\d+)\\n([A-z]+)$", full_title),
            sub(pattern = "^.*?(\\d+) - (\\d+)\\n([A-z]+)$",
                replacement = paste0("\\1-\\3-", year, "; \\2-\\3-", year),
                x = full_title),
            sub(pattern = "^.*?(\\d+) - (\\d+)\\n([A-z]+)\\s*-\\s*([A-z]+)$",
                replacement = paste0("\\1-\\3-", year, "; \\2-\\4-", year),
                x = full_title)
        )
    ) |>
    tidyr::separate(date, c("start", "end"), sep = "; ") |>
    dplyr::mutate(
        dplyr::across(start:end, ~ as.Date(.x, format = "%d-%b-%Y"))
    )
```

The `dplyr::across(...)` bit applies the `as.Date()` function to all columns from the column `start` to the column `end` (so just these two, really), converting the strings to dates.
Here's another random 20 rows showing that it worked:

    # A tibble: 20 × 3
       full_title                           start      end
       <chr>                                <date>     <date>
     1 "...Innsbruck\n22 - 26\nJun"         2022-06-22 2022-06-26
     2 "...Innsbruck\n22 - 26\nJun"         2022-06-22 2022-06-26
     3 "...MoscowWC\n12 - 14\nApr"          2019-04-12 2019-04-14
     4 "...WujiangWC\n3 - 5\nMay"           2019-05-03 2019-05-05
     5 "...MunichWC\n18 - 19\nMay"          2019-05-18 2019-05-19
     6 "...ChongqingWC\n5 - 6\nMay"         2018-05-05 2018-05-06
     7 "...MunichWC\n17 - 18\nAug"          2018-08-17 2018-08-18
     8 "...MunichWC\n17 - 18\nAug"          2018-08-17 2018-08-18
     9 "...ChongqingWC\n22 - 23\nApr"       2017-04-22 2017-04-23
    10 "...TokyoWC\n6 - 7\nMay"             2017-05-06 2017-05-07
    11 "...MeiringenWC\n15 - 16\nApr"       2016-04-15 2016-04-16
    12 "...ChongqingWC\n30 - 1\nApr - May"  2016-04-30 2016-05-01
    13 "...Haiyang\n26 - 27\nJun"           2015-06-26 2015-06-27
    14 "...Milano\n14 - 17\nApr"            2011-04-14 2011-04-17
    15 "...WCH Arco 2011\n15 - 24\nJul"     2011-07-15 2011-07-24
    16 "...WC Eindhoven\n25 - 26\nJun"      2010-06-25 2010-06-26
    17 "...WC Kazo\n11 - 12\nApr"           2009-04-11 2009-04-12
    18 "...WC Hall\n1 - 2\nMay"             2009-05-01 2009-05-02
    19 "...FIERA DI PRIMIERO\n13 - 14\nJun" 2008-06-13 2008-06-14
    20 "...Grindelwald\n8 - 9\nJun"         2007-06-08 2007-06-09

### Parsing scores

With the dates out of the way, let's now turn to the `score` column.
We previously noticed that there are two formats in which the scores are recorded, _e.g._, "4T5z 6 8 (1)" and "4t6 5b8 (1)".
This discrepancy stems from the fact that the scoring system (explained briefly in {{< link "Part 1" "blog/01_boulder_viz_pt1/index.md" "a-rough-guide-to-competitive-bouldering" >}}) was changed as part of a general rules revision in 2018.
The relevant change here is that the "bonus" holds got renamed to "zone" holds, which explains the change from "b" to "z" in the scores.
Furthermore, the notation has changed from "No. tops/attempts No. bonuses/attempts" to "No. tops/No.zones top attempts zone attempts".
Actually, the two scores at the start of this paragraph are equivalent: four tops in six attempts and five bonuses/zones in 8 attempts.
Finally, the number in parentheses represents the athlete's rank in the given round of the competition.

I think that the best way of extracting data from the scores is to separate them into five columns: `tops`, `zones`, `top_attempts`, `zone_attempts`, and `round_rank`.
We can go about it in a very similar way to how we treated the start and end dates.
We just need to keep in mind that, because of the variability in score notation, we need two regular expression patterns:

```r
sub("(\\d)T(\\d)z\\s+(\\d+)\\s+(\\d+)\\s+\\((\\d+)\\)", "\\1; \\3; \\2; \\4; \\5", "4T5z 6 8 (1)")
```

    [1] "4; 6; 5; 8; 1"

```r
sub("(\\d)t(\\d+)\\s+(\\d)b(\\d+)\\s+\\((\\d+)\\)", "\\1; \\2; \\3; \\4; \\5", "4t6 5b8 (1)")
```

    [1] "4; 6; 5; 8; 1"

The only new expressions here are `\\(` and `\\)` which stands for literal `()`s rather than groups to be captured.

There's one more catch, because, of course there is!
Because the boulders at the world events are pretty tough, it can happen that an athlete doesn't manage to get a single top or a bonus.
In the new scoring system, that is not a problem, they just get a score of 0T0z 0 0 but in the old system, that would only be 0t 0b.
Obviously, this breaks our pattern matching expression!

Luckily, there's an easy way out of this issue: we can just replace `"b\\s"` with `"b0 "` and `"t\\s"` with `"t0 "`.

OK, let's see how we can code this all up.
First, it would be good to take care of the "DNS" (did not start) scores by replacing them with "0T0z 0 0 (00)".
Next, we take care of the 0 top/bonus cases.
Then, we can do the pattern replacement but let's make it case insensitive, in case the Ts, zs, and bs can be either upper- or lower-case.
As the next step, let's then separate the individual pieces of data into their respective columns.
And finally, since this is all we need to do with this data set, let's use `dplyr::select()` to rearrange the columns and get rid of the ones we don't need.

```r
boulder_data <- boulder_data |>
    dplyr::mutate(
        score = gsub("DNS", "0T0z 0 0 (00)", score),
        score = gsub("t\\s", "t0 ", score, ignore.case = TRUE),
        score = gsub("b\\s", "b0 ", score, ignore.case = TRUE),
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
    tidyr::separate(
        score,
        into = c("tops", "top_attempts", "zones", "zone_attempts", "round_rank"),
        sep = "; "
    ) |>
    dplyr:: select(
        year, start, end, location, type, gender, rank, athlete, round, tops,
        top_attempts, zones, zone_attempts, round_rank
    )
```

And that's it; we made it! :tada::tada::tada:

Here's the top 30 rows of the final data, formatted as a nice table.
If you want, you can compare it to the table at the top of this post to make sure they are identical.

<div class="scroll-tab" data-height="337px">

| year | start      | end        | location        | type      | gender | rank | athlete           | round         | tops | top_attempts | zones | zone_attempts | round_rank |
| ---: | :--------- | :--------- | :-------------- | :-------- | :----- | ---: | :---------------- | :------------ | :--- | :----------- | :---- | :------------ | :--------- |
| 2022 | 2022-04-08 | 2022-04-10 | Meiringen (SUI) | World cup | men    |    1 | Tomoa Narasaki    | qualification | 4    | 6            | 5     | 8             | 1          |
| 2022 | 2022-04-08 | 2022-04-10 | Meiringen (SUI) | World cup | men    |    1 | Tomoa Narasaki    | semi-final    | 4    | 14           | 4     | 11            | 2          |
| 2022 | 2022-04-08 | 2022-04-10 | Meiringen (SUI) | World cup | men    |    1 | Tomoa Narasaki    | final         | 2    | 3            | 3     | 6             | 1          |
| 2022 | 2022-04-08 | 2022-04-10 | Meiringen (SUI) | World cup | men    |    2 | Yoshiyuki Ogata   | qualification | 4    | 10           | 5     | 13            | 3          |
| 2022 | 2022-04-08 | 2022-04-10 | Meiringen (SUI) | World cup | men    |    2 | Yoshiyuki Ogata   | semi-final    | 2    | 5            | 4     | 6             | 5          |
| 2022 | 2022-04-08 | 2022-04-10 | Meiringen (SUI) | World cup | men    |    2 | Yoshiyuki Ogata   | final         | 2    | 5            | 3     | 19            | 2          |
| 2022 | 2022-04-08 | 2022-04-10 | Meiringen (SUI) | World cup | men    |    3 | Mejdi Schalck     | qualification | 4    | 10           | 5     | 10            | 11         |
| 2022 | 2022-04-08 | 2022-04-10 | Meiringen (SUI) | World cup | men    |    3 | Mejdi Schalck     | semi-final    | 3    | 8            | 4     | 5             | 3          |
| 2022 | 2022-04-08 | 2022-04-10 | Meiringen (SUI) | World cup | men    |    3 | Mejdi Schalck     | final         | 2    | 7            | 3     | 9             | 3          |
| 2022 | 2022-04-08 | 2022-04-10 | Meiringen (SUI) | World cup | men    |    4 | Paul Jenft        | qualification | 4    | 8            | 5     | 17            | 9          |
| 2022 | 2022-04-08 | 2022-04-10 | Meiringen (SUI) | World cup | men    |    4 | Paul Jenft        | semi-final    | 2    | 5            | 4     | 7             | 6          |
| 2022 | 2022-04-08 | 2022-04-10 | Meiringen (SUI) | World cup | men    |    4 | Paul Jenft        | final         | 2    | 15           | 3     | 18            | 4          |
| 2022 | 2022-04-08 | 2022-04-10 | Meiringen (SUI) | World cup | men    |    5 | Colin Duffy       | qualification | 5    | 14           | 5     | 12            | 3          |
| 2022 | 2022-04-08 | 2022-04-10 | Meiringen (SUI) | World cup | men    |    5 | Colin Duffy       | semi-final    | 3    | 10           | 4     | 12            | 4          |
| 2022 | 2022-04-08 | 2022-04-10 | Meiringen (SUI) | World cup | men    |    5 | Colin Duffy       | final         | 1    | 19           | 4     | 27            | 5          |
| 2022 | 2022-04-08 | 2022-04-10 | Meiringen (SUI) | World cup | men    |    6 | Kokoro FUJII      | qualification | 4    | 16           | 4     | 7             | 17         |
| 2022 | 2022-04-08 | 2022-04-10 | Meiringen (SUI) | World cup | men    |    6 | Kokoro FUJII      | semi-final    | 4    | 12           | 4     | 8             | 1          |
| 2022 | 2022-04-08 | 2022-04-10 | Meiringen (SUI) | World cup | men    |    6 | Kokoro FUJII      | final         | 1    | 4            | 3     | 27            | 6          |
| 2022 | 2022-04-08 | 2022-04-10 | Meiringen (SUI) | World cup | men    |    7 | Yuji Inoue        | qualification | 3    | 16           | 5     | 12            | 11         |
| 2022 | 2022-04-08 | 2022-04-10 | Meiringen (SUI) | World cup | men    |    7 | Yuji Inoue        | semi-final    | 2    | 8            | 4     | 9             | 7          |
| 2022 | 2022-04-08 | 2022-04-10 | Meiringen (SUI) | World cup | men    |    7 | Yuji Inoue        | final         | NA   | NA           | NA    | NA            | NA         |
| 2022 | 2022-04-08 | 2022-04-10 | Meiringen (SUI) | World cup | men    |    8 | Maximillian Milne | qualification | 4    | 7            | 5     | 9             | 7          |
| 2022 | 2022-04-08 | 2022-04-10 | Meiringen (SUI) | World cup | men    |    8 | Maximillian Milne | semi-final    | 2    | 9            | 4     | 20            | 8          |
| 2022 | 2022-04-08 | 2022-04-10 | Meiringen (SUI) | World cup | men    |    8 | Maximillian Milne | final         | NA   | NA           | NA    | NA            | NA         |
| 2022 | 2022-04-08 | 2022-04-10 | Meiringen (SUI) | World cup | men    |    9 | Keita Dohi        | qualification | 3    | 7            | 4     | 5             | 13         |
| 2022 | 2022-04-08 | 2022-04-10 | Meiringen (SUI) | World cup | men    |    9 | Keita Dohi        | semi-final    | 2    | 4            | 3     | 3             | 9          |
| 2022 | 2022-04-08 | 2022-04-10 | Meiringen (SUI) | World cup | men    |    9 | Keita Dohi        | final         | NA   | NA           | NA    | NA            | NA         |
| 2022 | 2022-04-08 | 2022-04-10 | Meiringen (SUI) | World cup | men    |   10 | Manuel Cornu      | qualification | 4    | 15           | 5     | 13            | 13         |
| 2022 | 2022-04-08 | 2022-04-10 | Meiringen (SUI) | World cup | men    |   10 | Manuel Cornu      | semi-final    | 2    | 7            | 3     | 10            | 10         |
| 2022 | 2022-04-08 | 2022-04-10 | Meiringen (SUI) | World cup | men    |   10 | Manuel Cornu      | final         | NA   | NA           | NA    | NA            | NA         |

</div>

## Outro

This was quite a long blog but I think you'll agree that we've covered quite a lot of ground.
If you're interested, below, you can find the complete code, all in one place.
Cool what you can do with about 80 lines of code...

<div class="foldable">

```r
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
```

</div>

I think this is a good time to conclude Part 2.
Like I said at the beginning, there are a few more things that need doing to get the data required for the visualisation we're recreating.
If you'd like me to add them to this post, let me know in the comments.

See you in {{< link "Part 3" "blog/03_boulder_viz_pt3/index.md" >}} for some HTML, CSS, and JavaScript.
What a time to be alive!

[^1]: [JavaScript Object Notation](https://www.json.org/json-en.html)
