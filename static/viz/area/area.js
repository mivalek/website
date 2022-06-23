
const urlParams = new URLSearchParams(window.location.search)
if (urlParams.get('cite') === 'true') {
  document.getElementById("cite").classList.add("show")
}

const data = [-4,-3.99,-3.98,-3.97,-3.96,-3.95,-3.94,-3.93,-3.92,-3.91,-3.9,-3.89,-3.88,-3.87,-3.86,-3.85,-3.84,-3.83,-3.82,-3.81,-3.8,-3.79,-3.78,-3.77,-3.76,-3.75,-3.74,-3.73,-3.72,-3.71,-3.7,-3.69,-3.68,-3.67,-3.66,-3.65,-3.64,-3.63,-3.62,-3.61,-3.6,-3.59,-3.58,-3.57,-3.56,-3.55,-3.54,-3.53,-3.52,-3.51,-3.5,-3.49,-3.48,-3.47,-3.46,-3.45,-3.44,-3.43,-3.42,-3.41,-3.4,-3.39,-3.38,-3.37,-3.36,-3.35,-3.34,-3.33,-3.32,-3.31,-3.3,-3.29,-3.28,-3.27,-3.26,-3.25,-3.24,-3.23,-3.22,-3.21,-3.2,-3.19,-3.18,-3.17,-3.16,-3.15,-3.14,-3.13,-3.12,-3.11,-3.1,-3.09,-3.08,-3.07,-3.06,-3.05,-3.04,-3.03,-3.02,-3.01,-3,-2.99,-2.98,-2.97,-2.96,-2.95,-2.94,-2.93,-2.92,-2.91,-2.9,-2.89,-2.88,-2.87,-2.86,-2.85,-2.84,-2.83,-2.82,-2.81,-2.8,-2.79,-2.78,-2.77,-2.76,-2.75,-2.74,-2.73,-2.72,-2.71,-2.7,-2.69,-2.68,-2.67,-2.66,-2.65,-2.64,-2.63,-2.62,-2.61,-2.6,-2.59,-2.58,-2.57,-2.56,-2.55,-2.54,-2.53,-2.52,-2.51,-2.5,-2.49,-2.48,-2.47,-2.46,-2.45,-2.44,-2.43,-2.42,-2.41,-2.4,-2.39,-2.38,-2.37,-2.36,-2.35,-2.34,-2.33,-2.32,-2.31,-2.3,-2.29,-2.28,-2.27,-2.26,-2.25,-2.24,-2.23,-2.22,-2.21,-2.2,-2.19,-2.18,-2.17,-2.16,-2.15,-2.14,-2.13,-2.12,-2.11,-2.1,-2.09,-2.08,-2.07,-2.06,-2.05,-2.04,-2.03,-2.02,-2.01,-2,-1.99,-1.98,-1.97,-1.96,-1.95,-1.94,-1.93,-1.92,-1.91,-1.9,-1.89,-1.88,-1.87,-1.86,-1.85,-1.84,-1.83,-1.82,-1.81,-1.8,-1.79,-1.78,-1.77,-1.76,-1.75,-1.74,-1.73,-1.72,-1.71,-1.7,-1.69,-1.68,-1.67,-1.66,-1.65,-1.64,-1.63,-1.62,-1.61,-1.6,-1.59,-1.58,-1.57,-1.56,-1.55,-1.54,-1.53,-1.52,-1.51,-1.5,-1.49,-1.48,-1.47,-1.46,-1.45,-1.44,-1.43,-1.42,-1.41,-1.4,-1.39,-1.38,-1.37,-1.36,-1.35,-1.34,-1.33,-1.32,-1.31,-1.3,-1.29,-1.28,-1.27,-1.26,-1.25,-1.24,-1.23,-1.22,-1.21,-1.2,-1.19,-1.18,-1.17,-1.16,-1.15,-1.14,-1.13,-1.12,-1.11,-1.1,-1.09,-1.08,-1.07,-1.06,-1.05,-1.04,-1.03,-1.02,-1.01,-1,-0.99,-0.98,-0.97,-0.96,-0.95,-0.94,-0.93,-0.92,-0.91,-0.9,-0.89,-0.88,-0.87,-0.86,-0.85,-0.84,-0.83,-0.82,-0.81,-0.8,-0.79,-0.78,-0.77,-0.76,-0.75,-0.74,-0.73,-0.72,-0.71,-0.7,-0.69,-0.68,-0.67,-0.66,-0.65,-0.64,-0.63,-0.62,-0.61,-0.6,-0.59,-0.58,-0.57,-0.56,-0.55,-0.54,-0.53,-0.52,-0.51,-0.5,-0.49,-0.48,-0.47,-0.46,-0.45,-0.44,-0.43,-0.42,-0.41,-0.4,-0.39,-0.38,-0.37,-0.36,-0.35,-0.34,-0.33,-0.32,-0.31,-0.3,-0.29,-0.28,-0.27,-0.26,-0.25,-0.24,-0.23,-0.22,-0.21,-0.2,-0.19,-0.18,-0.17,-0.16,-0.15,-0.14,-0.13,-0.12,-0.11,-0.1,-0.09,-0.08,-0.07,-0.06,-0.05,-0.04,-0.03,-0.02,-0.01,0,0.01,0.02,0.03,0.04,0.05,0.06,0.07,0.08,0.09,0.1,0.11,0.12,0.13,0.14,0.15,0.16,0.17,0.18,0.19,0.2,0.21,0.22,0.23,0.24,0.25,0.26,0.27,0.28,0.29,0.3,0.31,0.32,0.33,0.34,0.35,0.36,0.37,0.38,0.39,0.4,0.41,0.42,0.43,0.44,0.45,0.46,0.47,0.48,0.49,0.5,0.51,0.52,0.53,0.54,0.55,0.56,0.57,0.58,0.59,0.6,0.61,0.62,0.63,0.64,0.65,0.66,0.67,0.68,0.69,0.7,0.71,0.72,0.73,0.74,0.75,0.76,0.77,0.78,0.79,0.8,0.81,0.82,0.83,0.84,0.85,0.86,0.87,0.88,0.89,0.9,0.91,0.92,0.93,0.94,0.95,0.96,0.97,0.98,0.99,1,1.01,1.02,1.03,1.04,1.05,1.06,1.07,1.08,1.09,1.1,1.11,1.12,1.13,1.14,1.15,1.16,1.17,1.18,1.19,1.2,1.21,1.22,1.23,1.24,1.25,1.26,1.27,1.28,1.29,1.3,1.31,1.32,1.33,1.34,1.35,1.36,1.37,1.38,1.39,1.4,1.41,1.42,1.43,1.44,1.45,1.46,1.47,1.48,1.49,1.5,1.51,1.52,1.53,1.54,1.55,1.56,1.57,1.58,1.59,1.6,1.61,1.62,1.63,1.64,1.65,1.66,1.67,1.68,1.69,1.7,1.71,1.72,1.73,1.74,1.75,1.76,1.77,1.78,1.79,1.8,1.81,1.82,1.83,1.84,1.85,1.86,1.87,1.88,1.89,1.9,1.91,1.92,1.93,1.94,1.95,1.96,1.97,1.98,1.99,2,2.01,2.02,2.03,2.04,2.05,2.06,2.07,2.08,2.09,2.1,2.11,2.12,2.13,2.14,2.15,2.16,2.17,2.18,2.19,2.2,2.21,2.22,2.23,2.24,2.25,2.26,2.27,2.28,2.29,2.3,2.31,2.32,2.33,2.34,2.35,2.36,2.37,2.38,2.39,2.4,2.41,2.42,2.43,2.44,2.45,2.46,2.47,2.48,2.49,2.5,2.51,2.52,2.53,2.54,2.55,2.56,2.57,2.58,2.59,2.6,2.61,2.62,2.63,2.64,2.65,2.66,2.67,2.68,2.69,2.7,2.71,2.72,2.73,2.74,2.75,2.76,2.77,2.78,2.79,2.8,2.81,2.82,2.83,2.84,2.85,2.86,2.87,2.88,2.89,2.9,2.91,2.92,2.93,2.94,2.95,2.96,2.97,2.98,2.99,3,3.01,3.02,3.03,3.04,3.05,3.06,3.07,3.08,3.09,3.1,3.11,3.12,3.13,3.14,3.15,3.16,3.17,3.18,3.19,3.2,3.21,3.22,3.23,3.24,3.25,3.26,3.27,3.28,3.29,3.3,3.31,3.32,3.33,3.34,3.35,3.36,3.37,3.38,3.39,3.4,3.41,3.42,3.43,3.44,3.45,3.46,3.47,3.48,3.49,3.5,3.51,3.52,3.53,3.54,3.55,3.56,3.57,3.58,3.59,3.6,3.61,3.62,3.63,3.64,3.65,3.66,3.67,3.68,3.69,3.7,3.71,3.72,3.73,3.74,3.75,3.76,3.77,3.78,3.79,3.8,3.81,3.82,3.83,3.84,3.85,3.86,3.87,3.88,3.89,3.9,3.91,3.92,3.93,3.94,3.95,3.96,3.97,3.98,3.99,4],
    outerPerc = [1,0.992,0.984,0.9761,0.9681,0.9601,0.9522,0.9442,0.9362,0.9283,0.9203,0.9124,0.9045,0.8966,0.8887,0.8808,0.8729,0.865,0.8572,0.8493,0.8415,0.8337,0.8259,0.8181,0.8103,0.8026,0.7949,0.7872,0.7795,0.7718,0.7642,0.7566,0.749,0.7414,0.7339,0.7263,0.7188,0.7114,0.7039,0.6965,0.6892,0.6818,0.6745,0.6672,0.6599,0.6527,0.6455,0.6384,0.6312,0.6241,0.6171,0.6101,0.6031,0.5961,0.5892,0.5823,0.5755,0.5687,0.5619,0.5552,0.5485,0.5419,0.5353,0.5287,0.5222,0.5157,0.5093,0.5029,0.4965,0.4902,0.4839,0.4777,0.4715,0.4654,0.4593,0.4533,0.4473,0.4413,0.4354,0.4295,0.4237,0.4179,0.4122,0.4065,0.4009,0.3953,0.3898,0.3843,0.3789,0.3735,0.3681,0.3628,0.3576,0.3524,0.3472,0.3421,0.3371,0.332,0.3271,0.3222,0.3173,0.3125,0.3077,0.303,0.2983,0.2937,0.2891,0.2846,0.2801,0.2757,0.2713,0.267,0.2627,0.2585,0.2543,0.2501,0.246,0.242,0.238,0.234,0.2301,0.2263,0.2225,0.2187,0.215,0.2113,0.2077,0.2041,0.2005,0.1971,0.1936,0.1902,0.1868,0.1835,0.1802,0.177,0.1738,0.1707,0.1676,0.1645,0.1615,0.1585,0.1556,0.1527,0.1499,0.1471,0.1443,0.1416,0.1389,0.1362,0.1336,0.131,0.1285,0.126,0.1236,0.1211,0.1188,0.1164,0.1141,0.1118,0.1096,0.1074,0.1052,0.1031,0.101,0.0989,0.0969,0.0949,0.093,0.091,0.0891,0.0873,0.0854,0.0836,0.0819,0.0801,0.0784,0.0767,0.0751,0.0735,0.0719,0.0703,0.0688,0.0672,0.0658,0.0643,0.0629,0.0615,0.0601,0.0588,0.0574,0.0561,0.0549,0.0536,0.0524,0.0512,0.05,0.0488,0.0477,0.0466,0.0455,0.0444,0.0434,0.0424,0.0414,0.0404,0.0394,0.0385,0.0375,0.0366,0.0357,0.0349,0.034,0.0332,0.0324,0.0316,0.0308,0.03,0.0293,0.0285,0.0278,0.0271,0.0264,0.0257,0.0251,0.0244,0.0238,0.0232,0.0226,0.022,0.0214,0.0209,0.0203,0.0198,0.0193,0.0188,0.0183,0.0178,0.0173,0.0168,0.0164,0.016,0.0155,0.0151,0.0147,0.0143,0.0139,0.0135,0.0131,0.0128,0.0124,0.0121,0.0117,0.0114,0.0111,0.0108,0.0105,0.0102,0.0099,0.0096,0.0093,0.0091,0.0088,0.0085,0.0083,0.008,0.0078,0.0076,0.0074,0.0071,0.0069,0.0067,0.0065,0.0063,0.0061,0.006,0.0058,0.0056,0.0054,0.0053,0.0051,0.005,0.0048,0.0047,0.0045,0.0044,0.0042,0.0041,0.004,0.0039,0.0037,0.0036,0.0035,0.0034,0.0033,0.0032,0.0031,0.003,0.0029,0.0028,0.0027,0.0026,0.0025,0.0024,0.0024,0.0023,0.0022,0.0021,0.0021,0.002,0.0019,0.0019,0.0018,0.0017,0.0017,0.0016,0.0016,0.0015,0.0015,0.0014,0.0014,0.0013,0.0013,0.0012,0.0012,0.0012,0.0011,0.0011,0.001,0.001,0.001,0.0009,0.0009,0.0009,0.0008,0.0008,0.0008,0.0008,0.0007,0.0007,0.0007,0.0006,0.0006,0.0006,0.0006,0.0006,0.0005,0.0005,0.0005,0.0005,0.0005,0.0004,0.0004,0.0004,0.0004,0.0004,0.0004,0.0004,0.0003,0.0003,0.0003,0.0003,0.0003,0.0003,0.0003,0.0003,0.0003,0.0002,0.0002,0.0002,0.0002,0.0002,0.0002,0.0002,0.0002,0.0002,0.0002,0.0002,0.0002,0.0002,0.0001,0.0001,0.0001,0.0001,0.0001,0.0001,0.0001,0.0001,0.0001,0.0001,0.0001,0.00001,0.00001,0.00001,0.00001,0.00001,0.00001,0.00001,0.00001,0.00001,0.00001],
    margin = {top: 20, right: 10, bottom: 50, left: 70},
    w = 500,
    h = 250,
    width = w - margin.left - margin.right,
    height = h - margin.top - margin.bottom,
    x = d3.scaleLinear()
    .domain([-4, 4])
    .range([margin.left, width + margin.left]),
    // Y axis: scale and draw:
    y = d3.scaleLinear()
      .domain([0, 0.4])  // d3.hist has to be called before the Y axis obviously
      .range([h - margin.bottom, margin.top])

