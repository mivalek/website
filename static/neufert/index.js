// import * as d3 from "https://cdn.skypack.dev/d3@7";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.7.0/+esm";

const url = new URL(window.location.href); 
const isTest = url.searchParams.has("test");

function parseWKT(obj) {
    const geom = obj.geometry
        .replace(/POLYGON\s+\(+(.*?)\){2}.*/, "$1")
        .split(/\),\s+\(/)
        .map(x => x.split(/,\s+/)
            .map(y => y.split(" ")
                .map(z => parseFloat(z))))
    const out = {
        "type":"Feature",
        "geometry": {
            type: "Polygon",
            coordinates: geom
        },
        "properties": {
          "roomType": obj.entity_subtype.toLowerCase(),
          "featureType": obj.entity_type,
          "flatID": obj.apartment_id,
          "flloorID": obj.floor_id,
          "rowInd": obj.index
        }
    }
    return(out)
}

function parseData(arr) {
    let out = {
        "type":"FeatureCollection",
        "features": arr.map(x => parseWKT(x))
        }
    const linePoints = out.features.map(x => x.geometry.coordinates[0]).flat()   
    const xcoords = linePoints.map(x => x[0])
    const ycoords = linePoints.map(x => x[1])
    const lims = {
        x: [Math.min(...xcoords), Math.max(...xcoords)],
        y: [Math.min(...ycoords), Math.max(...ycoords)]
    }
    function expandLine(x) {
        return [x[0] > 0 ? x[0] * .9 : x[0] * 1.1,
        x[1] > 0 ? x[1] * 1.1 : x[1] * .9]
    }
    lims.x = expandLine(lims.x)
    lims.y = expandLine(lims.y)
    out.features.push({
        "type":"Feature",
        "geometry": {
            type: "Polygon",
            coordinates: [[[lims.x[0], lims.y[0]], [lims.x[1], lims.y[0]], [lims.x[1], lims.y[1]], [lims.x[0], lims.y[1]], [lims.x[0], lims.y[0]]]]
        },
        "properties": {
          "roomType": "margin",
          "featureType": "margin"
        }  
    })
    return(out);
        
}

function encodeWKT(data) {
    return "POLYGON (" + data.map(outline => "(" + outline.map(point => point.join(" ")).join(", ") + ")").join(", ") + ")" 
}

// https://stackoverflow.com/questions/105034/how-do-i-create-a-guid-uuid
function makeID() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+S4());
}

const id_url = "https://script.google.com/macros/s/AKfycbxLQkFSpDHlHAgvgKa77RVLVBEpBAI_LuL0mEiiQkCrghQyfqtwObrpSdwg0tIgXWT7/exec"
const data_url = "https://script.google.com/macros/s/AKfycbzBuiLlWyLTK5nKNi24955VwiMB2FLpAE8jflYG9i4tuQBguTgI9Gm3ctw7wbTRlOn4tg/exec"
const screenWidth = Math.min(1920, window.innerWidth - 20)
const screenHeight = Math.min(Math.max(768, window.innerHeight * .8), window.innerHeight - 20)
let point_radius = 6
let point_stroke = 5
let light_line = 1
let med_line = 7
let thick_line = 10
let scale = 1
let translate = {x: 0, y: 0}

let building_ids
let current_data
let current_floor
let current_flat = 1
let flats_on_current_floor = []  
let zoom = d3.zoom()
    .scaleExtent([1, 5])
    .translateExtent([[0, 0], [screenWidth, screenHeight]])
    .on('zoom', handleZoom);

function handleZoom(e) {
    ({k: scale, ...translate} = e.transform)
    point_radius = 6 / scale
    allLayers
        .attr('transform', e.transform)
        .attr("style", `--pt-radius:${point_radius + 'px'};--pt-stroke:${point_stroke / scale};--light-line:${light_line / scale};--med-line:${med_line / scale};--thick-line:${thick_line / scale};`)
    }

const svg = d3.select("#floorplan-container")
    .append("svg")
    .attr("viewBox", [0, 0, screenWidth, screenHeight])
    .attr("width", screenWidth)
    .attr("height", screenHeight)
    .call(zoom);

const allLayers = svg
    .append("g")
    .attr("style", `--pt-radius:${point_radius + 'px'};--pt-stroke:${point_stroke};--light-line:${light_line};--med-line:${med_line};--thick-line:${thick_line};`)

const layout = allLayers.append("g")
    .attr("id", "layout")
const line_group = allLayers.append("g")
    .attr("id", "line-group")
const point_group = allLayers.append("g")
    .attr("id", "point-group")

const tooltip = d3.select("#tooltip")

