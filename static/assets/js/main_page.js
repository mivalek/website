document.addEventListener("scroll", function (e) {
    const limit = window.innerHeight * 0.6;
    const scrollPos = window.scrollY;
    const introEl = document.getElementById("intro")
    if (scrollPos > limit) {
        introEl.style.opacity = 0;
        introEl.style.filter = "blur(5px)";
        introEl.style.transform = "scale(1.2)";
        return;
    }
    const factor = scrollPos / limit;
    introEl.style.transition = "none";
    introEl.style.opacity = 1 - factor;
    introEl.style.filter = `blur(${factor * 7}px)`;
    introEl.style.transform = `scale(${
        1 + factor / 2
    })`;
});

window.addEventListener("load", (event) => {
    if (window.location.hash) {
        document.getElementById("load-mask").remove();
    } else {
        document.body.scrollTop = document.documentElement.scrollTop = 0;
        document.getElementById("load-mask").classList.add("fade");
    }
    document.getElementById("intro-container").classList.add("active");

    document.onclick = function (e) {
        if (e.target.id !== "menu-icon") {
            document.querySelector("header nav").classList.remove("active");
        }
    };
    fillGallery();
});

// complete gallery grid if needed
function fillGallery() {
    const gallery = document.getElementById("featured-gallery");
    const availableSpace = gallery.clientHeight * gallery.clientWidth;
    let usedSpace = 0;
    const smallTile = document.querySelector(".image-container:not(.large)");
    const smallArea = smallTile.clientHeight * smallTile.clientWidth;
    gallery
        .querySelectorAll(".image-container")
        .forEach(
            (el) => (usedSpace = usedSpace + el.clientHeight * +el.clientWidth)
        );
    const emptySpace = availableSpace - usedSpace;
    if (!emptySpace) return;
    console.log({ total: availableSpace, used: usedSpace, free: emptySpace });
    let nTilesToFill = Math.round(emptySpace / smallArea);
    for (let i = nTilesToFill; i > 0; i--) {
        const container = document.createElement("div");
        container.classList.add("image-container");
        const tile = document.createElement("div");
        tile.classList.add("thumbnail");
        tile.classList.add("empty");
        container.appendChild(tile);
        gallery.appendChild(container);
        if (i === 1) {
            tile.innerHTML = '<a class="button" href="./gallery">See more</a>';
            container.classList.add("last-tile");
            if (nTilesToFill % 2) {
                container.classList.add("odd");
                gallery.nextElementSibling.classList.add("keep");
            }
        }
        gallery.nextElementSibling.classList.add("auto-filled");
    }
}
