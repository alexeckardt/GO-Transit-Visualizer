//Comment
import { setupMouse } from "./Mouse.js";
import { drawLakes } from "./lakes.js";
import { goalCamW, goalCamH } from "./Camera.js";
import { backgroundCol } from "./Colors.js";

//Canvas
const canvas = document.getElementById('myCanvas');
let ctx = canvas.getContext('2d');

canvas.setAttribute('width', goalCamW);
canvas.setAttribute('height', goalCamH);

setupMouse();

function draw(){
    window.requestAnimationFrame(draw);

    //Clear
    ctx.fillStyle = backgroundCol;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawLakes(ctx, canvas.width / 2, canvas.height / 2);
}
draw()