//Comment
import { setupMouse } from "./Components/Mouse.js";
import { goalCamW, goalCamH } from "./Components/Camera.js";
import { backgroundCol } from "./Components/Style.js";
import { generateGraph, drawGraph } from "./Visual/Graph.js";
import { drawLakes } from "./Visual/Background.js";
import { InfoBox } from "./Components/InfoBox.js";
//Canvas
const canvas = document.getElementById('myCanvas');
const lakeCanvas = document.getElementById('lakes')
const infoCanvas = document.getElementById('infoCanvas');
let ctx = canvas.getContext('2d');
let bkgCtx = lakeCanvas.getContext('2d');

canvas.setAttribute('width', goalCamW);
canvas.setAttribute('height', goalCamH);
lakeCanvas.setAttribute('width', goalCamW);
lakeCanvas.setAttribute('height', goalCamH);

export const infoBox = new InfoBox(infoCanvas);
infoBox.set_dimentions(500, 200);
//infoBox.set_text("Test", "Liufehfiewufhewuifwbnfuiwehfewiuhfewuifhweifuhwiuefhweiufhwuiffuiehfewiufhewuifhewfuiwehfuiwehfwuiefhweiufhweuifhwuifhweiufhwefhweiufhweuifhweiufhewiufhne\nLine\nLine\nLine\nLine\nLine\nLine\nLine\n");
infoBox.update();


setupMouse();

generateGraph();

function draw(){
    window.requestAnimationFrame(draw);

    //Clear
    bkgCtx.fillStyle = backgroundCol;
    bkgCtx.fillRect(0, 0, canvas.width, canvas.height);
    drawLakes(bkgCtx, canvas.width / 2, canvas.height / 2);

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawGraph(ctx);
}
draw()