import { Vector2 } from "./helper.js";

function Camera(position, scale) {
    this.position = position;
    this.scale = scale;
}

export let cam = new Camera(new Vector2(0, 0));
export const goalCamW = 1920;
export const goalCamH = 1080;