function setupDragula() {
    drake = dragula(
        [
            document.querySelector("#code-block-container .blocks"),
            document.querySelector(".runnable.active .ss-content"),
        ],
        {
            copy: function (el, source) {
                return source.className === "blocks";
            },
            removeOnSpill: true,
            // direction: "horizontal",
            invalid: function (el, handle) {
                return el.classList.contains("bracket");
            },
        }
    );

    drake.on("drop", drop);

    drake.on("drag", (el, source) => {
        if (
            source.parentElement.parentElement.classList.contains(
                "r-code-container"
            )
        ) {
            if (el.children[0].classList.contains("fun")) {
                const funID = el.getAttribute("funid");
                const closingBracket = document.querySelector(
                    `.bracket[funid="${funID}"]`
                );
                const position = [
                    +el.getAttribute("position"),
                    +closingBracket.parentElement.getAttribute("position"),
                ];
                const allBlocks = document.querySelectorAll(
                    ".runnable.active .block-wrapper"
                );
                for (let i = position[0]; i < position[1]; i++) {
                    el.appendChild(allBlocks[i].children[0]);
                    allBlocks[i].remove();
                }
            }

            repositionBlocks(source);
        }
    });

    drake.on("out", (el, container, source) => {
        repositionBlocks(source);
    });
}

function drop(el, target, source) {
    const isCodeContainer =
        source.parentElement.parentElement.classList.contains(
            "r-code-container"
        );
    if (target.className === "blocks") el.remove();
    if (target.parentElement.parentElement.classList.contains("runnable")) {
        if (el.classList.contains("fun")) {
            const nBlocks = target.querySelectorAll(".code-block").length;
            if (
                !source.parentElement.parentElement.classList.contains(
                    "r-code-container"
                )
            ) {
                setFunID(el);
            }
            const funID = openedFunId.pop();
            const closingBracket = document.createElement("div");
            closingBracket.classList.add("block-wrapper");
            closingBracket.innerHTML = `<div class='code-block bracket' funid="${funID}">)</div>`;
            closingBracket.setAttribute("funid", funID);
            el.insertAdjacentElement("afterend", closingBracket);
        }
        if (isCodeContainer) {
            for (let i = el.children.length - 1; i > 0; i--) {
                el.children[i].classList.add("to-wrap");
                el.insertAdjacentElement("afterend", el.children[i]);
            }
            target.querySelectorAll(".to-wrap").forEach((b) => {
                b.classList.remove("to-wrap");
                wrapBlock(b);
            });
        } else {
            wrapBlock(el);
        }
    }
    sleep(100).then(() =>
        repositionBlocks(document.querySelector(".r-code-container.active"))
    );
}
