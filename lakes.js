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
const shouldDrawLakes = false;

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

    //Draw Grid
    let c = 10;
    let skip = 100;
    let radius = 10;

    for (var ii = 0; ii < c; ii++) {
        ctx.beginPath();
        for (var jj = 0; jj < c; jj++) {

            let position = new Vector2(-c*skip/2 + ii*skip, -c*skip/2 + jj*skip);
            let pos = gui_coords_to_world_coords(position);

            ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI, false);
            ctx.fillStyle = "red";
            ctx.fill();
        }
        ctx.closePath();
    }

    ctx.beginPath();
    let orgPos = real_coords_to_world_position([originX, originY]);
    ctx.arc(orgPos.x, orgPos.y, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.closePath();
    
    
}
