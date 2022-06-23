function addClearButton(element) {
    const btn = document.createElement("div");
    btn.classList.add("clear");
    btn.innerText = "x";
    element.appendChild(btn);
    btn.addEventListener("click", (e) => {
        e.target.parentElement.querySelector(".ss-content").innerHTML = "";
    });
}

function clearActiveConsole() {
    document.querySelector(".r-code-container.active .ss-content").innerHTML =
        "";
}

function checkCode(id) {
    const container = document.querySelector(`#${id} .ss-content`);
    const children = container.querySelectorAll(".code-block");
    let classes = [];
    for (const i of children) {
        classes.push(i.classList[1]);
    }
    let message = "";
    // selectArgs,
    // filterArgs;
    let syntaxCheck = checkSyntax(classes, children);
    message = syntaxCheck.message;
    if (message == "OK") {
        const codeString = container.innerText.replaceAll("\n", " ");
        const filter = codeString.match(/filter.*?\)/g);
        const select = codeString.match(/select.*?\)/g);
        if (select)
            select.forEach((el, i) => {
                const selectOK = checkSelect(el);
                if (selectOK !== "OK") {
                    const currentSelect =
                        container.querySelectorAll(".select")[i];
                    const funId = currentSelect.getAttribute("funid");
                    const selectLims = [];
                    children.forEach(function (el, i) {
                        if (el.getAttribute("funid") === funId)
                            selectLims.push(i);
                    });
                    throwError(
                        children,
                        selectLims[0],
                        selectLims[1],
                        selectOK
                    );
                    message = selectOK;
                }
            });
        if (filter)
            filter.forEach((el, i) => {
                const filterOK = checkFilter(el);
                if (filterOK !== "OK") {
                    const currentFilter =
                        container.querySelectorAll(".filter")[i];
                    const funId = currentFilter.getAttribute("funid");
                    const filterLims = [];
                    children.forEach(function (el, i) {
                        if (el.getAttribute("funid") === funId)
                            filterLims.push(i);
                    });
                    throwError(
                        children,
                        filterLims[0],
                        filterLims[1],
                        filterOK
                    );
                    message = filterOK;
                }
            });
    } else {
        throwError(
            children,
            syntaxCheck.from,
            syntaxCheck.to,
            syntaxCheck.message
        );
    }
    out = {
        codeOK: message === "OK",
        error: message === "OK" ? "" : message,
        data: message === "OK" ? children[0].innerText : [],
        code: container.innerText.replaceAll("\n", " ").split(" %>% "),
    };
    return out;
}

