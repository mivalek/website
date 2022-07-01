countries = {
    JPN: "Japan",
    CZE: "Czechia",
    RUS: "Russia",
    GBR: "United Kingdom",
    USA: "USA",
    KOR: "South Korea",
    GER: "Germany",
    SLO: "Slovenia",
    AUT: "Austria",
};
data.forEach((d) => {
    const med_per_event = (+d.gold + +d.silver + +d.bronze) / d.participations;
    d["medals_per_event"] = med_per_event.toFixed(2);
});
const viz_div = document.getElementById("viz");
data.forEach((d, i) => {
    const head_container = document.createElement("div");
    head_container.classList.add("head-container");
    head_container.style.height = `${+d.tops / 2 + 40}px`;
    const head = document.createElement("div");
    head.classList.add("athlete-head");
    head.setAttribute("index", i);
    const flag = document.createElement("img");
    flag.classList.add("flag");
    const img = document.createElement("img");
    flag.src = `assets/img/countries/${d.country}.png`;
    img.src = `assets/img/athletes/${d.athlete
        .toLowerCase()
        .replaceAll(" ", "_")}.png`;
    const shadow = document.createElement("div");
    shadow.classList.add("head-shadow");
    head.appendChild(flag);
    head.appendChild(img);
    head.style.animationName = "fall-" + i;
    head.style.animationDuration = d.fall_freq2 + "s";
    shadow.style.animationName = "shadow-shrink-" + i;
    shadow.style.animationDuration = d.fall_freq2 + "s";
    head_container.appendChild(head);
    head_container.appendChild(shadow);
    viz_div.appendChild(head_container);
    const anim = document.getElementById("animations");
    anim.innerHTML =
        anim.innerHTML +
        `
            @keyframes fall-${i} {
                from {
                    margin-top: 0;
                }
                to {
                    margin-top: ${+d.tops / 2}px;
                }
            }
            @keyframes shadow-shrink-${i} {
            from {
                width: ${50 + +d.tops / 20}px;
                height: ${+d.tops / 40}px;
                top: ${+d.tops / 2 + 45 + +d.tops * 0.005}px;
                box-shadow: 0 0 5px 2px #0003;
            }

            to {
                width: 5px;
                height: 5px;
                top: ${+d.tops / 2 + 45}px;
                box-shadow: 0 0 0 #0003;
            }

        }
            `;
    head.addEventListener(
        "mouseenter",
        (e) => {
            fillDetails(e.target.getAttribute("index"));
            document.getElementById("details").classList.add("active");
        },
        (useCapture = true)
    );

    head.addEventListener(
        "mouseout",
        (e) => document.getElementById("details").classList.remove("active"),
        (useCapture = true)
    );
});

function fillDetails(index) {
    const d = data[index];
    let name = d.athlete;
    if (["JPN", "KOR"].includes(d.country))
        name = name
            .split(" ")
            .reverse()
            .join(" ")
            .replace("Jongwon", "Jong-won");
    document.getElementById("name-div").innerText = name;
    for (const key of Object.keys(d)) {
        const div = document.getElementById(key.replaceAll("_", "-"));
        if (!div) continue;
        if (key == "country") {
            div.innerText = countries[d[key]];
            continue;
        }
        let text = d[key];
        if (["tops_per_event", "fall_freq"].includes(key)) {
            text = parseFloat(text).toFixed(2);
        } else if (key == "height" && text !== "--") {
            text = text + " cm";
        }
        div.innerText = text;
    }
}
document
    .getElementById("info")
    .addEventListener(
        "mouseenter",
        (e) => e.target.classList.remove("beating"),
        {
            once: true,
        }
    );

document.querySelector("main").addEventListener("scroll", function (e) {
    const info = document.getElementById("info");
    const box = document.getElementById("details");
    const offset = -e.target.scrollLeft;
    box.style.right = offset + 30 + "px";
    info.style.right = offset + 20 + "px";
    document.getElementById("description").style.right = offset + 20 + "px";
});
