let preScriptOnload = window.onload;

window.addEventListener("load", (event) => {
    document.querySelectorAll(".hoverable").forEach((el) => {
        el.addEventListener("mouseenter", (e) => {
            positionTooltip(e);
        });
        el.removeEventListener("mouseout", positionTooltip);
    });
    document.querySelectorAll(".scroll-tab").forEach((el) => {
        const h = el.dataset.height;
        el.querySelector("table").style.height = h;
    });
    // add target="_blank" to external links
    // document.querySelectorAll("a[href^='http']").forEach((link) => {
    //     if (!link.href.includes(window.location.origin))
    //         link.setAttribute("target", "_blank");
    // });
    if (preScriptOnload) preScriptOnload();
});

document
    .getElementById("menu-icon")
    .addEventListener("click", (e) => toggleNav(e));

document.addEventListener("click", (e) => {
    document.querySelector("header nav").classList.remove("active");
    document
        .querySelectorAll(
            "#intro-container, #byline, #background, #main-container, footer"
        )
        .forEach((el) => el.classList.remove("inactive"));
});

document.querySelectorAll("#nav-container a").forEach((el) =>
    el.addEventListener("click", (e) => {
        deactivateAllNavs();
        const targ = e.target;
        targ.classList.add("active");
        const parentOfUl = targ.parentElement.parentElement.parentElement;
        console.log(parentOfUl);
        if (parentOfUl.tagName === "LI") parentOfUl.classList.add("active");
        const firstChildOfParentList = parentOfUl.firstElementChild;
        if (firstChildOfParentList.tagName === "A")
            firstChildOfParentList.classList.add("active");
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
    document
        .querySelectorAll(
            "#intro-container, #byline, #background, #main-container, footer"
        )
        .forEach((el) => el.classList.toggle("inactive"));
}

// intersection observer highlighting nav menu items

const obsOpts = {
    root: null,
    rootMargin: "-54% 0% -45% 0%",
};

window.addEventListener("DOMContentLoaded", () => {
    document
        .querySelectorAll("section[id], .subsection[id]")
        .forEach((i) => observer.observe(i));
});

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
        const section = entry.target.id.replace("-section", "");
        if (entry.isIntersecting) {
            // activateNav(entry.target.id.replace("-section", ""));
            const navLink = document.querySelector(
                `#nav-container a[href="#${section}"]`
            );
            navLink.classList.add("active");
            navLink.parentElement.classList.add("active");
        } else {
            const navLink = document.querySelector(
                `#nav-container a[href="#${section}"]`
            );
            navLink.classList.remove("active");
            navLink.parentElement.classList.remove("active");
        }
    });
}, obsOpts);

const deactivateAllNavs = () =>
    document.querySelectorAll("#nav-container a").forEach((el) => {
        el.classList.remove("active");
        el.parentElement.classList.remove("active");
    });

const activateNav = (section) => {
    deactivateAllNavs();

    const navMenu = document.querySelector(
        `#nav-container a[href="#${section}"]`
    );
    if (navMenu) {
        navMenu.classList.add("active");
        navMenu.parentElement.classList.add("active");
    }
};

deactivateAllNavs();

const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

const mobileNavObsOpts = {
    root: null,
    rootMargin: "10% 0% -100% 0%",
};

const mobileNavObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            document.getElementById("mobile-only").classList.add("active");
        } else
            document.getElementById("mobile-only").classList.remove("active");
    });
}, mobileNavObsOpts);

mobileNavObserver.observe(document.getElementById("main-container"));
