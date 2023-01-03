
import { zoomIdentity } from "https://cdn.jsdelivr.net/npm/d3@7.7.0/+esm";
// function addLayer(id, drawing = false) {
//     let type = id === "floor" ? "floor" : "apartment"
//     const index = line_layers.length
//     line_layers.push(
//         line_group.append("g")
//             .attr("class", [`outline-layer ${type}`])
//             .attr("apartment-id", id)
//             .attr("layer-index", index)
//             .append("g")
//             .attr("shape-index", 0)
//             .attr("closed", false)
//     )
//     point_layers.push(
//         point_group
//             .append("g").attr("class", "points-layer")
//             .attr("apartment-id", id)
//             .attr("layer-index", index)
//             .attr("shape-index", 0)
//     )
//     allLines[index] = {
//         type: type,
//         lineInd: index,
//         floor_id: current_floor.id,
//         apartment_id: id === "floor" ? "NA" : id,
//         points: [[]]
//     }
//     layers.activateLayer(index)
//     createLayerButton(id)
// }

function getLayerIndex(selection) {
    return +selection.parentNode.parentNode.getAttribute("layer-index")
}

function activateLayer(ind, outline = false) {
    document.querySelectorAll("g").forEach(el => el.classList.remove("active"))
    document.querySelectorAll(".layer-btn").forEach(el => el.classList.remove("active"))
    document.querySelector(`.layer-btn[ref-index='${ind}']`).classList.add("active")
    if (outline) document.querySelectorAll(`g[layer-index='${ind}']`).forEach(el => el.classList.add("active"))
    focusOnFlat(ind)
}

function focusOnFlat(ind) {
    const screenMid = [screenWidth / 2, screenHeight / 2]
    // Reset transform.
    let transform = zoomIdentity;

    if (ind == 0) {
        document.querySelectorAll("[flat-index]").forEach(e => e.classList.add("active"))
    } else {
        document.querySelectorAll("[flat-index]").forEach(e => e.classList.remove("active"))
        const thisFlatLayer = document.querySelector(`[flat-index='${ind}']`)
        thisFlatLayer.classList.add("active")
        
        const {x, y, width, height} = thisFlatLayer.getBBox()
        const scale = .9 * Math.min(screenWidth / width, screenHeight / height);

        // Center [0, 0].
        transform = transform.translate(screenMid[0], screenMid[1]);
        // Apply scale.
        transform = transform.scale(scale);
        // Center elements.
        transform = transform.translate(-x - width / 2, -y - height / 2);
    }
    svg.transition().duration(750).call(
        zoom.transform, transform);        
}

function toggleLayerHighlight(ind) {
    const layer = document.querySelector(`.outline-layer[layer-index='${ind}']`)
    if (["highlight", "active"].some(cls => layer.classList.contains(cls))) {
        layer.classList.remove("highlight")
    } else layer.classList.add("highlight")
}

export {getLayerIndex, activateLayer, toggleLayerHighlight}