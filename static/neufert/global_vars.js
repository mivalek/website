
const url = new URL(window.location.href); 
const isTest = url.searchParams.has("test");
const id_url = "https://script.google.com/macros/s/AKfycbxLQkFSpDHlHAgvgKa77RVLVBEpBAI_LuL0mEiiQkCrghQyfqtwObrpSdwg0tIgXWT7/exec" + (isTest ? "?test=true" : "")
const data_url = "https://script.google.com/macros/s/AKfycbzBuiLlWyLTK5nKNi24955VwiMB2FLpAE8jflYG9i4tuQBguTgI9Gm3ctw7wbTRlOn4tg/exec" + (isTest ? "?test=true" : "")
const screenWidth = Math.min(1920, window.innerWidth - 20)
const screenHeight = Math.min(Math.max(768, window.innerHeight * .8), window.innerHeight - 20)
let point_radius = 6
let point_stroke = 5
let light_line = 1
let med_line = 7
let thick_line = 10
let scale = 1
let translate = {x: 0, y: 0}
let projection

let building_ids
let current_data = []
let current_floor = []
let current_flat = 1
let flats_on_current_floor = []  

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

let layout
let line_group
let point_group
let svg
let drag
let zoom

const tooltip = document.getElementById("tooltip")