function makeCodeBlock(x, attach = true, prefill = false, codeContId = null) {
    const block = document.createElement("div");
    block.classList.add("code-block");
    block.innerText = x;
    if (["filter", "select"].includes(x)) {
        block.classList.add("fun", x == "filter" ? "filter" : "select");
        block.innerHTML = `${x}(<span class="closing-bracket">)</span>`;
    } else if (x == "%>%") {
        block.classList.add("pipe");
    } else if (x == "&") {
        block.classList.add("op", "and");
    } else if (x == "==") {
        block.classList.add("op", "is");
    } else if (x == ",") {
        block.classList.add("sep");
    } else if (x.includes('"')) {
        block.classList.add("str");
    } else if (["coffee", "chocolate", "bubble_tea"].includes(x)) {
        block.classList.add("data");
    } else if (x == ")") {
        block.classList.add("bracket");
    } else block.classList.add("col");
    if (attach) {
        block.style.transform = `translate(${getNudge()}, ${getNudge()}) rotateZ(${getRotateAngle()})`;
        // block.setAttribute("draggable", "true");
        document
            .querySelector("#code-block-container .blocks")
            .appendChild(block);
    }
    if (prefill) {
        const cont = document.querySelector(`#${codeContId} .ss-content`);
        if (block.classList[1] == "fun") {
            setFunID(block);
        } else if (block.classList[1] == "bracket") {
            block.setAttribute("funid", openedFunId.pop());
        }

        block.classList.add("prefill");
        cont.appendChild(block);
        wrapBlock(block);
    }
}

function wrapBlock(block, addClass) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("block-wrapper");
    block.parentElement.insertBefore(wrapper, block);
    wrapper.appendChild(block);

    const funID = block.getAttribute("funid");

    if (funID) {
        wrapper.setAttribute("funid", funID);
    }
}

function repositionBlocks(div) {
    div.querySelectorAll(".block-wrapper").forEach((b, i) =>
        b.setAttribute("position", i + 1)
    );
}

function setFunID(div) {
    let id, isIdUsed;
    do {
        id = makeId(10);
        let isIdUsed = document.querySelector(`[funid=${id}]`);
    } while (isIdUsed);
    openedFunId.push(id);
    div.setAttribute("funid", id);
}

function getFunId(div) {
    return document.querySelector(div).getAttribute("funid");
}

// from https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
function makeId(length) {
    var result = "";
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
        );
    }
    return result;
}

function setUpBlockContainer(blocks, randomise = true) {
    if (randomise) shuffle(blocks);
    const codeBlocks = blocks;
    codeBlocks.forEach((el) => makeCodeBlock(el));
    blockContainer.style.height =
        Math.min(
            blockContainer.querySelector(".blocks").scrollHeight + 10,
            blockContainer.parentElement.clientHeight * 0.45
        ) +
        40 +
        "px";

    SimpleScrollbar.initEl(blockContainer);
}

function clearBlcokContainer() {
    blockContainer.querySelector(".blocks").innerHTML = "";
}
