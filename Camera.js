import { Vector2 } from "./helper.js";
import { mouse } from "./Mouse.js";
import {gui_coords_to_real_coords, gui_coords_to_world_coords } from "./Coordinates.js";

export const goalCamW = 1920;
export const goalCamH = 1080;
const cameraScales = [1, 1.5, 2, 3, 8, 10, 20];
const scaleCount = cameraScales.length;

function Camera(position) {
    this.position = position;
    this.scaleInd = 0;
    this.scale = cameraScales[this.scaleInd];

    this.coord_position = function() {
        return gui_coords_to_real_coords(this.position);
    }

    this.get_world_position = function() {
        return gui_coords_to_world_coords(this.position);;
    }

    this.mouse_world_position = function() {

        let camWorldPosition = this.get_world_position();
        console.log(camWorldPosition)
        //return gui_coords_to_world_coords(mouse.gui_position);
        let x = (mouse.gui_position.x*this.scale + this.position.x)/this.scale;
        let y = mouse.gui_position.y/this.scale + this.position.y;

        let v = new Vector2(x, y);
        return v;
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

        //let mousePos = this.mouse_world_position();

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
        
        //let newMousePos = this.mouse_world_position();
        //
        //Get Update
        //let postCoords = this.mouse_world_position();
        //let coordDiff = new Vector2(newMousePos.x-mousePos.x, newMousePos.y-mousePos.y);
        
        //console.log(coordDiff);

        var p = this.position;
        //var adding = coordDiff.scale(ratio);
        //this.position = p.subtract(adding);
    }
}
//export let cam = new Camera(new Vector2(-goalCamW/2, -goalCamH/2), 1);
export let cam = new Camera(new Vector2(0, 0), 1);
