//Comment
import { cam } from "./Components/Camera.js";
import { Vector2, clamp } from "./Components/helper.js";
import { backgroundCol, defFont, descFont } from "./Components/Style.js";
import { drawGraph } from "./Visual/Graph.js";
import { generateGraph } from "./Visual/GenerateGraph.js";
import { drawLakes } from "./Visual/Background.js";
import { InfoBox } from "./Components/InfoBox.js";
import { min } from './Components/helper.js';

//Canvas
const canvas = document.getElementById('myCanvas');
const infoCanvas = document.getElementById('infoCanvas');
const constCanvas = document.getElementById('constantCanvas');
let ctx = canvas.getContext('2d');
export const infoBox = new InfoBox(infoCanvas);

var _width = 0;
var _height = 0;

//
// Initialize
//
window.addEventListener('load', init, false);
function init() {
    
    infoBox.set_dimentions(500, 200, 60, 15);
    infoBox.update();

    // setupMouse();
    generateGraph();

    updateConstantCanvas();

    onWindowResize();

    // Resize
    cam.position = new Vector2(-_width / 1.7, -_height / 2);
    cam.scaleInd = 2;
    cam.reflect_scale();

    console.log(cam.position);
    
    //Start
    draw();
}

//
// Draw
//
function draw(){
    //Clear
    ctx.fillStyle = backgroundCol;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    //Draw Background
    drawLakes(ctx, canvas.width / 2, canvas.height / 2);

    //Draw Graph
    drawGraph(ctx);

    //Redo
    window.requestAnimationFrame(draw);
}

//
// Update Bottom Left Canvas
//
function updateConstantCanvas() {

    let ctxh = constCanvas.getContext('2d');

    let w = 400;
    let h = 100;
    let p = 5;

    constCanvas.setAttribute('width', w);
    constCanvas.setAttribute('height', h);

    constCanvas.style.position = 'absolute';
    constCanvas.style.left = canvas.width - w - p + 'px'; 
    constCanvas.style.top = canvas.height - h - 100 - p + 'px';

    ctxh.clearRect(0, 0, constCanvas.width, constCanvas.height);
    //ctxh.fillRect(0, 0, constCanvas.width, constCanvas.height);

    ctxh.fillStyle = 'black';
    ctxh.textAlign = 'right';
    ctxh.textBaseline = 'bottom';
    ctxh.font = defFont;
    ctxh.fillText("GTFS Data Provided by Metrolinks, Accessed April 2023", w, h);
    ctxh.fillText("No Touch-screen functionality.", w, h - 10);

    ctxh.font = descFont;
    ctxh.fillStyle = 'white';
    ctxh.fillText("Click on Stops to reveal routes.", w, h - 50);
    ctxh.fillText("Click on routes to see information.", w, h - 31);
}

//
//
//Add Resize Events
window.addEventListener('resize', onWindowResize, false);
window.addEventListener('orientationchange', onWindowResize, false);
function onWindowResize() {

    console.log('Window Resize');

    //Get Screen Dimensions
    // Mobile Divices use outerWidth
    _width = min(window.innerWidth, window.outerWidth);
    _height = min(window.innerHeight, window.outerHeight);
  
    //Update div
    canvas.style.width = _width;
    canvas.style.height = _height;
    canvas.setAttribute('width', _width);
    canvas.setAttribute('height', _height);
    
    updateConstantCanvas();

    //
    // Center Camera
}