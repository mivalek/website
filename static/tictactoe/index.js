let dims, win_at
let player = ["cross", "nought"]
let data = []
let move_no = 0
ttt = document.getElementById("ttt-container")

function move(e) {
    let draw = false
    x = e.target
    x.classList.add(player[0], "ticked")
    x.removeEventListener("click", move)
    data[x.getAttribute("row")][x.getAttribute("col")] = player[0] == "cross" ? 0 : 1
    checkBoard()    
    if (game_over) {
        document.querySelectorAll(".box").forEach(e => e.removeEventListener("click", move))
        document.querySelector(".info.active").classList.add("winner")
        document.getElementById("result").innerText = `Player ${player[0] == "cross" ? 1 : 2} won!`
        document.getElementById("top-row").classList.add("active")
        return
    }
    move_no += 1
    if (move_no == dims ** 2) {
        ttt.classList.add("draw")
        document.querySelectorAll(".info").forEach(el => el.classList.remove("active"))
        game_over = true
        document.getElementById("result").innerText = "That's a draw!"
        document.getElementById("top-row").classList.add("active")
        return
    }
    document.querySelectorAll(".info").forEach(el => el.classList.toggle("active"))
    player = player.reverse()
}

function checkBoard() {
    current_player = player[0] == "cross" ? 0 : 1
    bool_data = data.map(row => row.map(cell => cell == current_player))
    for (let i = 0; i < dims - (win_at - 1); i++) {
        for (let j = 0; j < dims - (win_at - 1); j++) {
            const kernel = bool_data.slice(i, i + win_at).map(x => x.slice(j, j + win_at))
            // rows
            const winner_row = kernel.map(x => x.every(y => y)).indexOf(true)
            if (winner_row >= 0) {
                // highlight
                row_to_hl = document.querySelectorAll(`[row="${i + winner_row}"]`)

                for (let c = j; c < j + win_at; c++) {
                    row_to_hl[c].classList.add("win")         
                }
                game_over = true
                return
            }
            // cols
            for (let c = 0; c < win_at; c++) {
                const is_winner_col = kernel.map(x => x[c]).every(x => x)
                if (is_winner_col) {
                    // highlight
                    col_to_hl = document.querySelectorAll(`[col="${j + c}"]`)
                    for (let r = i; r < i + win_at; r++) {
                        col_to_hl[r].classList.add("win")         
                    }
                    game_over = true
                    return
                }
            }
            // diag
            const diag = kernel.map((x, i) => x[i])
            if (diag.every(x => x)) {
                // highlight
                for (let ind = 0; ind < win_at; ind++) {
                    document.querySelector(`[row="${i + ind}"][col="${j + ind}"]`).classList.add("win")                 
                }
                game_over = true
                return
            }
            // antidiag
            const antidiag = kernel.map((x, i) => x[win_at - 1 - i])
            if (antidiag.every(x => x)) {
                // highlight
                for (let ind = 0; ind < win_at; ind++) {
                    document.querySelector(`[row="${i + ind}"][col="${j + win_at - ind - 1}"]`).classList.add("win")                 
                }                
                game_over = true
                return
            }
        }
    }
    return
}

function checkDiag(x) {
    hits = 0 
    cells_to_hl = []  
    for (let i = 0; i < dims; i++) {
        for (let j = 0; j < dims; j++) {
            if (!x[i][j]) {
                hits = 0
                cells_to_hl = 0
                continue
            }

        }
    }
}

document.getElementById("board_size").addEventListener("input", (e) => {
    const other_slider = document.getElementById("win_at")
    if (+e.target.value < +other_slider.value) other_slider.value = e.target.value
    init()
})
document.getElementById("win_at").addEventListener("input", (e) => {
    other_slider = document.getElementById("board_size")
    if (+e.target.value > +other_slider.value) e.target.value = other_slider.value
    init()
})
function init() {
    dims = +document.getElementById("board_size").value
    win_at = +document.getElementById("win_at").value
    if (win_at > dims) win_at = dims
    ttt.querySelectorAll(".box").forEach(el => el.remove())
    document.getElementById("top-row").classList.remove("active")
    ttt.style.gridTemplateColumns = `repeat(${dims}, max-content)`
    move_no = 0
    game_over = false
    document.querySelectorAll(".info").forEach(el => el.classList.remove("active", "winner"))
    document.querySelector(".info").classList.add("active")

    for (let i = 0; i < dims; i++) {
        data[i] = []
        for (let j = 0; j < dims; j++) {
            data[i][j] = null
            const box = document.createElement("DIV")
            box.classList.add("box")
            box.setAttribute("row", i)
            box.setAttribute("col", j)
            box.addEventListener("click", move)
            ttt.append(box)
        }
    }
}

init()