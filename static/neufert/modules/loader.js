
function loaderOn(text = "Loading") {
    document.getElementById("loading-text").innerText = text + "..."
    document.getElementById("loading").classList.add("active")
}
function loaderOff() {
    document.getElementById("loading-text").innerText = ""
    document.getElementById("loading").classList.remove("active")
}

export {loaderOn, loaderOff}