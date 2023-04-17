import { cam, goalCamW, goalCamH } from "./Camera.js";
import { Vector2 } from "./helper.js";

export const globalScale = 200;
export const originX = -79.3;
export const originY = 43.7;
export const lakeXscale = 0.75;
export const lakeYscale = -1;

export function real_coords_to_gui_position(coords) {

    let realScale = globalScale*cam.scale;

    return new Vector2(
        (coords[0] - originX)*lakeXscale*realScale + goalCamW/2 + cam.position.x,
        (coords[1] - originY)*lakeYscale*realScale + goalCamH/2 + cam.position.y
    );
}

export function gui_coords_to_real_coords(guiPosition) {

    //console.log(guiPosition);
    let realScale = globalScale*cam.scale;

    let x = (guiPosition.x - goalCamW/2 - cam.position.x) / (realScale*lakeXscale) + originX;
    let y = (guiPosition.y - goalCamH/2 - cam.position.y) / (realScale*lakeYscale) + originY;
    let v = new Vector2(x, y);
    //console.log(v);

    return v;
}