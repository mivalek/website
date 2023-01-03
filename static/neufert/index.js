// import * as d3 from "https://cdn.skypack.dev/d3@7";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.7.0/+esm";
import * as buttons from "./modules/buttons.js";
import * as data from "./modules/data.js";
import * as utils from "./modules/utils.js"
import * as loader from "./modules/loader.js";
import * as drawing from "./modules/drawing.js";
import * as layers from "./modules/layers.js";


zoom = d3.zoom()
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

svg = d3.select("#floorplan-container")
    .append("svg")
    .attr("viewBox", [0, 0, screenWidth, screenHeight])
    .attr("width", screenWidth)
    .attr("height", screenHeight)
    .call(zoom);

const allLayers = svg
    .append("g")
    .attr("style", `--pt-radius:${point_radius + 'px'};--pt-stroke:${point_stroke};--light-line:${light_line};--med-line:${med_line};--thick-line:${thick_line};`)

layout = allLayers.append("g")
    .attr("id", "layout")
line_group = allLayers.append("g")
    .attr("id", "line-group")
point_group = allLayers.append("g")
    .attr("id", "point-group")


drag = d3.drag()
    .on("start", function() {
        d3.select(this).raise();
    })
    .on("drag", function(event, d) {
        const index = layers.getLayerIndex(this)
        const shape = +this.getAttribute("shape")
        let point = isPressedCtrl ?
            utils.snap([event.x, event.y]) :
            isPressedShift ? utils.snap([event.x, event.y], linePoints, d.id): [event.x, event.y]
        d3.select(this)
            .attr("cx", d.x = Math.max(Math.min(point[0], screenWidth - point_radius), point_radius))
            .attr("cy", d.y = Math.max(Math.min(point[1], screenHeight - point_radius), point_radius));
        drawing.drawLine(index, shape)
    })
    .on("end", function(event, d) {
        const index = layers.getLayerIndex(this)
        const shape = +this.getAttribute("shape")
        d3.select(point_layers[index].node().childNodes[shape]).selectAll("circle").sort(function(a, b){
        return a["ind"]-b["ind"];
        })
    }
    );

loader.loaderOn()
data.fetchBuilding()
    .then(
        () => data.fetchFloorData(),
        (err) => Promise.reject(err)
    )
    .then(
        (resp) => {
            window.addEventListener('beforeunload', (e) => {                    
                e.preventDefault();
                fetch(id_url, {
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
              });
            data.build(resp)
            loader.loaderOff()        
            document.getElementById("missing").classList.add("inactive")
            utils.writeMsg("Does apartment 1 look OK?")        
            layers.activateLayer(1)
            buttons.activateOutditButtons("data")

            buttons.addButtonListeners()
            // unlock
            if (isTest) data.unlock()
        },
        () => {
            console.log("nothing to build");
            data.finished()
        }
    )
