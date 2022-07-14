document.addEventListener("click", (e) => {
    if (
        ["photo-viewer", "photo-container", "viewer-container"].includes(
            e.target.id
        )
    ) {
        document.getElementById("viewer-container").classList.remove("active");
        document.querySelector("html").classList.remove("fixed");
        document.querySelector("header").classList.remove("hidden");
    }
});
document.addEventListener("keydown", (e) => {
    const viewer = document.getElementById("viewer-container");
    if (!viewer.classList.contains("active")) return;
    switch (e.code) {
        case "ArrowLeft":
            swapPhoto(false);
            break;
        case "ArrowRight":
            swapPhoto();
            break;
        case "Escape":
            viewer.classList.remove("active");
            document.querySelector("html").classList.remove("fixed");
            document.querySelector("header").classList.remove("hidden");
            break;
        default:
            return;
    }
});
document.querySelectorAll(".thumbnail").forEach((el) => {
    el.addEventListener("click", (e) => {
        const photoURL = e.target.src.replace(
            /\?.*/,
            "?width=2048&height=1536"
        );
        const caption =
            e.target.getAttribute("aria-label") +
            " | &copy; " +
            e.target.getAttribute("year") +
            " Milan Valášek";
        const image = document.getElementById("viewer-photo");
        const index = +e.target.getAttribute("index");
        image.setAttribute("index", index);
        image.src = photoURL;
        image.setAttribute("last", false);
        document.querySelector("header").classList.add("hidden");
        document.getElementById("viewer-container").classList.add("active");
        document.querySelector("html").classList.add("fixed");
        document.getElementById("caption").innerHTML = caption;
        if (e.target.getAttribute("last") === "true")
            document
                .querySelectorAll(".next")
                .forEach((el) => el.classList.add("hidden"));
        if (!index)
            document
                .querySelectorAll(".previous")
                .forEach((el) => el.classList.add("hidden"));
    });
});

function swapPhoto(next = true) {
    const viewerPhoto = document.getElementById("viewer-photo");
    const currentIndex = +viewerPhoto.getAttribute("index");
    const nextIndex = next ? currentIndex + 1 : currentIndex - 1;
    const isLast = viewerPhoto.getAttribute("last") === "true";

    if ((currentIndex === 0 && !next) || (isLast && next)) return;

    document.querySelectorAll(".ctrl").forEach((el) => {
        el.classList.remove("hidden");
    });

    nextPhoto = document.querySelector(`.thumbnail[index="${nextIndex}"]`);
    isNextLast = nextPhoto.getAttribute("last") === "true";
    isNextFirst = nextIndex === 0;
    viewerPhoto.src = nextPhoto.src.replace(/\?.*/, "?width=1024&height=768");
    viewerPhoto.setAttribute("index", nextIndex);
    viewerPhoto.setAttribute("last", isNextLast);
    const caption =
        nextPhoto.getAttribute("aria-label") +
        " | &copy; " +
        nextPhoto.getAttribute("year") +
        " Milan Valášek";
    document.getElementById("caption").innerHTML = caption;
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
    .forEach((el) => el.addEventListener("click", () => swapPhoto(false)));
document
    .querySelectorAll(".next")
    .forEach((el) => el.addEventListener("click", () => swapPhoto()));
