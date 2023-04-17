import { Vector2 } from "./helper.js";

function Camera(position, scale) {
    this.position = position;
    this.scale = scale;

    this.zoom_in = function() {
        this.scale += 10;
    }

    this.zoom_out = function() {
        this.scale += 10;
    }
}

export let cam = new Camera(new Vector2(0, 0), 1);
export const goalCamW = 1920;
export const goalCamH = 1080;