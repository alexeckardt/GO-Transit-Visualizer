import { Vector2 } from "./helper.js";
import { cam, goalCamW, goalCamH } from "./Camera.js";
import {gui_coords_to_real_coords } from "./Coordinates.js";

function Mouse() {
    this.gui_position = new Vector2(0, 0);
}

export let mouse = new Mouse();
let dragStartMousePos = new Vector2(0, 0);
let dragStartCamPos = new Vector2(0, 0);
let dragging = false;

export function setupMouse() {

    (function() {
        document.onmousemove = handleMouseMove;
        function handleMouseMove(event) {
            var eventDoc, doc, body;

            event = event || window.event; // IE-ism

            // If pageX/Y aren't available and clientX/Y are,
            // calculate pageX/Y - logic taken from jQuery.
            // (This is to support old IE)
            
            if (event.pageX == null && event.clientX != null) {
                eventDoc = (event.target && event.target.ownerDocument) || document;
                doc = eventDoc.documentElement;
                body = eventDoc.body;

                event.pageX = event.clientX +
                (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
                (doc && doc.clientLeft || body && body.clientLeft || 0);
                event.pageY = event.clientY +
                (doc && doc.scrollTop  || body && body.scrollTop  || 0) -
                (doc && doc.clientTop  || body && body.clientTop  || 0 );
            }

            //Set Position
            mouse.gui_position = new Vector2(event.pageX, event.pageY); 

            // Use event.pageX / event.pageY here
            if (dragging) {

                //Add to Difference
                let x = dragStartCamPos.x + (dragStartMousePos.x - mouse.gui_position.x);
                let y = dragStartCamPos.y + (dragStartMousePos.y - mouse.gui_position.y);

                //Update Position
                cam.position = new Vector2(x, y);
            }

            //Update
            mouse.latlon_position = new Vector2(0, 0);
        }
    })();

    //Mouse Events
    window.addEventListener('mousedown', (event) => {
        console.log("Mouse Down");
        dragging = true;
        dragStartMousePos = mouse.gui_position;
        dragStartCamPos = cam.position;
    });

    window.addEventListener('mouseup', (event) => {
        console.log("Mouse Up");
        dragging = false;
    });

    window.addEventListener('wheel', (event) => {
        
        //Get
        let deltaY = event.deltaY > 0

        //Scroll Up
        if (event.deltaY > 0) {

            cam.zoom_in();
            return;
            
        }
        
        //Scroll Down
        cam.zoom_out();
    });

}