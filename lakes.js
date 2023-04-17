import { cam, goalCamW, goalCamH } from "./Camera.js";

const globalScale = 200;
const originX = -79.3;
const originY = 43.7;
const lakeXscale = 0.75;
const lakeYscale = -1;

let obj;
let loadedLakes = false;

const lakeCol = 'black';

async function load_lakes() {
    const res = await fetch('./lakes.json')
    obj = await res.json();
    loadedLakes = true;
}
load_lakes();

//Define Vector 2
function Vector2(x, y) {
    this.x = x;
    this.y = y;
}

export function real_coords_to_lake(coords) {
    return new Vector2(
        (coords[0] - originX)*lakeXscale*globalScale + goalCamW/2,
        (coords[1] - originY)*lakeYscale*globalScale + goalCamH/2
    );
}

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
        let point = real_coords_to_lake(lakeobj[0])
        ctx.moveTo(point.x + cam.position.x, point.y + cam.position.y);
        //console.log(point)

        //PLot Other Points
        while (j < lakeobj.length) {

            let newpoint = real_coords_to_lake(lakeobj[j])
            ctx.lineTo(newpoint.x + cam.position.x, newpoint.y + cam.position.y);
            //console.log(newpoint)

            j++;
        }

        //Finish
        ctx.closePath();
        ctx.fill();

        //Continue
        i++;
    }

    let radius = 10;
    let orgPos = real_coords_to_lake([originX, originY]);
    ctx.beginPath();
    ctx.arc(orgPos.x, orgPos.y, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = "red";
    ctx.fill();
}
