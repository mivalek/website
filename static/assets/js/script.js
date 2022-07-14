let preScriptOnload = window.onload;

window.addEventListener("load", (event) => {
    document.querySelectorAll(".hoverable").forEach((el) => {
        el.addEventListener("mouseenter", (e) => {
            positionTooltip(e);
        });
        el.removeEventListener("mouseout", positionTooltip);
    });
    if (preScriptOnload) preScriptOnload();
});

document.addEventListener("scroll", function (e) {
    document.getElementById("mobile-only").classList.add("active");
});

document
    .getElementById("menu-icon")
    .addEventListener("click", (e) => toggleNav(e));

document.querySelectorAll("#nav-container a").forEach((el) =>
    el.addEventListener("click", (e) => {
        deactivateAllNavs();
        e.target.classList.add("active");
    })
);

function positionTooltip(e) {
    const targetDims = e.target.getBoundingClientRect();
    const targetMidpoint = targetDims.left + targetDims.width / 2;
    const windowWidth = document.body.getBoundingClientRect().width;
    const ttip = e.target.nextElementSibling;
    ttip.style.transform = "translate(0px, -10px)";
    const ttipDims = ttip.getBoundingClientRect();
    const ttipMidpoint = ttipDims.left + ttipDims.width / 2;
    const finalDistFromRightEdge =
        windowWidth - (targetMidpoint + ttipDims.width / 2);
    const finalDistFromLeftEdge = targetMidpoint - ttipDims.width / 2;
    let nudgeBy = targetMidpoint - ttipMidpoint;
    if (finalDistFromRightEdge < 10) {
        nudgeBy = windowWidth - ttipDims.right - 10;
    } else if (finalDistFromLeftEdge < 10) {
        nudgeBy = -ttipDims.left + 10;
    }
    ttip.style.transform = `translate(${nudgeBy}px, -10px)`;
}

function toggleNav(e) {
    e.stopPropagation();
    document.querySelector("header nav").classList.toggle("active");
}

// intersection observer highlighting nav menu items

const obsOpts = {
    root: null,
    rootMargin: "0px",
    threshold: 0.5,
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            activateNav(entry.target.id.replace("-section", ""));
        }
    });
}, obsOpts);

deactivateAllNavs = () =>
    document
        .querySelectorAll("#nav-container a")
        .forEach((el) => el.classList.remove("active"));
activateNav = (section) => {
    deactivateAllNavs();

    const navMenu = document.querySelector(
        `#nav-container a[href="#${section}"]`
    );
    if (navMenu) navMenu.classList.add("active");
};

document.querySelectorAll("section").forEach((i) => observer.observe(i));
deactivateAllNavs();

const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};
