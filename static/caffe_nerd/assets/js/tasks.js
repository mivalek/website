function intro() {
    toggleActive(document.getElementById("info"));
    sleep(500).then(() => {
        boss.enter();
        highlight(document.getElementById("next-instruction"), 2);
        sendToQualtrics("tutorialStartTime");
    });
}

function Order() {
    const cData = customerData.shift();
    if (!cData) return console.log("no more customer data");
    this.customer = new Customer(
        allAvatars.shift(),
        cData.order,
        cData.happy,
        cData.unhappy,
        cData.lines
    );

    this.drink = cData.drink;
    this.size = cData.size;
    this.milk = cData.milk;
    this.tea = cData.tea;
    this.syrup = cData.syrup;
    this.topping = cData.topping;
    this.attempts = 0;
    this.complete = false;
    this.served = false;
    this.addAttempt = function () {
        this.attempts++;
    };
    this.order =
        this.drink === "bubble_tea"
            ? `${this.size} ${this.tea} bubble tea<br>${formatIngredient(
                  this.milk,
                  "milk",
                  true
              )}<br>${formatIngredient(this.topping, "toppings")}`
            : `${this.size} ${this.drink}<br>${formatIngredient(
                  this.milk,
                  "milk",
                  true
              )}<br>${formatIngredient(
                  this.syrup,
                  "syrup",
                  true
              )}<br>${formatIngredient(this.topping, "toppings")}`;

    this.customer.enter().then(() => {
        document.getElementById("order-text").innerHTML = this.order;
        toggleActive(document.getElementById("order"));
    });
    this.get = function () {
        if (codeOutput !== true) {
            return new Promise((resolve) => {
                this.react(null, true).then((result) => {
                    console.log("o.get(error) resolved");
                    resolve();
                });
            });
        }
        return new Promise((resolve) => {
            const check = this.check();
            if (Object.values(check).every(Boolean)) {
                this.complete = true;
                cash.play();
                setText("");
                this.customer.getDrink(this.drink).then(() => {
                    this.addAttempt();
                    this.served = true;
                    this.customer.exit((served = true)).then(() => resolve());
                });
                return;
            } else
                this.react(check).then((result) => {
                    console.log("o.get() resolved");
                    resolve();
                });
            // maybe later
            // if (!check.nrowsOK || !check.colOK) {
            //     this.addAttempt();
            //     this.customer.changeMood();
            //     sleep(1000).then(() => {
            //         if (this.customer.lines.length == 0) {
            //             this.customer.exit();
            //             this.complete = true;
            //         } else {
            //             this.customer.sayLine();
            //         }
            //     });
            // }
            // if (!check.drinkOK) {
            // }
        });
    };
    this.check = function () {
        const outputMenu = document.querySelector(".menu-container.active");
        const chosenDrink = outputMenu.id.replace("-container", "");
        const output = outputMenu.querySelectorAll("td");
        if (output.length) {
            const chosenSize = output[0].classList[0].replace("_price", "");
            let rows = [];
            output.forEach((n) => rows.push(+n.getAttribute("row")));
            // unique values
            rows = rows.filter((v, i, a) => a.indexOf(v) === i);
            const chosenRow = menu[chosenDrink].filter((r) =>
                rows.includes(r.n)
            );
            let orderOK = {
                drinkOK: this.drink === chosenDrink,
                nrowsOK: chosenRow.length === 1,
                colOK: output[0].classList.contains("price"),
                sizeOK: this.size === chosenSize,
                milkOK: this.milk === chosenRow[0].milk,
                teaOK:
                    chosenDrink === "bubble_tea"
                        ? this.tea === chosenRow[0].tea
                        : true,
                syrupOK:
                    chosenDrink === "bubble_tea"
                        ? true
                        : this.syrup === chosenRow[0].syrup,
                toppingOK: this.topping === chosenRow[0].topping,
            };
            return orderOK;
        } else
            return {
                drinkOK: false,
                nrowsOK: false,
                colOK: false,
                sizeOK: false,
                milkOK: false,
                teaOK: false,
                syrupOK: false,
                toppingOK: false,
            };
    };
    this.error = function () {
        return new Promise((resolve) =>
            this.react(null, true).then(() => {
                console.log("order.error() resolved");
                resolve();
            })
        );
    };
    this.react = function (checkOutput, error = false) {
        return new Promise((resolve) => {
            let exit = false;
            let multipleColsSelected = false;
            if (checkOutput) {
                if (
                    !checkOutput.colOK &&
                    Object.keys(checkOutput)
                        .filter((key) => !["colOK", "sizeOK"].includes(key))
                        .map((o) => checkOutput[o])
                        .every((el) => el)
                ) {
                    // if user picked the right row but didn't select just price
                    multipleColsSelected = true;
                }
            }
            setText("");
            this.addAttempt();
            if (!multipleColsSelected) {
                if (this.customer.lines.length == 0) {
                    this.customer.changeMood();
                    this.complete = true;
                    exit = true;
                } else {
                    this.customer.changeMood();
                }
            }
            sleep(300).then(() => {
                if (exit) {
                    boo.play();
                    this.customer.exit().then(() =>
                        sleep(500).then((result) => {
                            console.log("order.react() resolved");
                            resolve();
                        })
                    );
                } else if (multipleColsSelected) {
                    setText("Can you just tell me the price?");
                    sleep(2000).then(() => {
                        setUpMenus();
                        console.log("order.react() resolved");
                        resolve();
                    });
                } else {
                    this.customer.sayLine();
                    if (!error) setText("Sorry, that's not what I ordered...");
                    sleep(2000).then(() => {
                        setUpMenus();
                        console.log("order.react() resolved");
                        resolve();
                    });
                }
            });
        });
    };
    this.logOrder = function (tally) {
        tally.push({ attempts: this.attempts, served: this.served });
    };
}

