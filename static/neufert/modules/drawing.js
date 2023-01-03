import * as utils from "./utils.js"
import { getLayerIndex } from "./layers.js"
import {pointer, select, line} from "https://cdn.jsdelivr.net/npm/d3@7.7.0/+esm";

function addPoint(ev, position=0, shape_index=-1) {
    const active_layer = document.querySelector(`g.points-layer.active`)
    if (!active_layer) return
    const index = +active_layer.getAttribute("layer-index")
    if (ev.defaultPrevented) return; // dragged
    const pointer_coord = pointer(ev, this)
    const zoomed_coord = [(pointer_coord[0] - translate.x) / scale, (pointer_coord[1] - translate.y) / scale]
    let point = isPressedCtrl ?
        utils.snap(zoomed_coord) :
        isPressedShift ? utils.snap(zoomed_coord, linePoints): zoomed_coord
    if (ev.target.classList.contains("outline")) point = utils.interpolate(pointer_coord, select(ev.target).datum())
    let new_shape_index = shape_index
    if (shape_index==-1) {   
        new_shape_index = allLines[index].points.length         
            allLines[index].points.push([{x: point[0], y: point[1], ind: allLines[index].points.length }]);
            shape_layers[index].push(line_layers[index]
                .append("g")
                .attr("closed", false)
                .attr("shape-index", new_shape_index))
    } else {
        if (allLines[index].points.length == 0) {
            allLines[index].points = [[{x: point[0], y: point[1], ind: allLines[index].points.length, id: utils.makeID() }]]
        } else if (position == 0) {
            allLines[index].points[new_shape_index].push({x: point[0], y: point[1], ind: allLines[index].points.length, id: utils.makeID() });
        } else {
            allLines[index].points[new_shape_index].splice(position, 0, {x: point[0], y: point[1], ind: allLines[index].points.length, id: utils.makeID() });
        }
        allLines[index].points[new_shape_index].forEach((e, i) => e.ind = i)
    }
    drawLine(index, new_shape_index)
    drawPoints(index)
    linePoints = allLines.map(x => x.points).flat().flat() 
}

function removePoint(point_data, layer_index, shape_index) {
    if (allLines[layer_index].points[shape_index].length == 1) {
        allLines[layer_index].points.splice(shape_index, 1)
        const remove_layer = shape_layers[layer_index].splice(shape_index, 1)
        remove_layer[0].node().remove()
    } else {
        allLines[layer_index].points[shape_index].splice(point_data.ind, 1);            
        allLines[layer_index].points[shape_index].forEach((e, i) => e.ind = i)
        drawLine(layer_index, shape_index)
    }
    drawPoints(layer_index)
    linePoints = allLines.map(x => x.points).flat().flat() 
}
function drawPoints(index) {
    point_layers[index].selectAll("g")
        .data(allLines[index].points)
        .join("g")
        .each(function(d, i) {
        select(this)
        .attr("shape-index", i)
        .selectAll("circle")
        .data(d)
        .join("circle")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("class", "point")
        .attr("index", d => d.ind)
        .attr("shape", i)
        .call(drag)
        .on("click", function(event, d) {
            event.stopPropagation();
            const index = getLayerIndex(this)
            const shape = +this.getAttribute("shape")
            if (event.defaultPrevented) return; // dragged
            if (isPressedCtrl && +select(this).attr("ind") == 0) {
                shape_layers[index][shape].node().setAttribute("closed", true)
                drawLine(index, shape)
                return
            }
            removePoint(d, index, shape)
          })
        }).exit().remove()
}
function drawLine(layer_index, shape_index) {
    const close = shape_layers[layer_index][shape_index].node().getAttribute("closed") === "true"
    shape_layers[layer_index][shape_index].selectAll("path").remove();
    if (allLines[layer_index].points[shape_index].length < 2) return
    if (allLines[layer_index].points[shape_index].length == 2) {
        shape_layers[layer_index][shape_index].node().setAttribute("closed", false)
    }
    let lineData = [...allLines[layer_index].points[shape_index]] // shalow copy (value, not ref)
    if (close) lineData.push(lineData[0])
    for (let i = 1; i < lineData.length; i++) {
        const isInner = lineData[i - 1].inner
        shape_layers[layer_index][shape_index].append("path")
        .datum(lineData.slice(i-1, i+1))
        .join("path")
        .attr("d", line()
        .x(d => d.x)
        .y(d => d.y)
        )
        .attr("class", isInner ? "outline in-wall" : "outline")
        .attr("ind", i)
        .on("click", function(event, d) {
            const index = getLayerIndex(this)
            const shape = +this.parentNode.getAttribute("shape-index")
            if (!document.querySelectorAll(".outline-layer")[index].classList.contains("active") ) return
            event.stopPropagation();
            if (isPressedCtrl) {
                const shape = this.parentNode.getAttribute("shape-index")
                addPoint(event, +select(this).attr("ind"), shape);
                return
            }
            const segment_index = +this.getAttribute("ind")
            this.classList.contains("in-wall") ? this.classList.remove("in-wall") : this.classList.add("in-wall")
            allLines[index].points[shape][segment_index - 1].inner = !allLines[index].points[shape][segment_index - 1].inner
        })
    }
    
}

function drawingOn() {
    isDrawing = true    
    svg.on("click", (event) => {
        const open_shape = document.querySelector(`.outline-layer.active g[closed=false]`)
        let shape = -1
        if (open_shape) shape = +open_shape.getAttribute("shape-index")
        addPoint(event, 0, shape)
    })
}

// function drawingOff() {
//     isDrawing = false
//     svg.on("click", null)
// }

export {drawLine, drawPoints, drawingOn}