let line_layers = []
let shape_layers = []
let point_layers = []



let allLines = []
let linePoints = []
let floorplanPoints = []
let isPressedCtrl = false
let isPressedShift = false
let isDrawing = false
let isPrevious = localStorage.hasOwnProperty("previousFloor") // is previous floor outline available for retrieval?
let projection



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

  function getLayerIndex(selection) {
    return +selection.parentNode.parentNode.getAttribute("layer-index")
  }
function addPoint(ev, position=0, shape_index=-1) {
    const active_layer = document.querySelector(`g.points-layer.active`)
    if (!active_layer) return
    const index = +active_layer.getAttribute("layer-index")
    if (ev.defaultPrevented) return; // dragged
    const pointer_coord = d3.pointer(ev, this)
    const zoomed_coord = [(pointer_coord[0] - translate.x) / scale, (pointer_coord[1] - translate.y) / scale]
    let point = isPressedCtrl ?
        snap(zoomed_coord) :
        isPressedShift ? snap(zoomed_coord, linePoints): zoomed_coord
    if (ev.target.classList. contains("outline")) point = interpolate(pointer_coord, d3.select(ev.target).datum())
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
            allLines[index].points = [[{x: point[0], y: point[1], ind: allLines[index].points.length, id: makeID() }]]
        } else if (position == 0) {
            allLines[index].points[new_shape_index].push({x: point[0], y: point[1], ind: allLines[index].points.length, id: makeID() });
        } else {
            allLines[index].points[new_shape_index].splice(position, 0, {x: point[0], y: point[1], ind: allLines[index].points.length, id: makeID() });
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
        d3.select(this)
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
            if (isPressedCtrl && +d3.select(this).attr("ind") == 0) {
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
        .attr("d", d3.line()
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
                addPoint(event, +d3.select(this).attr("ind"), shape);
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
    let transform = d3.zoomIdentity;

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
function createLayerButton(refID) {
    const nbuttons = document.querySelectorAll(".layer-btn").length
    const btn = document.createElement("button")
    btn.innerHTML = refID === "floor" ? "Floor" : `Apartment ${nbuttons}`
    btn.setAttribute("ref-index", nbuttons)
    btn.setAttribute("ref-id", refID)
    btn.classList.add("layer-btn")
    btn.addEventListener("click", function(ev) {
        activateLayer(this.getAttribute("ref-index"))
    })
    btn.addEventListener("mouseenter", function(ev) {
        toggleLayerHighlight(this.getAttribute("ref-index"))
    })
    btn.addEventListener("mouseout", function(ev) {
        toggleLayerHighlight(this.getAttribute("ref-index"))
    })
    document.getElementById("layers-container").append(btn)
}

function activateOutditButtons(task) {
    document.querySelectorAll(".audit-container").forEach(e => e.id.includes(task) ? e.classList.add("active") : e.classList.remove("active"))
}

function resetAll() {
    layout.selectAll("g").remove()
    line_group.selectAll("g").remove()
    point_group.selectAll("g").remove()
    document.querySelectorAll(".layer-btn").forEach(btn => btn.remove()) 

    line_layers = []
    shape_layers = []
    point_layers = []
    allLines = []
    linePoints = []
    floorplanPoints = []
    isPressedCtrl = false
    isPressedShift = false
    current_flat = 1
}

function sleep(t) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, t);
    });
  }

function loaderOn(text = "Loading") {
    document.getElementById("loading-text").innerText = text + "..."
    document.getElementById("loading").classList.add("active")
}
function loaderOff() {
    document.getElementById("loading-text").innerText = ""
    document.getElementById("loading").classList.remove("active")
}

