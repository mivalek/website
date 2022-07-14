// from https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript //
function copyTextToClipboard(text) {
    var textArea = document.createElement("textarea");

    //
    // *** This styling is an extra step which is likely not required. ***
    //
    // Why is it here? To ensure:
    // 1. the element is able to have focus and selection.
    // 2. if the element was to flash render it has minimal visual impact.
    // 3. less flakiness with selection and copying which **might** occur if
    //    the textarea element is not visible.
    //
    // The likelihood is the element won't even render, not even a
    // flash, so some of these are just precautions. However in
    // Internet Explorer the element is visible whilst the popup
    // box asking the user for permission for the web page to
    // copy to the clipboard.
    //

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

    textArea.value = text;

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        success = document.execCommand("copy");
    } catch (err) {
        console.log("Oops, unable to copy");
    }

    document.body.removeChild(textArea);
    return success;
}

function addCopyButtons() {
    let copyDivs = document.querySelectorAll("pre.chroma");
    if (copyDivs.length === 0) return;

    for (let i = 0; i < copyDivs.length; i++) {
        const icon = document.createElement("i");
        icon.classList.add("far", "fa-copy");
        const copyBttn = document.createElement("button");
        copyBttn.classList.add("copy-btn");
        copyBttn.appendChild(icon);
        const copyMsg = document.createElement("div");
        copyMsg.classList.add("copy-msg");
        copyDivs[i].appendChild(copyBttn);
        copyDivs[i].appendChild(copyMsg);
        copyBttn.onclick = function () {
            textToCopy = this.parentElement.querySelector("code").textContent;
            const success = copyTextToClipboard(textToCopy);
            const copyMsg = this.parentElement.querySelector(".copy-msg");
            if (success === true) {
                copyMsg.innerText = "Code copied to clipboard";
            } else {
                copyMsg.innerText = "Something went wrong; try again";
            }
            copyMsg.classList.add("active");
            sleep(1200).then(() => {
                copyMsg.classList.remove("active");
            });
        };
    }
    // stopPropagation();
}

addCopyButtons();
