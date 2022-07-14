// from https://medium.com/fasal-engineering/image-lazy-loading-using-browsers-intersection-observer-api-a-step-by-step-guide-with-examples-b1a867614e8

/** First we set up a intersection observer watching over those images and whenever any of those becomes visible on the view then replace the placeholder image with actual one, remove the non-loaded class and then unobserve for that element **/
let lazyElementObserver = new IntersectionObserver(
    function (entries, observer) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                let lazyElem = entry.target;
                loadImage(lazyElem).then(
                    finishLoad(lazyElem, lazyElementObserver)
                );
            }
        });
    },
    { rootMargin: "100px" }
);
/** Now observe all the non-loaded images using the observer we have setup above **/
document
    .querySelectorAll(".lazy")
    .forEach((img) => lazyElementObserver.observe(img));

function finishLoad(element, observer) {
    element.classList.remove("lazy");
    observer.unobserve(element);
}

async function loadImage(elem) {
    return new Promise((resolve, reject) => {
        if (elem.hasAttribute("data-src")) {
            elem.onload = () => resolve(elem);
            elem.onerror = reject;
            elem.src = elem.dataset.src;
            elem.removeAttribute("data-src");
        }
    });
}
