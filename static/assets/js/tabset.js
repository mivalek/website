document.querySelectorAll(".tabset").forEach((ts) => {
    const tabHeader = document.createElement("div");
    tabHeader.classList.add("tab-header");

    const tabContainer = document.createElement("div");
    tabContainer.classList.add("tab-container");
    const heights = [];
    const nTabs = ts.childElementCount;
    for (let i = 0; i < nTabs; i++) {
        const tab = ts.children[0]; // 0 is not a bug!
        heights.push(tab.scrollHeight);
        const tabContent = document.createElement("div");
        tabContent.classList.add("tab-content");
        tabContent.id = "tab-" + tab.id;
        const tabLabel = document.createElement("a");
        tabLabel.classList.add("tab-label");
        tabLabel.setAttribute("tabindex", "0");
        tabLabel.innerText = tab.id;
        tabLabel.setAttribute("ref-id", tabContent.id);
        tabHeader.appendChild(tabLabel);
        tabContent.appendChild(tab);
        tabContainer.appendChild(tabContent);
        tab.removeAttribute("id");
        if (i === 0) {
            if (tab.hasAttribute("data-src")) {
                tab.classList.add("lazy");
            }
            tabContent.classList.add("active");
            tabLabel.classList.add("active");
        }
        tabLabel.addEventListener("click", (e) => switchTab(e.target));
        tabLabel.addEventListener("keydown", (e) => {
            if (e.key === "Enter") switchTab(e.target);
        });
    }
    ts.appendChild(tabHeader);
    ts.appendChild(tabContainer);
    tabContainer.style.height = Math.max(...heights) + 5 + "px";
});

function switchTab(thisLab) {
    {
        thisLab.parentElement.parentElement
            .querySelectorAll(".tab-label, .tab-content")
            .forEach((lab) => lab.classList.remove("active"));
        thisLab.classList.add("active");
        const thisTab = thisLab.parentElement.parentElement.querySelector(
            `#${thisLab.getAttribute("ref-id")}`
        );
        thisTab.classList.add("active");
        thisTabChild = thisTab.children[0];
        if (thisTabChild.hasAttribute("data-src")) {
            thisTabChild.src = thisTabChild.dataset.src;
            thisTabChild.removeAttribute("data-src");
        }
    }
}
