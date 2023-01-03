import { writeMsg } from "./utils.js"
import { saveData, nextFloor, finished } from "./data.js"
import * as layers from "./layers.js"
import {select} from "https://cdn.jsdelivr.net/npm/d3@7.7.0/+esm";

function createLayerButton(refID) {
    const nbuttons = document.querySelectorAll(".layer-btn").length
    const btn = document.createElement("button")
    btn.innerHTML = refID === "floor" ? "Floor" : `Apartment ${nbuttons}`
    btn.setAttribute("ref-index", nbuttons)
    btn.setAttribute("ref-id", refID)
    btn.classList.add("layer-btn")
    btn.addEventListener("click", function(ev) {
        layers.activateLayer(this.getAttribute("ref-index"))
    })
    btn.addEventListener("mouseenter", function(ev) {
        layers.toggleLayerHighlight(this.getAttribute("ref-index"))
    })
    btn.addEventListener("mouseout", function(ev) {
        layers.toggleLayerHighlight(this.getAttribute("ref-index"))
    })
    document.getElementById("layers-container").append(btn)
}

function activateOutditButtons(task) {
    document.querySelectorAll(".audit-container").forEach(e => e.id.includes(task) ? e.classList.add("active") : e.classList.remove("active"))
}

function addButtonListeners() {
    window.addEventListener("keydown", (event) => {
        if (event.ctrlKey) {
        isPressedCtrl = true;
        } else if (event.shiftKey) {
            isPressedShift = true;
        }
    });

    window.addEventListener("keyup", (event) => {
        if (!event.ctrlKey) {
        isPressedCtrl = false;
        }
        if (!event.shiftKey) {
            isPressedShift = false;
        }
    });
    
    // add button functions
    document.getElementById("unusual").addEventListener("click", () => {
        const x = document.querySelector(`[flat-index="${current_flat}"]`)
        x.classList.add("flagging")
        x.setAttribute("flag", "unusual")
        writeMsg("Click on elements that look unusual")
        activateOutditButtons("flagging")
    })
    document.querySelectorAll("#data-ok, #flagging-done").forEach(e => e.addEventListener("click", () => {
            layers.activateLayer(current_flat, true)
            writeMsg(`Review/edit ${current_flat == 0 ? "building" : `apartment ${current_flat}`} outline and mark inside walls`)
            current_flat == 0 && isPrevious ? document.getElementById("prev-floor").classList.remove("inactive") : document.getElementById("prev-floor").classList.add("inactive")
            activateOutditButtons("outline", current_flat == 0)
            document.getElementById("remove-outline").setAttribute("index", current_flat)
            
            document.getElementById("missing").classList.add("inactive")
            document.getElementById("wrong").classList.remove("inactive")
            document.getElementById("unusual").classList.remove("inactive")
            
            if (current_flat == 0) return

            const x = document.querySelector(`[flat-index="${current_flat}"]`)
            x.classList.remove("flagging")
            x.removeAttribute("flag")
        })
    )
    document.getElementById("wrong").addEventListener("click", () => {
        const x = document.querySelector(`[flat-index="${current_flat}"]`)
        x.classList.add("flagging")
        x.setAttribute("flag", "wrong")
        writeMsg("Click on elements that look wrong")
        activateOutditButtons("flagging")
    })
    document.getElementById("missing").addEventListener("click", function() {
        const index = +this.getAttribute("index")
        allLines[index].flagged = true
        allLines[index].flag = "missing"
        this.classList.add("inactive")
        document.getElementById("wrong").classList.remove("inactive")
        document.getElementById("unusual").classList.remove("inactive")
        writeMsg("Review/edit building outline and mark inside walls")
        activateOutditButtons("outline")
        document.getElementById("remove-outline").setAttribute("index", current_flat)
        layers.activateLayer(current_flat, true)
    })
    document.getElementById("flag-all").addEventListener("click", () => {
        const x = document.querySelector(`[flat-index="${current_flat}"]`)
        const anyNotflagged = Array.from(x.querySelectorAll("path")).some(el => !el.classList.contains("flagged"))
        x.querySelectorAll("path").forEach(p => {
            anyNotflagged ? p.classList.add("flagged") : p.classList.remove("flagged")
            let d = select(p).datum()
            d.properties.flagged = anyNotflagged
            d.properties.flagged ? d.properties.flag = x.getAttribute("flag") : delete d.properties.flag
        })
    })
    document.getElementById("cancel").addEventListener("click", () => {
        const x = document.querySelector(`[flat-index="${current_flat}"]`)
        x.querySelectorAll("path").forEach(p => {
            p.classList.remove("flagged")
            let d = select(p).datum()
            d.properties.flagged = false
            delete d.properties.flag                
        })
        writeMsg(`Does apartment ${current_flat} look OK?`)
        activateOutditButtons("data-audit")
        layers.activateLayer(current_flat)
    })
    document.getElementById("remove-outline").addEventListener("click", function() {
        const index = +this.getAttribute("index")
        allLines[index].points = []
        shape_layers[index].forEach((e, i) => i == 0 ?
            e.attr("closed", "false").selectAll("path").remove() :
            e.remove())
        drawing.drawPoints(index)
        layers.activateLayer(index, true)
    })
    document.getElementById("prev-floor").addEventListener("click", function() {
        const current_floor_outline = [...allLines[0].points] 
        allLines[0].points = JSON.parse(localStorage.getItem("previousFloor"))
        localStorage.setItem("previousFloor", JSON.stringify(current_floor_outline))
        drawing.drawPoints(0)
        shape_layers[0].forEach((e, i) => i == 0 ?
            e.attr("closed", "false").selectAll("path").remove() :
            e.remove())
        shape_layers[0] = []
        for (let i = 0; i < allLines[0].points.length; i++) {
            shape_layers[0].push(line_layers[0]
                .append("g")
                .attr("closed", true)
                .attr("shape-index", i)
            )
            drawing.drawLine(0, i)
        }
        layers.activateLayer(0, true)
        let buttonText = this.innerText
        this.innerText = buttonText == "Back to current" ? "Use previous" : "Back to current"
    })
    document.getElementById("outline-audit-done").addEventListener("click", () => {
        if (current_flat == 0) {
            activateOutditButtons("next")
            return
        }
        if (current_flat == flats_on_current_floor.length) {                
            document.getElementById("missing").classList.remove("inactive")
            document.getElementById("wrong").classList.add("inactive")
            document.getElementById("unusual").classList.add("inactive")
            current_flat = 0
            writeMsg("Does it look like there are flats missing on the floor?")
            activateOutditButtons("data-audit")
            document.getElementById("remove-outline").setAttribute("index", current_flat)
            layers.activateLayer(current_flat)
        } else {
            current_flat ++            
            writeMsg(`Does apartment ${current_flat} look OK?`)
            activateOutditButtons("data-audit")
            layers.activateLayer(current_flat)
        }
    })
    document.getElementById("next").addEventListener("click", () => {
        saveData()
            .then(() => nextFloor())
            .then(
                () => console.log("all done"),
                () => finished()
            )
    })
}

export {addButtonListeners, createLayerButton, activateOutditButtons}