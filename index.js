//Comment
import { setupMouse } from "./Components/Mouse.js";
import { goalCamW, goalCamH } from "./Components/Camera.js";
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

canvas.setAttribute('width', goalCamW);
canvas.setAttribute('height', goalCamH);

export const infoBox = new InfoBox(infoCanvas);
infoBox.set_dimentions(500, 200, 60, 15);

//infoBox.set_text("Test", "Liufehfiewufhewuifwbnfuiwehfewiuhfewuifhweifuhwiuefhweiufhwuiffuiehfewiufhewuifhewfuiwehfuiwehfwuiefhweiufhweuifhwuifhweiufhwefhweiufhweuifhweiufhewiufhne\nLine\nLine\nLine\nLine\nLine\nLine\nLine\n");
infoBox.update();

setupMouse();

generateGraph();

updateConstantCanvas();

function draw(){
    window.requestAnimationFrame(draw);

    canvas.setAttribute('width', window.innerWidth);
    canvas.setAttribute('height', window.innerHeight);

    //Clear
    ctx.fillStyle = backgroundCol;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawLakes(ctx, canvas.width / 2, canvas.height / 2);

    drawGraph(ctx);
}
draw()

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


function onWindowResize() {

    //Get Screen Dimensions
    // Mobile Divices use outerWidth
    var _width = min(window.innerWidth, window.outerWidth);
    var _height = min(window.innerHeight, window.outerHeight);
  
    //Update div
    constCanvas.style.width = _width;
    constCanvas.style.height = _height;
  
    updateConstantCanvas();

    //
    // Center Camera
    
}

//Add Resize Events
window.addEventListener('resize', onWindowResize, false);
window.addEventListener('orientationchange', onWindowResize, false);