function runTask(id) {
    // console.log(id);
    const menuContainers = document.querySelectorAll(".menu-container");
    switch (id) {
        case "task-0":
            buildAllMenus(
                (interactive = true),
                (tabs = false),
                (hover = false),
                (click = false)
            );
            getMenu("coffee");
            break;

        case "task-1":
            menuContainers.forEach((el) =>
                makeTableInteractive(
                    el,
                    (tabs = true),
                    (hover = false),
                    (click = false)
                )
            );
            document.querySelectorAll(".menu-select").forEach((el, i) => {
                if (i == 2) return;
                el.addEventListener(
                    "click",
                    (e) => {
                        clickCounter++;
                        if (clickCounter == 2) taskCompleted();
                    },
                    { once: true }
                );
            });
            document
                .querySelectorAll(".trapezoid")
                .forEach((el, i) => highlight(el, 2 + (2 - i) * 0.7, 1));
            break;

        case "task-2":
            menuContainers.forEach((el) =>
                makeTableInteractive(
                    el,
                    (tabs = false),
                    (hover = false),
                    (click = true)
                )
            );
            document.querySelectorAll("td").forEach((el) => {
                el.addEventListener("click", (e) => {
                    const res = checkTask(
                        document
                            .querySelector(".menu-container.active")
                            .id.includes(thisTask.correct.menu) &&
                            userSelected.row == thisTask.correct.row &&
                            userSelected.col == thisTask.correct.col,
                        thisTask.alt
                    );
                    if (!res) error.play();
                });
            });
            break;

        case "task-3":
            hideAllMenus();
            buildAllMenus(true, true, false, true);
            getMenu(activeMenu);
            document.querySelectorAll("td").forEach((el) => {
                el.addEventListener("click", (e) => {
                    const res = checkTask(
                        document
                            .querySelector(".menu-container.active")
                            .id.includes(thisTask.correct.menu) &&
                            userSelected.row == thisTask.correct.row &&
                            userSelected.col == thisTask.correct.col,
                        thisTask.alt
                    );
                    if (!res) error.play();
                });
            });
            break;

        case "task-4":
            woosh.play().then(() => {
                toggleActive(document.getElementById("console-1"));
                document.getElementById("console-1").classList.remove("next");
            });
            break;

        case "task-5":
            document
                .getElementById("console-1")
                .classList.remove("code-hidden");
            break;

        case "task-6":
            highlight(document.querySelector("#data-template"));
            break;

        case "task-7":
            highlight(document.querySelector("#filter-template"));
            break;

        case "task-8":
            highlight(document.querySelector("#select-template"));
            break;

        case "task-9":
            document
                .querySelectorAll("#console-1 .pipe")
                .forEach((el) => highlight(el));
            break;

        case "task-10":
            hideAllMenus();
            nextConsole();
            SimpleScrollbar.initEl(document.getElementById("console-2"));

            drake = dragula([
                document.querySelector("#code-block-container .blocks"),
                document.querySelector("#console-2 .ss-content"),
            ]);

            drake.on("drop", (el, target, source) => {
                if (target.parentElement.parentElement.id == "console-2") {
                    checkTask(
                        document.querySelector("#console-2 .code-block")
                            .innerText === "coffee",
                        thisTask.alt
                    );
                }
            });

            setUpBlockContainer(["coffee", "chocolate", "bubble_tea"]);
            sleep(1000).then(() => toggleActive(blockContainer));
            break;

        case "task-11":
            onEnter = function () {
                taskCompleted();
                disableConsole();
            };
            drake.destroy();
            document.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    const currentConsole =
                        document.querySelector(".active.runnable").id;
                    codeOutput = runConsole(currentConsole);
                    onEnter();
                    prevMenu = activeMenu;
                }
            });
            break;

        case "task-12":
            enableConsole();
            onEnter = function () {
                const isComplete = checkTask(
                    activeMenu === prevMenu &&
                        currentData.length == 9 &&
                        currentData.filter((x) => x.milk == "none").length == 9,
                    thisTask.alt
                );
                if (!isComplete) {
                    sleep(2200).then(() => {
                        clearBlcokContainer();
                        setUpBlockContainer(
                            currentCodeBlocks.filter((x) => x != activeMenu),
                            false
                        );
                        clearActiveConsole();
                        prefillCode(
                            `${activeMenu} %>% filter(milk ==)`,
                            "console-2"
                        );
                    });
                } else {
                    disableConsole();
                }
            };
            clearBlcokContainer();
            currentCodeBlocks = [
                '"vanilla"',
                '"dairy"',
                '"almond"',
                '"chocolate"',
                "chocolate",
                '"none"',
                "coffee",
                "bubble_tea",
            ];
            setUpBlockContainer(
                currentCodeBlocks.filter((x) => x != activeMenu)
            );
            clearActiveConsole();
            prefillCode(`${activeMenu} %>% filter(milk ==)`, "console-2");
            drake = dragula(
                [
                    document.querySelector("#code-block-container .blocks"),
                    document.querySelector("#console-2 .ss-content"),
                ],
                {
                    invalid: function (el, handle) {
                        return el.classList.contains("prefill");
                    },
                }
            );
            break;

        case "task-13":
            enableConsole();
            onEnter = function () {
                const isComplete = checkTask(
                    activeMenu === prevMenu &&
                        currentData.length == 3 &&
                        currentData.filter(
                            (x) => x.milk == "none" && x.topping == "cocoa"
                        ).length == 3,
                    thisTask.alt
                );
                if (!isComplete) {
                    sleep(2200).then(() => {
                        clearBlcokContainer();
                        setUpBlockContainer(
                            currentCodeBlocks.filter((x) => x != activeMenu),
                            false
                        );
                        clearActiveConsole();
                        prefillCode(
                            `${activeMenu} %>% filter(milk == "none" & topping)`,
                            "console-2"
                        );
                    });
                } else {
                    disableConsole();
                }
            };
            clearBlcokContainer();
            currentCodeBlocks = [
                '"vanilla"',
                '"almond"',
                '"chocolate"',
                "chocolate",
                "coffee",
                "bubble_tea",
                "==",
                '"none"',
                '"cocoa"',
                '"cinnamon"',
                "&",
            ];
            setUpBlockContainer(
                currentCodeBlocks.filter((x) => x != activeMenu),
                false
            );
            clearActiveConsole();
            prefillCode(
                `${activeMenu} %>% filter(milk == "none" & topping)`,
                "console-2"
            );
            break;

        case "task-14":
            enableConsole();
            onEnter = function () {
                const isComplete = checkTask(
                    activeMenu === prevMenu &&
                        currentData.length == 3 &&
                        currentData.every(
                            (d) =>
                                Object.keys(d).every((k) =>
                                    ["medium_price", "n"].includes(k)
                                ) && [1, 4, 7].includes(d.n)
                        ),
                    thisTask.alt
                );
                if (!isComplete) {
                    sleep(2200).then(() => {
                        clearBlcokContainer();
                        setUpBlockContainer(
                            currentCodeBlocks.filter((x) => x != activeMenu),
                            false
                        );
                        clearActiveConsole();
                        prefillCode(
                            `${activeMenu} %>% filter(milk == "none" & topping == "cocoa")select()`,
                            "console-2"
                        );
                    });
                } else {
                    disableConsole();
                }
            };
            clearBlcokContainer();
            currentCodeBlocks = [
                '"vanilla"',
                '"almond"',
                '"chocolate"',
                "chocolate",
                "coffee",
                "bubble_tea",
                '"none"',
                '"cinnamon"',
                "medium_price",
                "small_price",
                "large_price",
                "%>%",
            ];
            setUpBlockContainer(
                currentCodeBlocks.filter((x) => x != activeMenu),
                false
            );
            clearActiveConsole();
            prefillCode(
                `${activeMenu} %>% filter(milk == "none" & topping == "cocoa")select()`,
                "console-2"
            );
            break;

        case "task-15":
            hideAllMenus();
            drake.destroy();
            setUpBlockContainer(allCodeBlocks, true);
            sleep(1800).then(() =>
                document
                    .querySelectorAll(".blocks .code-block")
                    .forEach((b) => highlight(b))
            );
            break;

        case "task-16":
            setupDragula();
            enableConsole();
            onEnter = function () {};
            sleep(1500).then(() =>
                document
                    .querySelectorAll(".runnable .code-block")
                    .forEach((b) => highlight(b))
            );
            break;

        case "task-17":
            sleep(1500).then(() => {
                addClearButton(document.getElementById("console-2"));
                highlight(document.querySelector(".clear"));
            });
            break;
        case "task-18":
            sleep(1500).then(() => {
                addKeyboardIcon("console-2", true);
            });
            break;
        case "task-19":
            buildAllMenus(true, true, false, false);
            getMenu("coffee");
            enableConsole();
            onEnter = function () {
                const isComplete = checkTask(
                    activeMenu == "chocolate" &&
                        currentData.length == 1 &&
                        currentData[0].hasOwnProperty("large_price") &&
                        currentData[0].n == 20,
                    thisTask.alt
                );
                if (isComplete) {
                    disableConsole();
                    onEnter = function () {};
                }
            };
            clearActiveConsole();
            break;

        case "task-20":
            hideAllMenus();
            sleep(2000).then(() => {
                nextConsole(false, true);
                getMenu("chocolate");
                setUpCodeShowConsole("chocolate");
                document
                    .querySelectorAll(".menu tbody")
                    .forEach((m) => highlight(m, 0.5, 1));
                highlight(document.getElementById("console-3"), 0.85, 1);
            });
            break;

        case "task-21":
            sleep(1500).then(() => {
                toggleArrow("back");
                highlight(document.querySelector("#back .arrow"));
                document.getElementById("console-1").remove();
            });
            break;

        case "task-22":
            boss.setAvatar("boss_exit").then(() => boss.getDrink());
            const nextButton = document.getElementById("next-instruction");
            nextButton.removeEventListener("click", nextInstruction);
            nextButton.addEventListener("click", lastInstruction);
            break;

        default:
            break;
    }
}

function taskCompleted() {
    ding.play().then(() => {
        boss.feedback();
        sleep(2000).then(() => boss.instruction());
    });
}

function checkTask(
    cond,
    altWording,
    sound = currentData.length !== 0 // play sound if not error; if error, sound is played by runConsole()
) {
    if (cond) {
        taskCompleted();
        return true;
    } else {
        if (sound) {
            error.play().then(() => {
                boss.feedback(false);
                sleep(2000).then(() => setText(altWording));
            });
        } else {
            boss.feedback(false);
            sleep(2000).then(() => setText(altWording));
        }
        return false;
    }
}

function getTaskData(taskID) {
    return bossData.instructions.filter((o) => o.id == taskID)[0];
}
