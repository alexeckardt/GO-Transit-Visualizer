import { Vector2 } from "./helper.js";
import { mouse } from "./Mouse.js";
import {gui_coords_to_real_coords } from "./Coordinates.js";

export const goalCamW = 1920;
export const goalCamH = 1080;
const cameraScales = [1, 2, 3, 8, 10, 20];
const scaleCount = cameraScales.length;

function Camera(position) {
    this.position = position;
    this.scaleInd = 3;
    this.scale = cameraScales[this.scaleInd];

    this.coord_position = function() {
        return gui_coords_to_real_coords(this.position);
    }

    this.mouse_camera_position = function() {
        return new Vector2(this.position.x + mouse.gui_position.x, this.position.y + mouse.gui_position.y)
    }

    this.zoom_out = function() {
        this.update_scale(false)
    }

    this.zoom_in = function() {
        this.update_scale(true)
    }

    //
    //
    //
    this.update_scale = function(zoomIn) {

        //Get Position
        let scrollFromCoords = gui_coords_to_real_coords(this.mouse_camera_position());

        //Update Scale
        if (zoomIn) {
            if (this.scaleInd > 0) {
                --this.scaleInd;
            } else {
                return;
            }
        } else {
            if (this.scaleInd < scaleCount-1) {
                ++this.scaleInd;
            } else {
                return;
            }
        }

        //Update
        this.scale = cameraScales[this.scaleInd];

        //Get Update
        //let postCoords = gui_coords_to_real_coords(this.mouse_camera_position());
        //let diff = new Vector2(postCoords.x - scrollFromCoords.x, postCoords.y - scrollFromCoords.y);
        

        //this.position = new Vector2(this.position.x + diff.x*this.scale, this.position.y+diff.y*this.scale);
    }
}
export let cam = new Camera(new Vector2(0, 0), 1);