function checkSyntax(classes, children) {
    if (classes[0] !== "data")
        return {
            from: 0,
            to: 0,
            message: "Data (menu) must be entered first.",
        };
    const lastClass = classes[classes.length - 1];
    if (["pipe", "op"].includes(lastClass))
        return {
            from: classes.length - 1,
            to: classes.length - 1,
            message: "A command cannot end with an operator (%>%, &, ==).",
        };
    for (let i = 0; i < classes.length; i++) {
        // pipes in the right places
        if (
            classes[i] == "pipe" &&
            !(
                ["data", "bracket"].includes(classes[i - 1]) &&
                classes[i + 1] == "fun"
            )
        ) {
            return {
                from: i - 1,
                to: i + 1,
                message:
                    "The pipe (%>%) can only be used to join data and/or functions.",
            };
        }
        if (classes[i] == "fun") {
            if (classes[i - 1] != "pipe")
                return {
                    from: i - 1,
                    to: i,
                    message:
                        "Functions (filter(), select()) must follow pipes (%>%).",
                };
            if (classes[i + 1] != "col")
                return {
                    from: i,
                    to: i + 1,
                    message:
                        "First argument to function (filter(), select()) must be column.",
                };
        }
        if (classes[i] == "bracket") {
            if (!["col", "str"].includes(classes[i - 1]))
                return {
                    from: i - 1,
                    to: i,
                    message: "Invalid last argument to function.",
                };
            if (i + 1 < classes.length && classes[i + 1] != "pipe")
                return {
                    from: i,
                    to: i + 1,
                    message: "Invalid code after function.",
                };
        }
        if (classes[i] == "op") {
            const operator = children[i].classList[2];
            if (
                operator == "and" &&
                !(classes[i - 1] == "str" && classes[i + 1] == "col")
            )
                return {
                    from: i - 1,
                    to: i + 1,
                    message:
                        "The AND operator (&) must join two valid logical conditions.",
                };
            if (
                operator == "is" &&
                !(classes[i - 1] == "col" && classes[i + 1] == "str")
            )
                return {
                    from: i - 1,
                    to: i + 1,
                    message:
                        'The equality operator (==) compares content of a column to a "value"',
                };
        }
        if (
            classes[i] == "sep" &&
            !(
                ["data", "col"].includes(classes[i - 1]) &&
                classes[i + 1] == "col"
            )
        )
            return {
                from: i - 1,
                to: i + 1,
                message:
                    "Commas can only separate arguments, for example, columns to be selected.",
            };
        if (
            classes[i] == "str" &&
            !(
                classes[i - 1] == "op" &&
                ["op", "bracket"].includes(classes[i + 1])
            )
        )
            return {
                from: i - 1,
                to: i + 1,
                message:
                    'Invalid use of a character string (word in "quotes").',
            };
    }
    return { message: "OK" };
}

