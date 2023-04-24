//Comment
import { setupMouse } from "./Components/Mouse.js";
import { goalCamW, goalCamH } from "./Components/Camera.js";
import { backgroundCol } from "./Components/Style.js";
import { drawGraph } from "./Visual/Graph.js";
import { generateGraph } from "./Visual/GenerateGraph.js";
import { drawLakes } from "./Visual/Background.js";
import { InfoBox } from "./Components/InfoBox.js";
//Canvas
const canvas = document.getElementById('myCanvas');
const infoCanvas = document.getElementById('infoCanvas');
let ctx = canvas.getContext('2d');

canvas.setAttribute('width', goalCamW);
canvas.setAttribute('height', goalCamH);

export const infoBox = new InfoBox(infoCanvas);
infoBox.set_dimentions(500, 200, 60, 15);
//infoBox.set_text("Test", "Liufehfiewufhewuifwbnfuiwehfewiuhfewuifhweifuhwiuefhweiufhwuiffuiehfewiufhewuifhewfuiwehfuiwehfwuiefhweiufhweuifhwuifhweiufhwefhweiufhweuifhweiufhewiufhne\nLine\nLine\nLine\nLine\nLine\nLine\nLine\n");
infoBox.update();


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