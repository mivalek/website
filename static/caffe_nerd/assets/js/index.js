document.addEventListener("DOMContentLoaded", function (event) {
    document
        .querySelectorAll(".r-code-container")
        .forEach((el) => el.classList.add("next"));

    document
        .querySelector(".ctrl #back")
        .addEventListener("click", () => previousConsole(true, true));
    document
        .querySelector(".ctrl #next")
        .addEventListener("click", () => nextConsole(true, true));

    document
        .getElementById("next-instruction")
        .addEventListener("click", nextInstruction); // in misc.js

    document.getElementById("start").addEventListener("click", startCustomers); // in misc.js

    document.getElementById("block-icon").addEventListener(
        "click",
        () => {
            const manualConsole = document.getElementById("console-manual");
            document.removeEventListener("keydown", runManualCode);
            toggleActive(manualConsole, (useCapture = true));
            const activeConsole = document.querySelector(".runnable.active");
            copyCodeToConsole(activeConsole.id);
            activeConsole.focus();
        },
        (useCapture = true)
    );
    sleep(1000).then(() => {
        const loader = document.getElementById("loader");
        document.getElementById("intro").classList.remove("blur");
        loader.classList.add("fade");
        sleep(1000).then(() => {
            loader.remove();
            const playButton = document.getElementById("play");
            toggleActive(playButton);
            playButton.addEventListener("click", function (e) {
                enterSound.play().then(() => {
                    document
                        .querySelectorAll("#grid-container, #bottom-panel")
                        .forEach((el) => (el.style = ""));
                    toggleFullScreen();
                    sleep(500).then(() => {
                        toggleActive(playButton.parentElement);
                        sleep(1000).then(() => intro());

                        // // REMOVE THE BELOW
                        // setUpBlockContainer(allCodeBlocks, true);
                        // document
                        //     .getElementById("console-1")
                        //     .classList.remove("code-hidden");
                        // document
                        //     .getElementById("console-1")
                        //     .classList.add("active");
                        // setupDragula();
                        // document
                        //     .getElementById("code-block-container")
                        //     .classList.add("active");
                        // document.addEventListener("keydown", (e) => {
                        //     const currentConsole =
                        //         document.querySelector(".active.runnable").id;
                        //     if (e.key === "Enter") {
                        //         codeOutput = runConsole(currentConsole);
                        //         onEnter();
                        //         prevMenu = activeMenu;
                        //     }
                        // });
                    });
                });
            });
        });
    });
});

let openedFunId = [];

hideAllMenus();

const allCodeBlocks = [
    "filter",
    "select",
    "%>%",
    "==",
    "&",
    ",",
    "chocolate",
    "bubble_tea",
    "coffee",
    "tea",
    "milk",
    "syrup",
    "topping",
    "small_price",
    "medium_price",
    "large_price",
    `"none"`,
    `"black"`,
    `"green"`,
    `"rooibos"`,
    `"dairy"`,
    `"almond"`,
    `"chocolate"`,
    `"cinnamon"`,
    `"tapioca pearls"`,
    `"grass jelly"`,
    `"cocoa"`,
];

const blockContainer = document.getElementById("code-block-container");

// SimpleScrollbar.initEl(document.getElementById("console-2"));

const boss = new Boss();
let clickCounter = 0;
let correctCounter = 0;
let userSelected;
let thisTask;
let activeMenu;
let prevMenu;
let currentData = [];
let currentCodeBlocks = [];
let drake;
let onEnter = function () {
    return;
};
let consoleEnabled = true;
let orderTally = [];
let codeOutput;

let allAvatars = [
    "black1",
    "black2",
    "brown1",
    "brown2",
    "white1",
    "white2",
    "white3",
    "white4",
];
shuffle(allAvatars);
// const customers = makeCustomersFromData();
