window.addEventListener("load", () => {
    docHeight = document.documentElement.getBoundingClientRect().height;
    vh = document.documentElement.clientHeight;
    if (vh > docHeight) {
        fillerDiv = document.createElement("DIV");

        fillerDiv.style.height = vh - docHeight + "px";
        document.querySelector("main").appendChild(fillerDiv);
    }
});
