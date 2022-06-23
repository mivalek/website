function buildAllMenus(
    interactive = true,
    tabs = true,
    hover = false,
    click = false
) {
    for (const i of Object.keys(menu)) {
        buildMenu(i, getData(i, menu).data, interactive, tabs, hover, click);
    }
}

function buildMenu(drink, data, interactive = false, tabs, hover, click) {
    const newMenuCont = document.querySelector(`#${drink}-container`);
    const header = newMenuCont.querySelector("thead tr");
    const tab = newMenuCont.querySelector("tbody");
    const menuKeys = Object.keys(data[0]).slice(0, -1);
    menuKeys.forEach((m) => {
        const headerColumn = document.createElement("th");
        headerColumn.id = m;
        headerColumn.innerText = m;
        header.appendChild(headerColumn);
    });
    for (let i = 0; i < data.length; i++) {
        const row = document.createElement("tr");
        let j = 0;
        for (const key in data[i]) {
            if (key === "n") continue;
            const cell = document.createElement("td");
            cell.classList.add(key);
            cell.setAttribute("col", j);
            cell.setAttribute("row", data[i].n);
            if (key.includes("price")) {
                cell.classList.add("price");
            } else if (data[i][key]) {
                cell.classList.add(
                    data[i][key].replace(" ", "-"),
                    "ingredient"
                );
            }
            cell.innerText = data[i][key];
            row.appendChild(cell);
            j++;
        }
        tab.appendChild(row);
    }
    newMenuCont.classList.remove("hidden");
    const newMenu = newMenuCont.querySelector(".menu");
    const thisHeight = Math.min(tab.parentElement.scrollHeight + 6, 400);
    newMenu.style.height = thisHeight + "px";
    newMenuCont.parentElement.style.height = thisHeight + 90 + "px";
    if (interactive) {
        makeTableInteractive(newMenuCont, tabs, hover, click);
    } else {
        document
            .querySelectorAll(".menu-select")
            .forEach((el) => el.removeEventListener("click", clickMenuTab));
    }
}

function hideMenu(drink) {
    const newMenuCont = document.querySelector(`#${drink}-container`);
    newMenuCont.classList.remove("interactive", "active");
    newMenuCont.classList.add("hidden");
    newMenuCont.querySelector("thead tr").innerHTML = "";
    newMenuCont.querySelector("tbody").innerHTML = "";
}

function hideAllMenus() {
    for (const i of Object.keys(menu)) {
        hideMenu(i);
    }
}

function getMenu(drink) {
    return new Promise((resolve) => {
        menuSound.play().then(() => {
            document
                .querySelectorAll(`.menu-container`)
                .forEach((el) => el.classList.remove("active"));
            toggleActive(document.querySelector(`#${drink}-container`));
            activeMenu = drink;
            resolve();
        });
    });
}

function makeTableInteractive(div, tabs, hover, click) {
    div.classList.add("interactive");
    if (hover) {
        div.querySelectorAll("td").forEach((el) => {
            el.addEventListener("mouseover", (e) => {
                const cell = e.target;
                const selectedCol = document.querySelector(
                    `.active th#${cell.classList[0]}`
                );
                selectedCol.classList.add("highlight");
                document.querySelector("#s1").innerText = selectedCol.innerText;
                cell.classList.add("hover");
                const row = cell.getAttribute("row");
                const column = cell.getAttribute("col");
                document
                    .querySelectorAll(`.active td[col="${column}"]`)
                    .forEach((element, i) => {
                        if (i < +row) {
                            element.classList.add("ghost");
                        }
                    });
                let filter = [];
                document
                    .querySelectorAll(`.active .ingredient[row="${row}"]`)
                    .forEach((el) => filter.push(el.innerText));
                document
                    .querySelectorAll(".filter-condition")
                    .forEach((el, i) => {
                        el.querySelector(".filter-value").innerText = filter[i];
                        el.classList.add("show");
                    });
                document
                    .querySelectorAll(`.active td[row="${row}"]`)
                    .forEach((element, i) => {
                        if (i < 3) {
                            element.classList.add("highlight");
                        } else if (i < +column) {
                            element.classList.add("ghost");
                        }
                    });
            });
            el.addEventListener("mouseout", (e) => {
                const cell = e.target;
                document
                    .querySelector(`.active #${cell.classList[0]}`)
                    .classList.remove("highlight");
                document
                    .querySelectorAll("#s1, .filter-value")
                    .forEach((el) => (el.innerText = ""));
                document
                    .querySelectorAll(".filter-condition")
                    .forEach((el, i) => {
                        el.classList.remove("show");
                    });
                cell.classList.remove("hover");
                cell.parentElement.parentElement
                    .querySelectorAll("td")
                    .forEach((element) => {
                        element.classList.remove("ghost");
                        element.classList.remove("highlight");
                    });
            });
        });
    }
    if (tabs) {
        document.querySelectorAll(".menu-select").forEach((el) => {
            el.addEventListener("click", clickMenuTab);
        });
    }
    if (click) {
        div.querySelectorAll("td").forEach((el) => {
            el.addEventListener("click", (e) => {
                const cell = e.target;
                console.log({
                    row: +cell.getAttribute("row"),
                    col: +cell.getAttribute("col"),
                });
                userSelected = {
                    row: +cell.getAttribute("row"),
                    col: +cell.getAttribute("col"),
                };
            });
            el.addEventListener("mouseover", (e) =>
                e.target.classList.add("hover")
            );
            el.addEventListener("mouseout", (e) =>
                e.target.classList.remove("hover")
            );
        });
    }
}

function clickMenuTab(e) {
    stopHighlight();
    getMenu(
        e.target.parentElement.parentElement.id.replace("-container", "")
    ).then(() => {
        const selectedData = document.querySelector(
            ".active .menu-select .label"
        ).innerText;
        setUpCodeShowConsole(selectedData);
    });
}

function setUpCodeShowConsole(menu) {
    const dataSpan = document.querySelector("span#data");
    if (dataSpan) {
        dataSpan.innerText = menu;
        const filterVars = document.querySelectorAll(".filter-var");
        if (menu == "bubble_tea") {
            filterVars[0].innerText = "tea";
            filterVars[1].innerText = "milk";
            filterVars[2].innerText = "topping";
        } else {
            filterVars[0].innerText = "milk";
            filterVars[1].innerText = "syrup";
            filterVars[2].innerText = "topping";
        }
    }
}

function setUpMenus() {
    hideAllMenus();
    hideError();
    buildAllMenus();
    getMenu("coffee");
}