async function writeMsg(msg) {
    const msg_cont = document.getElementById("msg-container")
    msg_cont.classList.remove("new-msg")
    await sleep(200)
    msg_cont.innerHTML = msg
    msg_cont.classList.add("new-msg")
}
function build(raw_data) {
    current_data = parseData(raw_data)

    projection = d3.geoIdentity()
        .fitSize([screenWidth, screenHeight], current_data);

    flats_on_current_floor = [...new Set(raw_data.map(x => x.apartment_id))].filter(x => x && x != "NA") 

    for (const i in flats_on_current_floor) {
        const flat_data = current_data.features
                .filter(
                    x => !["margin", "outline", ].includes(x.properties.featureType) &&
                    x.properties.flatID == flats_on_current_floor[i]
                )

        layout.append("g")
        .attr("flat-index", +i + 1)
            .attr("data-id", flats_on_current_floor[i])
            .attr("data-midpoint", () => {
                const xcoords = flat_data.map(x => x.geometry.coordinates).flat().flat().map(p => p[0])
                const ycoords = flat_data.map(x => x.geometry.coordinates).flat().flat().map(p => p[1])
                const xmidpt = Math.min(...xcoords) + (Math.max(...xcoords) - Math.min(...xcoords))/2
                const ymidpt = Math.min(...ycoords) + (Math.max(...ycoords) - Math.min(...ycoords))/2
                const midpt = projection([xmidpt, ymidpt])
                return JSON.stringify(midpt)
            })
            .selectAll("path")
            .data(flat_data
            )            
            .enter().append("path")
            .attr("d", d3.geoPath().projection(projection))
            .attr('class', function (d) { return [d.properties.featureType, d.properties.roomType].join(" ") })
            .attr("data-index", d => d.properties.rowInd)
            .attr("data-label", d => d.properties.roomType)
            .on("click", function(event, d) {
                if (!this.parentNode.classList.contains("flagging")) return
                this.classList.contains("flagged") ? this.classList.remove("flagged") : this.classList.add("flagged")
                d.properties.flagged = !d.properties.flagged
                if (d.properties.flagged) d.properties.flag = this.parentNode.getAttribute("flag")
            })
            .on("mouseover", function(event) {
                if (!this.classList.contains("area")) return
                if (!this.parentNode.classList.contains("active")) return
                const bbox = this.getBoundingClientRect()

                const label = this.dataset.label.replace("_", " ")
                tooltip
                    .text(label)
                    .attr("style", `top:${Math.round(bbox.y + bbox.height / 2)}px;left:${Math.round(bbox.x + bbox.width / 2)}px;`)
                    // .attr("left", bbox.x + bbox.width)
                    .classed("active", true);
            })
            .on("mouseout", function(){
                tooltip
                    .classed("active", false);
            }); 
    }
    
    let outline_data = current_data.features.filter(x => x.properties.featureType == "outline")
    
    if (outline_data.length) {
        allLines = outline_data.map((x, i) => {
            const points = x.geometry.coordinates.map((y, j) => {
                y.splice(-1)
                return y.map((z, j) => {
                    const projectedCoords = projection(z)
                    return {x: projectedCoords[0], y: projectedCoords[1], ind: j, id: makeID(), inner: false}
                    })
                })
            return {
                type: x.properties.roomType,
                lineInd: i,
                rowInd: x.properties.rowInd,
                floor_id: x.properties.floorID,
                apartment_id: x.properties.flatID,
                points: points
                }
        })

        for (let j in allLines) {
            const appID = (allLines[j].apartment_id == "NA" ? "floor" : allLines[j].apartment_id) || "floor"
            line_layers.push(
                line_group.append("g")
                    .attr("class", [`outline-layer ${allLines[j].type}`])
                    .attr("layer-index", j)
                    .attr("apartment-id", appID)
            )
            shape_layers.push([])
            for (let k = 0; k < allLines[j].points.length; k++) {
                shape_layers[j].push(line_layers[j]
                    .append("g")
                    .attr("closed", true)
                    .attr("shape-index", k)
                )
                drawLine(j, k)
            }
            point_layers.push(
                point_group
                    .append("g").attr("class", "points-layer")
                    .attr("apartment-id", appID)
                    .attr("layer-index", j)
            )
            drawPoints(j)
            linePoints = allLines.map(x => x.points).flat().flat() 
            floorplanPoints = current_data.features
                .filter(x => x.properties.roomType == "wall")
                .map(x => x.geometry.coordinates)
                .flat()
                .flat()
                .map(function(x) {
                    const projected = projection(x)
                    return {x: projected[0], y: projected[1]}})

            createLayerButton(appID)
        }
    } else {

                ///////////////////
                // ADD IF NEEDED //
                ///////////////////

        // addLayer("floor")
        // for (let f of current_floor.apartments) {
        //     addLayer(f)
        // }
        // line_layers.push(
        //     line_group.append("g")
        //         .attr("class", "outline active")
        //         .attr("layer-index", 0)
        //         .attr("closed", false)
        // )
        // point_layers.push(
        //     point_group
        //         .append("g").attr("class", "points active")
        //         .attr("layer-index", 0)
        // )
    }
    drawingOn();
}

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
//     activateLayer(index)
//     createLayerButton(id)
// }

