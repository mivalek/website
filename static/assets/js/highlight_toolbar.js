let selectedText = "";
document.addEventListener("mouseup", () => {
    const toolbar = document.getElementById("highlight-toolbar");
    const selection = document.getSelection();
    if (selection.toString() === "") return;
    selectedText = selection.toString();
    toolbar.addEventListener("click", tweetThis);
    const selBoundingRect = selection.getRangeAt(0).getBoundingClientRect();
    const y_coord = window.scrollY + selBoundingRect.y + "px";
    const x_coord = selBoundingRect.x + selBoundingRect.width / 2 + "px";
    toolbar.style.top = y_coord;
    toolbar.style.left = x_coord;
    toolbar.classList.add("active");
});

document.addEventListener("mousedown", (e) => {
    console.log(e.target.id === "highlight-toolbar");
    if (e.target.id === "highlight-toolbar") return;
    const toolbar = document.getElementById("highlight-toolbar");
    toolbar.removeEventListener("click", tweetThis);
    toolbar.classList.remove("active");
});

function tweetThis(text) {
    window.open(
        "https://twitter.com/intent/tweet?text=" +
            encodeURI(
                selectedText.slice(0, 274 - document.URL.length) + "...\n"
            ) +
            "&url=" +
            encodeURI(document.URL)
    );
    const toolbar = document.getElementById("highlight-toolbar");
    toolbar.removeEventListener("click", tweetThis);
    toolbar.classList.remove("active");
    selectedText = "";
}