function dnorm(x, mu, sigma) {
  return Math.exp(-1/2 * (((x - mu) / sigma) ** 2))/(sigma * Math.sqrt(2 * Math.PI))
}

let svg, g, graphLayer

let crit = 0
$( function() {
  $( "#slider-range" ).slider({
    range: true,
    min: -4.32,
    max: 4.32,
    step: 0.01,
    values: [-0.32, 0.32],
    slide: function( event, ui ) {
      if ( ( ui.values[ 0 ] + 0.64 ) >= ui.values[ 1 ] ) {
            $("#slider-range").slider('values', 0, -0.32)
            $("#slider-range").slider('values', 1, 0.32)
            crit = 0
            $("#range").html(0)
            return false
          } else {
      const ind = +ui.handleIndex
      $("#slider-range").slider('values', 1 - ind, +ui.values[ind] * -1)
      let outValue = +ui.values[ 1] - .32
      outValue = Math.max(0, Math.round(outValue * 100) / 100)
      $("#range").html(outValue)
      crit = outValue
    }
      draw()
    }
  });
} );


const init = () => {
  ind = 0

 svg = d3.select("#plot").append("svg")
   .attr("preserveAspectRatio", "xMinYMin meet")
   .attr("viewBox", "0 0 " + w + " " + h)
   .classed("svg-content", true)
   // .attr("width", w)
   // .attr("height", h)


  g = svg.append("g")

  svg.append("g")
    .attr("transform", `translate(0, ${h-margin.bottom})`)
    .attr("class", "axis")
    .call(d3.axisBottom(x)
    .ticks(20))

  svg.append("g")
     .attr("id", "y-axis")
     .attr("class", "axis")
     .attr("transform", `translate(${margin.left-5}, 0)`)
     .call(d3.axisLeft(y));

     // text label for the x axis
     svg.append("text")
        .attr("class", "axis lab")
        .attr("x", x(0))
        .attr("y", y(-0.1))
        // .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("z-score");

  // text label for the y axis
  svg.append("text")
     .attr("class", "axis lab")
     .attr("transform", "rotate(-90)")
     .attr("y", 0)
     .attr("x", 0 - ((h - margin.bottom + 10) / 2))
     .attr("dy", "1em")
     .style("text-anchor", "middle")
     .text("Probability density");
}

