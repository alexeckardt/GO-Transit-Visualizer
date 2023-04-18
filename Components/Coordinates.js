import { cam, goalCamW, goalCamH } from "./Camera.js";
import { Vector2 } from "./helper.js";

export const coordinateScale = 200;
export const originX = -79.3;
export const originY = 43.7;
export const lakeScale = new Vector2(0.75, -1);

export function real_coords_to_gui_position(coords) {

    let realScale = coordinateScale*cam.scale;

    return new Vector2(
        (coords[0] - originX)*lakeXscale*realScale - cam.position.x,
        (coords[1] - originY)*lakeYscale*realScale - cam.position.y
    );
}

export function gui_coords_to_real_coords(guiPosition) {

    //console.log(guiPosition);
    let realScale = coordinateScale*cam.scale;

    let x = (guiPosition.x + cam.position.x) / (realScale*lakeXscale) + originX;
    let y = (guiPosition.y + cam.position.y) / (realScale*lakeYscale) + originY;
    let v = new Vector2(x, y);
    //console.log(v);

    return v;
}



export function gui_coords_to_world_coords(guiPosition) {
    return new Vector2(guiPosition.x*cam.scale - cam.position.x, guiPosition.y*cam.scale - cam.position.y);
}


//Correct
export function real_coords_to_world_position(coords) {
    var coordXOff = coords.x - originX;
    var coordYOff = coords.y - originY;

    return new Vector2(coordXOff, coordYOff).multiply(lakeScale).scale(coordinateScale*cam.scale).subtract(cam.position);
}