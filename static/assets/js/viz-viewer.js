function closeApp() {
    const app = document.getElementById("app");
    app.src = "";
    app.style.height = 0;
    document.getElementById("viewer-container").classList.remove("active");
    document.querySelector("html").classList.remove("fixed");
    document.querySelector("header").classList.remove("hidden");
    resizeObs.unobserve(document.getElementById("viewer-container"));
    document.getElementById("embed-container").innerHTML = "";
}
document.addEventListener("click", (e) => {
    if (
        ["app-viewer", "app-container", "viewer-container"].includes(
            e.target.id
        )
    ) {
        closeApp();
    }
});
document.addEventListener("keydown", (e) => {
    const viewer = document.getElementById("viewer-container");
    if (!viewer.classList.contains("active")) return;
    switch (e.code) {
        case "ArrowLeft":
            swapApp(false);
            break;
        case "ArrowRight":
            swapApp();
            break;
        case "Escape":
            closeApp();
            break;
        default:
            return;
    }
});
document.querySelectorAll(".post-card-container").forEach((el) => {
    el.addEventListener("click", (e) => {
        const vizUrl = e.target.getAttribute("href");
        const app = document.getElementById("app");
        const index = +e.target.getAttribute("index");
        app.setAttribute("index", index);
        app.src = vizUrl;
        app.setAttribute("last", false);
        document.querySelector("header").classList.add("hidden");
        document.getElementById("viewer-container").classList.add("active");
        document.querySelector("html").classList.add("fixed");
        if (e.target.getAttribute("last") === "true")
            document
                .querySelectorAll(".next")
                .forEach((el) => el.classList.add("hidden"));
        if (!index)
            document
                .querySelectorAll(".previous")
                .forEach((el) => el.classList.add("hidden"));
        delayResize(app, 1000);
        resizeObs.observe(document.getElementById("viewer-container"));
        const embedContainer = document.getElementById("embed-container");
        embedContainer.innerHTML = document.getElementById(
            "shadow-embed-container"
        ).innerHTML;
    });
});

function swapApp(next = true) {
    const viewedApp = document.getElementById("app");
    viewedApp.style.height = 0;
    const currentIndex = +viewedApp.getAttribute("index");
    const nextIndex = next ? currentIndex + 1 : currentIndex - 1;
    const isLast = viewedApp.getAttribute("last") === "true";

    if ((currentIndex === 0 && !next) || (isLast && next)) return;

    document.querySelectorAll(".ctrl").forEach((el) => {
        el.classList.remove("hidden");
    });

    nextApp = document.querySelector(
        `.post-card-container[index="${nextIndex}"]`
    );
    isNextLast = nextApp.getAttribute("last") === "true";
    isNextFirst = nextIndex === 0;
    viewedApp.src = nextApp.getAttribute("href");
    viewedApp.setAttribute("index", nextIndex);
    viewedApp.setAttribute("last", isNextLast);

    delayResize(viewedApp, 1000);
    if (isNextLast)
        document
            .querySelectorAll(".next")
            .forEach((el) => el.classList.add("hidden"));
    if (isNextFirst)
        document
            .querySelectorAll(".previous")
            .forEach((el) => el.classList.add("hidden"));
}

document
    .querySelectorAll(".previous")
    .forEach((el) => el.addEventListener("click", () => swapApp(false)));
document
    .querySelectorAll(".next")
    .forEach((el) => el.addEventListener("click", () => swapApp()));

let ifrContent;

const resizeObs = new ResizeObserver((entries) => {
    delayResize(document.getElementById("app"), (delay = 0));
});

function delayResize(obj, delay = 0) {
    sleep(delay).then(() => {
        obj.style.height =
            obj.contentDocument.documentElement.getBoundingClientRect().height +
            20 +
            "px";
    });
}

function embed() {
    const app = document.getElementById("app");
    const viz = app.src.replace(/^.*\//, "");
    // from https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript //
    var textArea = document.createElement("textarea");

    // Place in the top-left corner of screen regardless of scroll position.
    textArea.style.position = "fixed";
    textArea.style.top = 0;
    textArea.style.left = 0;

    // Ensure it has a small width and height. Setting to 1px / 1em
    // doesn't work as this gives a negative w/h on some browsers.
    textArea.style.width = "2em";
    textArea.style.height = "2em";

    // We don't need padding, reducing the size if it does flash render.
    textArea.style.padding = 0;

    // Clean up any borders.
    textArea.style.border = "none";
    textArea.style.outline = "none";
    textArea.style.boxShadow = "none";

    // Avoid flash of the white box if rendered for any reason.
    textArea.style.background = "transparent";

    textArea.value =
        '<iframe id="' +
        viz.replace("_", "-") +
        '-viz" class="viz app" src="https://mival.netlify.app/viz/' +
        viz +
        '?cite=true" data-external="1" style="height:' +
        (app.contentDocument.documentElement.scrollHeight + 30) +
        'px;"></iframe>';

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const tooltip = document.getElementById("tooltip");
    try {
        success = document.execCommand("copy");
        console.log("Copied");
    } catch (err) {
        document.querySelector("#tooltip span").innerHTML = "O-oh, try again!";
        console.log("Oops, unable to copy");
    }

    tooltip.classList.toggle("show");
    sleep(1500).then(() => tooltip.classList.toggle("show"));
    document.body.removeChild(textArea);
}
