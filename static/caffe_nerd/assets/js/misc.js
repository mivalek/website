const sleep = (milliseconds) => {
    document.body.classList.add("inactive");
    return new Promise((resolve) => {
        setTimeout(resolve, milliseconds);
    }).then(() => document.body.classList.remove("inactive"));
};

function getRotateAngle() {
    return Math.random() * 3 - 1.5 + "deg";
}

function getNudge(scale = 1) {
    return ~~(Math.random() * 20 - 10) * scale + "px";
}

// from https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array) {
    let currentIndex = array.length,
        randomIndex;
    // While there remain elements to shuffle...
    while (currentIndex != 0) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex],
            array[currentIndex],
        ];
    }

    return array;
}

function throwError(divs, from, to, msg) {
    divs.forEach(function (el, i) {
        if (i >= from && i <= to) highlight(el);
    });
    return msg;
}

function showError(message) {
    const div = document.getElementById("errorBox");
    div.classList.add("active");
    div.innerText = message;
    div.style.transform = `translate(${getNudge(2)}, ${getNudge(
        2
    )}) rotateZ(${getRotateAngle(2)})`;
}

function hideError() {
    document.getElementById("errorBox").classList.remove("active");
}

function toggleArrow(which) {
    const arrow = document.getElementById(which);
    arrow.classList.contains("active")
        ? arrow.classList.remove("active")
        : arrow.classList.add("active");
}

function highlight(div, delay = 0, reps = 3) {
    setTimeout(() => {
        div.classList.add("flash");
        setTimeout(() => div.classList.remove("flash"), reps * 1000);
    }, delay * 1000);
}

function stopHighlight() {
    document
        .querySelectorAll(".flash")
        .forEach((el) => el.classList.remove("flash"));
}

function toggleActive(div) {
    div.classList.contains("active")
        ? div.classList.remove("active")
        : div.classList.add("active");
}

function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

function nextInstruction() {
    stopHighlight();
    boss.instruction();
}

function lastInstruction(e) {
    sendToQualtrics("tutorialEndTime");
    setText("");
    sleep(1000).then(() => {
        boss.exit();
        toggleActive(document.getElementById("start"));
    });
    toggleNextButton();
}

function startCustomers(e) {
    const blackoutDiv = document.getElementById("blackout");
    toggleActive(blackoutDiv);
    sleep(400).then(() => {
        drake.destroy();
        document.getElementById("content-manual").innerText = "";

        const console = document.createElement("div");
        console.id = "console-2";
        console.classList.add("r-code-container", "runnable", "active");
        document
            .querySelectorAll(".ctrl > *, .r-code-container")
            .forEach((el) => el.remove());
        document.getElementById("console").appendChild(console);
        SimpleScrollbar.initEl(document.getElementById("console-2"));
        setUpMenus();

        addClearButton(document.getElementById("console-2"));
        addKeyboardIcon("console-2");
        e.target.remove();
        sleep(2500).then(() => {
            toggleActive(blackoutDiv);
            setupDragula();
            enableConsole();
            onEnter = mainConsoleFun; // in console.js
            o = new Order();
            sleep(2000).then(() => highlight(document.getElementById("order")));
            sendToQualtrics("gameStartTime");
        });
    });
}

function formatIngredient(x, ingr, addIngr = false) {
    ingr = "&nbsp;" + ingr;
    // const ingredient = ingr === "" ? ingr : "&nbsp;" + ingr;
    return x === "none" ? `no${ingr}` : x + (addIngr ? ingr : "");
}

function outro() {
    sendToQualtrics("exitGame");
    enterSound.play();
    const outroScreen = document.getElementById("intro");
    outroScreen.classList.add("night");
    sleep(500).then(() => {
        toggleActive(outroScreen);
        sleep(4000).then(() => toggleFullScreen());
    });
}

function sendToQualtrics(msg) {
    if (
        [
            "tutorialStartTime",
            "tutorialEndTime",
            "gameStartTime",
            "exitGame",
        ].includes(msg)
    ) {
        parent.postMessage({ name: msg, value: Date.now() }, "*");
    }
}
