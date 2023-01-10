function sleep(t) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, t);
    });
  }

// https://stackoverflow.com/questions/105034/how-do-i-create-a-guid-uuid
function makeID() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+S4());
}

async function writeMsg(msg) {
    const msg_cont = document.getElementById("msg-container")
    msg_cont.classList.remove("new-msg")
    await sleep(200)
    msg_cont.innerHTML = msg
    msg_cont.classList.add("new-msg")
}

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

function setInfo(flat_index) {
    document.querySelector("#flat-id .value").innerText = flat_index === 0 ? "-" : flats_on_current_floor[flat_index]
    document.querySelector("#floor-id .value").innerText = current_floor.id
    document.querySelector("#building-id .value").innerText = building_ids.id
    document.getElementById("copy").setAttribute("data-info", `Building ID: ${current_floor.id}\nFloor ID: ${building_ids.id}\n${flat_index === 0 ? "" : "Apartment ID: " + flats_on_current_floor[flat_index] + "\n"}`)
}

export {encodeWKT, interpolate, makeID, parseData, snap, setInfo, writeMsg}