// read URL query params
// https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  });
  // Get the value of "some_key" in eg "https://example.com/?some_key=some_value"
const totalTime = +params.time; // "some_value"
let remainingTime = totalTime * 60
let timer, startTime, pacerRate


function setTimer() {    
    const min = Math.floor(remainingTime / 60);
    const sec = remainingTime % 60;
    document.getElementById("minutes").innerText = String(min).padStart(2, 0);
    document.getElementById("seconds").innerText = String(sec).padStart(2, 0);
}

function updateTimer() {
    remainingTime = remainingTime - 1;
    if (remainingTime === -1) {
        document.getElementById("pacer").classList.remove("active")
        document.getElementById("overlay").classList.add("active")        
        clearInterval(timer)
        document.getElementById("results").innerHTML = recordData()
        return
    }
    setTimer();
}

function getClientTime() {
    const date = new Date();
    const localTime = date.toLocaleTimeString(); // user's local time
    const timeZone = date.getTimezoneOffset() / 60; // offset from GMT in hours
    const out = {time: localTime, zone: timeZone};
    // console.log(out) // print in console, not needed
    return(out)
}

function allChecked() {
    let isChecked = [];
    document.querySelectorAll("input[type='checkbox']").forEach(chb => isChecked.push(chb.checked));
    return(isChecked.every(e => e === true));
}

function isId() {
    return(document.querySelector("input#ppt-id").value !== "")
}

function isSetPacerRate() {
    return(document.querySelector("select#prate-select").value !== "")
}

function activateButton() {
    const btn = document.getElementById("start-button")
    allChecked() && isId() && isSetPacerRate() ?
        btn.classList.add("active") :
        btn.classList.remove("active")
}

function startButtonFunction() {
        
    document.getElementById("panel-left").classList.add("hidden");

    timer = setInterval(updateTimer, 1000);
    startTime = getClientTime();

    pacerRate = +document.getElementById("prate-select").value
    const pace = 30 / pacerRate
    document.documentElement.style.setProperty('--pace', pace);
    const pacer = document.getElementById("pacer")
    pacer.children[0].style.animationDuration = pace + "s";
    pacer.classList.add("active");

    document.getElementById("start-button").classList.remove("active")
}

function recordData() {
    const id = document.getElementById("ppt-id").value
    // totalTime
    out = {
        id: id,
        pacer_rate: pacerRate,
        total_time: totalTime,
        start_time: startTime.time,
        time_zone: startTime.zone
    }
    return JSON.stringify(out)
}
function onLoad() {
    setTimer();
    document.querySelectorAll("input, select").forEach(
        el => el.addEventListener("input", () => activateButton())
    );
    document.getElementById("start-button").addEventListener("click", startButtonFunction);
    select = document.getElementById('prate-select');

    for (let i = 40; i <= 200; i++){
        const val = i / 10
        const opt = document.createElement('option');
        opt.value = val;
        opt.innerHTML = val;
        select.appendChild(opt);
    }
}
window.onload = onLoad;