const drag = d3.drag()
    .on("start", function() {
        d3.select(this).raise();
    })
    .on("drag", function(event, d) {
        const index = getLayerIndex(this)
        const shape = +this.getAttribute("shape")
        let point = isPressedCtrl ?
            snap([event.x, event.y]) :
            isPressedShift ? snap([event.x, event.y], linePoints, d.id): [event.x, event.y]
        d3.select(this)
            .attr("cx", d.x = Math.max(Math.min(point[0], screenWidth - point_radius), point_radius))
            .attr("cy", d.y = Math.max(Math.min(point[1], screenHeight - point_radius), point_radius));
        drawLine(index, shape)
    })
    .on("end", function(event, d) {
        const index = getLayerIndex(this)
        const shape = +this.getAttribute("shape")
        d3.select(point_layers[index].node().childNodes[shape]).selectAll("circle").sort(function(a, b){
        return a["ind"]-b["ind"];
        })
    }
    );

// from https://stackoverflow.com/questions/15232356/projection-of-a-point-on-line-defined-by-2-points
function interpolate(point, line) {
    let isValid = false;
    let x = [];
    let y = [];
    ([{x: x[0], y: y[0]}, {x: x[1], y: y[1]}] = line)

    let r = [0, 0];
    if (y[0] == y[1] && x[0] == x[1]) y[0] -= 0.00001;

    let U = ((point[1] - y[0]) * (y[1] - y[0])) + ((point[0] - x[0]) * (x[1] - x[0]));

    let Udenom = Math.pow(y[1] - y[0], 2) + Math.pow(x[1] - x[0], 2);

    U /= Udenom;

    r[1] = y[0] + (U * (y[1] - y[0]));
    r[0] = x[0] + (U * (x[1] - x[0]));

    let minx, maxx, miny, maxy;

    miny = Math.min(y[0], y[1]);
    maxy = Math.max(y[0], y[1]);

    minx = Math.min(x[0], x[1]);
    maxx = Math.max(x[0], x[1]);

    isValid = (r[1] >= miny && r[1] <= maxy) && (r[0] >= minx && r[0] <= maxx);

    return isValid ? r : null;
}

function snap(point, to = floorplanPoints, id = null) {
    let nearest_point = point
    for (let i = 0; i < to.length; i++) {
        if (to[i].id && id == to[i].id) continue
        if (Math.abs(to[i].x - point[0]) > 10) continue
        if (Math.abs(to[i].y - point[1]) > 10) continue
        nearest_point = [to[i].x, to[i].y]
        break
    }
    return nearest_point
}

async function fetchBuilding() {
    const response = await fetch(id_url)
    const building = await response.json()    
    building_ids = building
    if (building.length == 0) {
        throw new Error("no more data")
    }
    return console.log("Building data loaded")
}

async function loadBuldingIfNeeded() {
    if (building_ids.floors.length == 0) {
        loader_msg = 
        localStorage.removeItem("previousFloor")
        isPrevious = false
        // unlock completed building in _id spreadsheet
        await fetch(id_url, {
            method: "POST",
            mode: "no-cors",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
            },
            redirect: "follow",
            body: JSON.stringify({
                id: building_ids.id,
                startRow: +building_ids.startRow,
                nrows: +building_ids.nrows,
                action: "unlock"
            }),
        })  
        loaderOn("Loading next building")
        await fetchBuilding()
        console.log("^New building")
        return
    }
    loaderOn("Loading next floor")
}
async function fetchFloorData() {
    current_floor = building_ids.floors.shift()
    let query = data_url + "?id=" + current_floor.id
    if (isTest) query += "&test=true"
    const response = await fetch(query)
    const floor_data = await response.json()
    return floor_data
}

// draw new floor/building
async function nextFloor() {
    resetAll()
    await loadBuldingIfNeeded()
    if (building_ids.length == 0) throw new Error("no data")
    const data = await fetchFloorData()
    build(data)
    loaderOff()
    writeMsg("Does apartment 1 look OK?")
    activateLayer(1)
    activateOutditButtons("data")
}

function finished() {
    document.getElementById("finished").classList.add("active")
    loaderOff()
}

