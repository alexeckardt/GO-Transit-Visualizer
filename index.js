//Comment
import { setupMouse } from "./Components/Mouse.js";
import { goalCamW, goalCamH } from "./Components/Camera.js";
import { backgroundCol } from "./Components/Colors.js";
import { generateGraph, drawGraph } from "./Visual/Graph.js";
import { drawLakes } from "./Visual/Background.js";
//Canvas
const canvas = document.getElementById('myCanvas');
let ctx = canvas.getContext('2d');

canvas.setAttribute('width', goalCamW);
canvas.setAttribute('height', goalCamH);

setupMouse();

generateGraph();

function draw(){
    window.requestAnimationFrame(draw);

    //Clear
    ctx.fillStyle = backgroundCol;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawLakes(ctx, canvas.width / 2, canvas.height / 2);
    drawGraph(ctx);
}
draw()