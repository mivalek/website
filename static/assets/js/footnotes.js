const footnotes = document.querySelectorAll("a.footnote-ref");

// add on-hover footnote text
if (footnotes.length) {
    footnotes.forEach((fn) => {
        const fnId = fn.getAttribute("href").replace(":", "\\:");
        const fnClone = document
            .querySelector(`${fnId} > p`)
            .cloneNode((deep = true));
        fnClone.querySelector("a.footnote-backref").remove();
        fnClone.classList.add("tooltip");
        fn.after(fnClone);
        fn.classList.add("hoverable");
    });
}