async function saveData() {
    // save data
    loaderOn("Saving")
    for (let i = 0; i < allLines.length; i++) {
        const index = current_data.features.findIndex(x => x.properties.rowInd == allLines[i].rowInd)
        current_data.features[index].geometry.coordinates = allLines[i].points.map(outline => {
            const out = outline.map(point => projection.invert([point.x, point.y]))
            out.push(out[0])
            return out
        })
        // current_data.features[index].geometry.coordinates.push
        current_data.features[index].properties.inner = "(" + allLines[i].points.map(outline => "(" + outline.map(segment => segment.inner ? "I" : "O").join("") + ")").join(", ") + ")"
        current_data.features[index].properties.flag = allLines[i].flag
        current_data.features[index].properties.flagged = allLines[i].flagged
    }

    let out_data = {flags: {unusual: [], wrong: [], missing: []}}
    out_data.outlines = current_data.features
        .filter(x => x.properties.featureType == "outline")
        .map(x => {
            return {inner: x.properties.inner, geometry: encodeWKT(x.geometry.coordinates), index: x.properties.rowInd}
        })
    current_data.features.filter(x => x.properties.flagged).forEach(x => out_data.flags[x.properties.flag].push(x.properties.rowInd))
    out_data.test = isTest;

    // mark floor in _id spreadsheet as edited
    fetch(id_url, {
        method: "POST",
        mode: "no-cors",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json",
        },
        redirect: "follow",
        body: JSON.stringify({
            id: current_floor.id,
            startRow: +current_floor.startRow,
            nrows: +current_floor.nrows,
            action: "markAsEdited"
        }),
    })

    await fetch(data_url, {
        method: "POST",
        mode: "no-cors",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json",
        },
        redirect: "follow",
        body: JSON.stringify(out_data),
    })
    // loaderOff()
    localStorage.setItem("previousFloor", JSON.stringify(allLines[0].points))
    isPrevious = true
    return console.log("saved")
}

loaderOn()
fetchBuilding()
    .then(
        () => fetchFloorData(),
        (err) => Promise.reject(err)
    )
    .then(
        (data) => {
            build(data)
            loaderOff()        
            document.getElementById("missing").classList.add("inactive")
            writeMsg("Does apartment 1 look OK?")        
            activateLayer(1)
            activateOutditButtons("data")

            // add button functions
            document.getElementById("unusual").addEventListener("click", () => {
                const x = document.querySelector(`[flat-index="${current_flat}"]`)
                x.classList.add("flagging")
                x.setAttribute("flag", "unusual")
                writeMsg("Click on elements that look unusual")
                activateOutditButtons("flagging")
            })
            document.querySelectorAll("#data-ok, #flagging-done").forEach(e => e.addEventListener("click", () => {
                    activateLayer(current_flat, true)
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
                activateLayer(current_flat, true)
            })
            document.getElementById("flag-all").addEventListener("click", () => {
                const x = document.querySelector(`[flat-index="${current_flat}"]`)
                const anyNotflagged = Array.from(x.querySelectorAll("path")).some(el => !el.classList.contains("flagged"))
                x.querySelectorAll("path").forEach(p => {
                    anyNotflagged ? p.classList.add("flagged") : p.classList.remove("flagged")
                    let d = d3.select(p).datum()
                    d.properties.flagged = anyNotflagged
                    d.properties.flagged ? d.properties.flag = x.getAttribute("flag") : delete d.properties.flag
                })
            })
            document.getElementById("cancel").addEventListener("click", () => {
                const x = document.querySelector(`[flat-index="${current_flat}"]`)
                x.querySelectorAll("path").forEach(p => {
                    p.classList.remove("flagged")
                    let d = d3.select(p).datum()
                    d.properties.flagged = false
                    delete d.properties.flag                
                })
                writeMsg(`Does apartment ${current_flat} look OK?`)
                activateOutditButtons("data-audit")
                activateLayer(current_flat)
            })
            document.getElementById("remove-outline").addEventListener("click", function() {
                const index = +this.getAttribute("index")
                allLines[index].points = []
                shape_layers[index].forEach((e, i) => i == 0 ?
                    e.attr("closed", "false").selectAll("path").remove() :
                    e.remove())
                drawPoints(index)
                activateLayer(index, true)
            })
            document.getElementById("prev-floor").addEventListener("click", function() {
                const current_floor_outline = [...allLines[0].points] 
                allLines[0].points = JSON.parse(localStorage.getItem("previousFloor"))
                localStorage.setItem("previousFloor", JSON.stringify(current_floor_outline))
                drawPoints(0)
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
                    drawLine(0, i)
                }
                activateLayer(0, true)
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
                    activateLayer(current_flat)
                } else {
                    current_flat ++            
                    writeMsg(`Does apartment ${current_flat} look OK?`)
                    activateOutditButtons("data-audit")
                    activateLayer(current_flat)
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
            // unlock
            if (isTest) fetch(id_url, {
                method: "POST",
                mode: "no-cors",
                cache: "no-cache",
                headers: {
                    "Content-Type": "application/json",
                },
                redirect: "follow",
                body: JSON.stringify({
                    id: building_ids.id,
                    startRow: +building_ids.startRow,
                    nrows: +building_ids.nrows,
                    action: "unlock"
                }),
            })
        },
        () => {
            console.log("nothing to build");
            finished()
        }
    )
