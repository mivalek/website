
import * as utils from "./utils.js";
import * as loader from "./loader.js";
import * as buttons from "./buttons.js";
import * as drawing from "./drawing.js";
import {activateLayer} from "./layers.js";
// import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.7.0/+esm";
import {geoPath, geoIdentity} from "https://cdn.jsdelivr.net/npm/d3@7.7.0/+esm";

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
    let loader_msg = "Loading next floor"
    if (building_ids.floors.length == 0) {
        loader_msg = "Loading next building"
        localStorage.removeItem("previousFloor")
        isPrevious = false
        // unlock completed building in _id spreadsheet
        await unlock() 
        loader.loaderOn(loader_msg)
        const resp = await fetchBuilding()
        console.log("^New building")
    }
    return
}
async function fetchFloorData() {
    current_floor = building_ids.floors.shift()
    let query = data_url + (isTest ? "&id=" : "?id=") + current_floor.id
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
    loader.loaderOff()
    utils.writeMsg("Does apartment 1 look OK?")
    activateLayer(1)
    buttons.activateOutditButtons("data")
}

async function saveData() {
    // save data
    loader.loaderOn("Saving")
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
            return {inner: x.properties.inner, geometry: utils.encodeWKT(x.geometry.coordinates), index: x.properties.rowInd}
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
    // current_flat = -1
}

function build(raw_data) {
    current_data = utils.parseData(raw_data)

    projection = geoIdentity()
        .fitSize([screenWidth, screenHeight], current_data);

    flats_on_current_floor = [...new Set(raw_data.map(x => x.apartment_id))].filter(x => x && x != "NA") 
    flats_to_review = current_floor.apartments.filter(e => e.review).map(e => flats_on_current_floor.indexOf(e.id) + 1) 
    current_flat = flats_to_review[0]

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
            .attr("d", geoPath().projection(projection))
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
                tooltip.innerText = label
                tooltip.setAttribute("style", `top:${Math.round(bbox.y + bbox.height / 2)}px;left:${Math.round(bbox.x + bbox.width / 2)}px;`)
                    // .attr("left", bbox.x + bbox.width)
                tooltip.classList.add("active");
            })
            .on("mouseout", function(){
                tooltip.classList.remove("active");
            }); 
    }
    
    // flats_on_current_floor = current_floor.apartments.filter(e => e.keep).map(e => e.id)

    let outline_data = current_data.features.filter(x => x.properties.featureType == "outline")
    
    if (outline_data.length) {
        allLines = outline_data.map((x, i) => {
            const points = x.geometry.coordinates.map((y, j) => {
                y.splice(-1)
                return y.map((z, j) => {
                    const projectedCoords = projection(z)
                    return {x: projectedCoords[0], y: projectedCoords[1], ind: j, id: utils.makeID(), inner: false}
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
                drawing.drawLine(j, k)
            }
            point_layers.push(
                point_group
                    .append("g").attr("class", "points-layer")
                    .attr("apartment-id", appID)
                    .attr("layer-index", j)
            )
            drawing.drawPoints(j)
            linePoints = allLines.map(x => x.points).flat().flat() 
            floorplanPoints = current_data.features
                .filter(x => x.properties.roomType == "wall")
                .map(x => x.geometry.coordinates)
                .flat()
                .flat()
                .map(function(x) {
                    const projected = projection(x)
                    return {x: projected[0], y: projected[1]}})

            buttons.createLayerButton(appID)
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
    drawing.drawingOn();
}

function finished() {
    document.getElementById("finished").classList.add("active")
    loader.loaderOff()
}

async function unlock() {
    await fetch(id_url, {
        method: "POST",
        keepalive: true,
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
    console.log("building data unlocked");
}
export {build, nextFloor, fetchFloorData, fetchBuilding, saveData, finished, unlock}