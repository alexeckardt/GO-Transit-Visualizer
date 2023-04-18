import { cam, goalCamW, goalCamH } from "./Camera.js";
import { real_coords_to_world_position, gui_coords_to_world_coords, originX, originY } from "./Coordinates.js";
import { toVector2, Vector2 } from "./helper.js";

let obj;
let loadedLakes = false;
async function load_lakes() {
    const res = await fetch('./lakes.json')
    obj = await res.json();
    loadedLakes = true;
}
load_lakes();

const lakeCol = 'black';
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
                //console.log(newpoint)

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

    for (var ii = 0; ii < c.x; ii++) {
        for (var jj = 0; jj < c.y; jj++) {

            let position = new Vector2(offX*skip + ii*skip, offY*skip + jj*skip);
            let pos = gui_coords_to_world_coords(position);
            let posR = gui_coords_to_world_coords(position.add(new Vector2(skip, 0)));
            let posD = gui_coords_to_world_coords(position.add(new Vector2(0, skip)));

            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
            ctx.lineTo(posR.x, posR.y);
            ctx.strokeStyle = "red";
            ctx.stroke();
            ctx.closePath();

            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
            ctx.lineTo(posD.x, posD.y);
            ctx.strokeStyle = "red";
            ctx.stroke();
            ctx.closePath();
        }
        
    }

    ctx.beginPath();
    let orgPos = real_coords_to_world_position([originX, originY]);
    ctx.arc(orgPos.x, orgPos.y, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.closePath();
    
}