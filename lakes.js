import { cam, goalCamW, goalCamH } from "./Camera.js";
import { real_coords_to_gui_position, originX, originY } from "./Coordinates.js";
import { Vector2 } from "./helper.js";

let obj;
let loadedLakes = false;
async function load_lakes() {
    const res = await fetch('./lakes.json')
    obj = await res.json();
    loadedLakes = true;
}
load_lakes();

const lakeCol = 'black';

//Canvas
export function drawLakes(ctx) {

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
        let point = real_coords_to_gui_position(lakeobj[0])
        ctx.moveTo(point.x, point.y);
        //console.log(point)

        //PLot Other Points
        while (j < lakeobj.length) {

            let newpoint = real_coords_to_gui_position(lakeobj[j])
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

    //Draw Grid
    let c = 10;
    let skip = 0.5;
    let radius = 10;

    for (var ii = 0; ii < c/skip; ii++) {
        ctx.beginPath();
        for (var jj = 0; jj < c/skip; jj++) {

            let position = new Vector2(-85 + ii*skip, 40 + jj*skip);
            let orgPos = real_coords_to_gui_position([position.x, position.y]);
            ctx.arc(orgPos.x, orgPos.y, radius, 0, 2 * Math.PI, false);
            ctx.fillStyle = "red";
            ctx.fill();
        }
        ctx.closePath();
    }

    ctx.beginPath();

    let position = new Vector2(-90 + ii, 40 + jj);
    let orgPos = real_coords_to_gui_position([originX, originY]);
    ctx.arc(orgPos.x, orgPos.y, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.closePath();
    
    
}
