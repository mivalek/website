---
title: Goodbye cruel world
date: "2022-06-11"
tags:
    - personal
    - education
draft: true
---

## Intro

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

```python
import numpy as np

for i in range(0, 10):
    print(i)

x = np.randInt(0)
```

a

```r
ifsc_data <- jsonlite::fromJSON(readLines("C:/Users/mv298/OneDrive/Documents/ifsc_data/raw_data_2004_2022.json"), flatten = T)

ifsc_data <- ifsc_data |> dplyr::filter(year > 2003)

error_ind <- ifsc_data |>
  apply(1, \(x) length(x$results.Combined.men) == 1) |>
  unlist() |> which() |> unname()

boulder_ind <- ifsc_data |>
  apply(1, \(x) !(is.null(x$results.Boulder.men) |
                    is.null(x$results.Boulder.women))) |> unlist()

boulder_data <- ifsc_data[boulder_ind, ] |> dplyr::select(
  year, name, results.location, results.type, results.Boulder.men, results.Boulder.women
)
```

## Blah

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.

# Di dah
