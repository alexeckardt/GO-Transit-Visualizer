//Comment
import { Vector2 } from "./helper.js";
import { drawLakes } from "./lakes.js";
import { cam, goalCamW, goalCamH } from "./Camera.js";

//Canvas
const canvas = document.getElementById('myCanvas');
let ctx = canvas.getContext('2d');

canvas.setAttribute('width', goalCamW);
canvas.setAttribute('height', goalCamH);

let mousePos = new Vector2(0, 0);
let dragStartMousePos = new Vector2(0, 0);
let dragStartCamPos = new Vector2(0, 0);
let dragging = false;

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

        mousePos = new Vector2(event.pageX, event.pageY); 

        // Use event.pageX / event.pageY here
        if (dragging) {
            cam.position = new Vector2(dragStartCamPos.x + mousePos.x - dragStartMousePos.x, dragStartCamPos.y + mousePos.y - dragStartMousePos.y);
            //console.log(cam)
        }
    }
})();

//Mouse Events
window.addEventListener('mousedown', (event) => {
    console.log("Mouse Down");
    dragging = true;
    dragStartMousePos = mousePos;
    dragStartCamPos = cam.position;
});

window.addEventListener('mouseup', (event) => {
    console.log("Mouse Up");
    dragging = false;
});

window.addEventListener('wheel', (event) => {
    let deltaY = event.deltaY;
    console.log(deltaY);
});

function draw(){
    window.requestAnimationFrame(draw);

    //Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawLakes(ctx, canvas.width / 2, canvas.height / 2);
    
}
draw()