const draw = () => {
  const mu = 0,
        sigma = 1,
        upperIndex = data.indexOf(crit) + 1,
        lowerIndex = data.indexOf(-crit) + 1

  svg.select(".graph").remove()

  graphLayer = svg.append("g")
     .attr("class", "graph")

 // graphLayer



 graphLayer.append("path")
       .datum(data)
       .attr("class", "outer")
       .attr("d", d3.area()
         .x(function(d) {return x(d + mu)})
         .y0(y(0))
         .y1(function(d) { return y(dnorm(d, 0, 1))})
         )
   graphLayer.append("path")
         .datum(data.slice(0,upperIndex))
         .attr("class", "inner")
         .attr("d", d3.area()
           .x(function(d) {return x(d + mu)})
           .y0(y(0))
           .y1(function(d) { return y(dnorm(d, 0, 1))})
           )
 graphLayer.append("path")
       .datum(data.slice(0,lowerIndex))
       .attr("class", "outer")
       .attr("d", d3.area()
         .x(function(d) {return x(d + mu)})
         .y0(y(0))
         .y1(function(d) { return y(dnorm(d, 0, 1))})
         )
  graphLayer.append("line")
      .attr("class", "mu")
      .attr("x1", x(mu))
      .attr("x2", x(mu))
      .attr("y1", y(0))
      .attr("y2", y(dnorm(0, 0, 1)))
  graphLayer.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", d3.line()
          .x(function(d) {return x(d + mu)})
          .y(function(d) { return y(dnorm(d + mu, mu, 1))})
          )

  const outerValue = outerPerc[upperIndex - 401]
        innerValue = Math.round((1 - outerValue) * 10000) / 10000
  insertValue(outerValue, "outerPerc")
  insertValue(innerValue, "innerPerc")
  $("#lowerQuantIn").html(-1 * crit)
  $("#lowerQuantOut").html(-1 * crit)
  $("#upperQuantIn").html(crit)
  $("#upperQuantOut").html(crit)
  $("#innerOut").html(Math.min(innerValue, 0.99999))
  $("#outerOut").html(outerValue)
}

const reset = () => {
  d3.selectAll("#plot > svg").remove()
  init()
  draw()
}

const insertValue = (value, id) => {
  if (value > .9999 && value < 1) {
     value = "> 0.9999"
   } else if (value < .0001 && value > 0) {
     value = "< 0.0001"
   } else if (id == "innerPerc" && value == 1) {
     value = "> 0.9999"
   }
  document.getElementById(id).innerHTML = value;
}

init()
draw()
