import { Vector2 } from "./helper.js";
import { mouse } from "./Mouse.js";
import {gui_coords_to_real_coords } from "./Coordinates.js";

export const goalCamW = 1920;
export const goalCamH = 1080;
const busstopSelectableAtZoomIndex = 7;
const cameraScales = [1, 2, 3, 8, 10, 20, 40, 80, 200];
const scaleCount = cameraScales.length;

function Camera(position) {
    this.position = position;
    this.scaleInd = 1;
    this.scale = cameraScales[this.scaleInd];

    this.coord_position = function() {
        return gui_coords_to_real_coords(this.position);
    }

    this.get_world_position = function() {
        return this.position.scale(1/this.scale);
    }

    this.mouse_world_position = function() {
        let v = this.position.add(mouse.gui_position).scale(1/this.scale);
        return v;
    }

    this.selectable = function() {
        return this.scaleInd >= busstopSelectableAtZoomIndex;
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
        //let scrollFromCoords = this.mouse_world_position();

        let mousePos = this.mouse_world_position();

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
        var prevScale = this.scale 
        this.scale = cameraScales[this.scaleInd];
        var ratio = this.scale / prevScale;
        
        let newMousePos = this.mouse_world_position();
        
        //Get Update
        let postCoords = this.mouse_world_position();
        let coordDiff = new Vector2(newMousePos.x-mousePos.x, newMousePos.y-mousePos.y);

        var p = this.position;
        var adding = coordDiff.scale(this.scale);
        this.position = p.subtract(adding);
    }

    //Change
    this.get_feature_scale = function() {

        if (this.scale >= 40) {
            return 1;
        }

        if (this.scale >= 3) {
            return 0.5;
        }

        return 0.25;

    }
}
export let cam = new Camera(new Vector2(-goalCamW/2.4, -goalCamH/2.6), 1);
//export let cam = new Camera(new Vector2(0, 0), 1);