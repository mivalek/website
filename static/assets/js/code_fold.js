document.querySelectorAll(".foldable").forEach((el) => {
    // const child = el.firstElementChild;
    // child.setAttribute("data-height", child.scrollHeight + "px");
    const button = document.createElement("BUTTON");
    button.classList.add("code-fold");
    button.innerHTML =
        "<span class='show'>Show code</span><span class='hide'>Hide code</span>";
    button.addEventListener("click", (e) => e.target.toggleAttribute("unfold"));
    el.prepend(button);
});