function checkSelect(string) {
    if (string.match(/["&=%]/)) return "Invalid code inside select().";
    if (string.match(/bubble_tea|coffee|chocolate/))
        return "Don't put data directly inside select(); Pipe them in.";
    return "OK";
}

function checkFilter(string) {
    if (string.match(/[,%]/)) return "Invalid code inside filter().";
    if (string.match(/bubble_tea|coffee|(?<!")chocolate/))
        return "Pon't put data directly inside filter(); Pipe them in.";
    if (!string.match("=")) return "filter() must contain a logical condition.";
    let x = string.replace("filter(", "").replace(")", "").split(/==|&/);
    for (const el of x) {
        if (el.match(/[A-z]" [A-z"]/)) return "Invalid code inside filter().";
    }
    return "OK";
}

function prefillCode(string, id) {
    let code = string.replaceAll("(", " ");
    code = code.replaceAll(")", " ) ");
    code = code.replaceAll(/("[a-z]+?)\s([a-z]+?")/g, "$1_$2");
    code.split(" ").forEach((el) => {
        if (el)
            makeCodeBlock(
                el.replace(/(".*?)_(.*?")/, "$1 $2"),
                (attach = false),
                (prefill = true),
                (codeContId = id)
            );
    });
    document
        .querySelectorAll(`.r-code-container`)
        .forEach((blk) => repositionBlocks(blk));
}

function getData(drink) {
    let newData = {};
    newData = menu[drink];
    // return data
    return { name: drink, data: newData };
}

function makeEmptyData(x) {
    let emptyData = Object.keys(x[0]).reduce((result, key) => {
        result[key] = "";
        return result;
    }, {});
    return emptyData;
}

function getArgs(call) {
    return call.replaceAll(/^.*?\( *| *\)/g, "");
}

function r_filter(data, cond) {
    const x = cond.split(/ == | & /);
    let column = [],
        value = [],
        invalidCols = [];
    for (let i = 0; i < x.length; i++) {
        i % 2 ? value.push(x[i]) : column.push(x[i]);
    }
    column.forEach((col) => {
        if (!Object.keys(data.data[0]).includes(col)) invalidCols.push(col);
    });
    let outData = { name: data.name };
    if (invalidCols.length) {
        outData.error = `Column${
            invalidCols.length == 1 ? "" : "s"
        } ${invalidCols
            .join(", ")
            .replace(/(.*),/, "$1 and")} not present in data.`;
        return outData;
    }
    let filterJScond = `d.${column[0]} == ${value[0]}`;
    for (let i = 1; i < column.length; i++) {
        const element = column[i];
        filterJScond = `${filterJScond} && d.${column[i]} == ${value[i]}`;
    }
    outData.data = data.data.filter((d) => eval(filterJScond));
    if (!outData.data.length) outData.data = [makeEmptyData(data.data)];
    return outData;
}

function r_select(data, cols) {
    const colArray = cols.split(/ ?, /);
    colArray.push("n");
    let invalidCols = [];
    colArray.forEach((col) => {
        if (!Object.keys(data.data[0]).includes(col)) invalidCols.push(col);
    });
    let outData = { name: data.name };
    if (invalidCols.length) {
        outData.error = `Column${
            invalidCols.length == 1 ? "" : "s"
        } ${invalidCols
            .join(", ")
            .replace(/(.*),/, "$1 and")} not present in data.`;
        return outData;
    }
    outData.data = data.data.map((r) => {
        const out = {};
        colArray.forEach((c) => (out[c] = r[c]));
        return out;
    });
    return outData;
}

function evalCode(code) {
    hideAllMenus();
    if (code.codeOK != true) return code.error;
    let data = getData(code.code[0]);
    for (let i = 1; i < code.code.length; i++) {
        const cmd = code.code[i];
        const args = getArgs(cmd);
        data = cmd.includes("filter")
            ? r_filter(data, args)
            : r_select(data, args);

        if (data.error) return data.error;
    }
    buildMenu(code.code[0], data.data);
    getMenu(code.code[0]);
    activeMenu = data.name;
    currentData = data.data;
    return true;
}

function runConsole(id) {
    hideError();
    if (!document.getElementById(id).querySelector(".ss-content").innerText) {
        buildAllMenus(true, true);
        getMenu("coffee");
    }
    result = evalCode(checkCode(id));
    if (result !== true) {
        error.play().then(() => {
            currentData = [];
            showError(result);
        });
    }
    return result;
}

function nextConsole(toggle = false, consoleBlockToggle = false) {
    woosh.play().then(() => {
        hideManual();
        if (toggle && !document.querySelector(".r-code-container.previous"))
            toggleArrow("back");
        const thisConsole = document.querySelector(".r-code-container.active");
        toggleActive(thisConsole);
        thisConsole.classList.add("previous");
        const nextConsole = document.querySelectorAll(".r-code-container.next");
        nextConsole[0].classList.remove("next");
        toggleActive(nextConsole[0]);
        if (nextConsole[0].classList.contains("shows-code")) {
            hideError();
            hideAllMenus();
            buildAllMenus(true, true, true, false);
            getMenu(activeMenu);
            setUpCodeShowConsole(activeMenu);
        }
        if (toggle && nextConsole.length == 1) toggleArrow("next");
        if (consoleBlockToggle)
            consoleEnabled ? disableConsole() : enableConsole();
    });
}

function previousConsole(toggle = false, consoleBlockToggle = false) {
    woosh.play().then(() => {
        hideManual();
        if (toggle && !document.querySelector(".r-code-container.next"))
            toggleArrow("next");
        const thisConsole = document.querySelector(".r-code-container.active");
        toggleActive(thisConsole);
        thisConsole.classList.add("next");
        const allPreviousConsoles = document.querySelectorAll(
            ".r-code-container.previous"
        );
        if (toggle && allPreviousConsoles.length == 1) toggleArrow("back");
        const prevConsole = allPreviousConsoles[allPreviousConsoles.length - 1];
        prevConsole.classList.remove("previous");
        if (prevConsole.classList.contains("runnable")) {
            hideAllMenus();
            buildAllMenus(true, true, false, false);
            getMenu(activeMenu);
        }
        toggleActive(prevConsole);
        if (consoleBlockToggle)
            consoleEnabled ? disableConsole() : enableConsole();
    });
}

function consoleBlocker(e) {
    if (e.key == "Enter") e.stopPropagation();
}

function disableConsole() {
    document.addEventListener("keydown", consoleBlocker, (useCapture = true));
    consoleEnabled = false;
}
function enableConsole() {
    document.removeEventListener(
        "keydown",
        consoleBlocker,
        (useCapture = true)
    );
    consoleEnabled = true;
}

function runManualCode(e) {
    if (e.key == "Enter") {
        e.stopPropagation();
        e.preventDefault();

        const consoleID = document.querySelector(".runnable.active").id;
        copyCodeToConsole(consoleID);
        codeOutput = runConsole(consoleID);
        onEnter();
    }
}

function addKeyboardIcon(consoleID, hlight = false) {
    kbd = document.getElementById("keyboard-icon").cloneNode(true);
    document.querySelector(`#${consoleID}`).appendChild(kbd);
    kbd.addEventListener("click", (e) => {
        const manualConsole = document.getElementById("console-manual");
        e.stopPropagation();
        const content = manualConsole.querySelector("#content-manual");
        content.innerText = document
            .querySelector(".runnable.active .ss-wrapper")
            .innerText.replaceAll(/(==|%>%|&|\)|".*?")/g, " $1 ")
            .replaceAll(/\n/g, " ")
            .replaceAll(/^\s+|\s+$/g, "");
        manualConsole.addEventListener("keydown", runManualCode);

        toggleActive(manualConsole);
        content.focus();
        const range = document.createRange(); //Create a range (a range is a like the selection but invisible)
        range.selectNodeContents(content); //Select the entire contents of the element with the range
        range.collapse(false); //collapse the range to the end point. false means collapse to end rather than the start
        const selection = window.getSelection(); //get the selection object (allows you to change selection)
        selection.removeAllRanges(); //remove any selections already made
        selection.addRange(range);
    });
    if (hlight) highlight(kbd);
}

function copyCodeToConsole(toID) {
    const text = document
        .getElementById("content-manual")
        .innerText.replaceAll(/(==|%>%|&|\)|".*?")/g, " $1 ")
        .replaceAll(/\n|^\s+|\s+$/g, "");
    clearActiveConsole();
    prefillCode(text, toID);
}

function hideManual() {
    document.getElementById("console-manual").classList.remove("active");
}

function mainConsoleFun() {
    sleep(50).then(() =>
        o.get().then(() => {
            if (o.complete) {
                o.logOrder(orderTally);
                if (customerData.length) {
                    o = new Order();
                    setUpMenus();
                } else {
                    const blackoutDiv = document.getElementById("blackout");
                    toggleActive(blackoutDiv);
                    sleep(400).then(() => {
                        hideAllMenus();
                        document.getElementById("bottom-panel").style =
                            "visibility:hidden;";
                        const nextButton =
                            document.getElementById("next-instruction");
                        nextButton.removeEventListener(
                            "click",
                            lastInstruction
                        );
                        nextButton.addEventListener("click", () => {
                            boss.exit();
                            toggleNextButton();
                            sleep(1000).then(() => outro());
                        });
                        setNextButtonText("See you");
                        sleep(1000).then(() => boss.enter(false, false));
                    });
                    sleep(2000).then(() => {
                        toggleActive(blackoutDiv);
                        const nServed = orderTally.filter(
                            (el) => el.served
                        ).length;
                        parent.postMessage(
                            {
                                name: "nServedCustomers",
                                value: nServed,
                            },
                            "*"
                        );
                        setText(
                            `Hey you! Wow, that was a busy shift. Let's see how you did... You successfully served ${nServed} customer${
                                nServed > 1 ? "s" : ""
                            }.`
                        );
                        sleep(5000).then(() => {
                            toggleNextButton();
                            if (nServed > 3) {
                                boss.setAvatar("boss_happy").then(() =>
                                    setText(boss.lines.happy)
                                );
                            } else {
                                boss.setAvatar("boss_unhappy").then(() =>
                                    setText(boss.lines.unhappy)
                                );
                            }
                        });
                    });
                }
            }
        })
    );
}
