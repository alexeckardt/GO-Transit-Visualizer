import { cam, goalCamW, goalCamH } from "../Components/Camera.js";
import { real_coords_to_world_position, gui_coords_to_world_coords, originX, originY } from "../Components/Coordinates.js";
import { toVector2, Vector2 } from "../Components/helper.js";
import { gridLineCol, lakeCol } from "../Components/Colors.js";

let obj;
let loadedLakes = false;
async function load_lakes() {
    const res = await fetch('./Visual/Source/lakes.json')
    obj = await res.json();
    loadedLakes = true;
}
load_lakes();

const shouldDrawLakes = true;

//Canvas
export function drawLakes(ctx) {

    if (shouldDrawLakes) {

        if (!loadedLakes) {
            return;
        }
        let i = 0;
        while (i < obj.length) {

            let lakeobj = obj[i]['coords']

            //Draw
            let j = 1;
            ctx.beginPath();
            ctx.fillStyle = lakeCol;

            //Plot First Point
            let point = real_coords_to_world_position(toVector2(lakeobj[0]))
            //console.log(point)
            ctx.moveTo(point.x, point.y);
            //console.log(point)

            //PLot Other Points
            while (j < lakeobj.length) {

                let newpoint = real_coords_to_world_position(toVector2(lakeobj[j]))
                ctx.lineTo(newpoint.x, newpoint.y);
                j++;
            }

            //Finish
            ctx.closePath();
            ctx.fill();

            //Continue
            i++;
        }
    }
    
    drawGrid(ctx);
}

function drawGrid(ctx) {
    //Draw Grid
    let c = new Vector2(15, 10);
    let skip = 100;
    let radius = 10;

    let offX = Math.floor(cam.position.x / skip);
    let offY = Math.floor(cam.position.y / skip);

    let xPos = offX*skip;
    while (xPos < cam.position.x + goalCamW) {

        let yPos = offY*skip;
        while (yPos < cam.position.y + goalCamH) {

            let position = new Vector2(xPos, yPos);
            let pos = gui_coords_to_world_coords(position);
            let posR = gui_coords_to_world_coords(position.add(new Vector2(skip, 0)));
            let posD = gui_coords_to_world_coords(position.add(new Vector2(0, skip)));

            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
            ctx.lineTo(posR.x, posR.y);
            ctx.strokeStyle = gridLineCol;
            ctx.stroke();
            ctx.closePath();

            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
            ctx.lineTo(posD.x, posD.y);
            ctx.strokeStyle = gridLineCol;
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.closePath();

            yPos += skip
        }

        xPos += skip
    }

    ctx.beginPath();
    let orgPos = real_coords_to_world_position([originX, originY]);
    ctx.arc(orgPos.x, orgPos.y, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = gridLineCol;
    ctx.fill();
    ctx.closePath();
    
}