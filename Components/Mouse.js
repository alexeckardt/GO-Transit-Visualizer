import { Vector2 } from "./helper.js";
import { cam } from "./Camera.js";
import { gui_coords_to_world_coords } from "./Coordinates.js";
import { G } from "../Visual/Graph.js";
import { infoBox } from "../index.js";
import { routeDescInfoBoxColour } from "./Style.js";

//
//
//

function Mouse() {
    this.gui_position = new Vector2(0, 0);
    this.world_position = new Vector2(0, 0);

    this.elementHovering = undefined;
    this.elementSelected = undefined;

    this.overInfoBox = false;

    this.selectedRoutes = [];
    this.displayingOneRoute = false;

    this.deselect_element = function() {
        this.elementSelected = undefined;
        this.selectedRoutes = [];
    }

    //Busstop
    this.select_element = function(el) {
        this.elementSelected = el;

        infoBox.setBusstopScheme();
        this.displayingOneRoute = false;

        el.selected_events();
        infoBox.routeBoxXOffset = 0; //reset

        //More!!
        this.selectedRoutes = G.get_all_routes_from_stop(el);
        infoBox.update();
    }

    this.is_route_selected = function(routeId) {
        for (var i = 0; i < this.selectedRoutes.length; i++) {
            if (routeId == this.selectedRoutes[i]) {
                return true;
            }
        }
        return false;
    }
}

export let mouse = new Mouse();
let dragStartMousePos = new Vector2(0, 0);
let dragStartCamPos = new Vector2(0, 0);
let dragging = false;
let dragged = false;
let initedDragPositions = true;

function mouse_hovering_select() {
    
    let selectable = cam.selectable();
    let sc = cam.get_feature_scale();

    //Reset
    mouse.elementHovering = undefined;

    //Check Which Bus Stop Hovering Over
    for (const node of G.busstops) {
        if (mouse.gui_position.distance(node.draw_position()) < 10*sc && (selectable || node.drewAsHighlighted)) {
            mouse.elementHovering = node;

            if (!mouse.displayingOneRoute) {
                node.selected_events();
            }
        }
    }

    if (mouse.elementHovering != undefined) {
        if (mouse.gui_position.distance(mouse.elementHovering.draw_position()) > 40) {
            mouse.elementHovering = undefined;
            if (mouse.elementSelected != undefined) {
                if (!mouse.displayingOneRoute) {
                    mouse.elementSelected.selected_events();
                }
            }
        }
    }

}

//
// Dragging
//
function whileDragging(event) {

    var eventDoc, doc, body, pageX, pageY, x, y;


    // If pageX/Y aren't available and clientX/Y are,
    // calculate pageX/Y - logic taken from jQuery.
    // (This is to support old IE)
    
    if (event instanceof MouseEvent) {

        //
        // Mouse
        //
        x = event.clientX;
        y = event.clientY;

    } else {
        
        //
        // Touch
        //
        var touch = event.touches[0]; // Assuming you're interested in the first touch point
        x = touch.clientX;
        y = touch.clientY;

    }

    //
    //
    //
    eventDoc = (event.target && event.target.ownerDocument) || document;
    doc = eventDoc.documentElement;
    body = eventDoc.body;

    /*
    pageX = x +
    (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
    (doc && doc.clientLeft || body && body.clientLeft || 0);

    pageY = y +
    (doc && doc.scrollTop  || body && body.scrollTop  || 0) -
    (doc && doc.clientTop  || body && body.clientTop  || 0 );
    */

    //Set Position
    mouse.gui_position = new Vector2(x, y); 
    mouse.world_position = gui_coords_to_world_coords(mouse.gui_position);

    //Check if In GUI
    let inW = infoBox.width;
    let inH = infoBox.height;

    if (mouse.selectedRoutes.length > 0) {
        inH = infoBox.canvas.height;
    }
    mouse.overInfoBox = (mouse.gui_position.x < inW && mouse.gui_position.y < inH && infoBox.draw_box);
    
    //
    // Start A Drag
    //
    if (!initedDragPositions) {
        dragging = true;
        dragStartMousePos = mouse.gui_position;
        dragStartCamPos = cam.position;
        dragged = false;
        initedDragPositions = true;
    }



    // Use event.pageX / event.pageY here
    if (dragging) {

        //Add to Difference
        let xx = dragStartCamPos.x + (dragStartMousePos.x - mouse.gui_position.x);
        let yy = dragStartCamPos.y + (dragStartMousePos.y - mouse.gui_position.y);

        //Update Position
        cam.position = new Vector2(xx, yy);

    } else {

        mouse_hovering_select();

    }

    //Update
    mouse.latlon_position = new Vector2(0, 0);
}


function startDrag(event) {

    console.log("Mouse Down");
    initedDragPositions = false;
}

function endDrag(event) {

    console.log("Mouse Up");
    dragging = false;
    initedDragPositions = true;

    console.log(cam, mouse, window);


    // Select / Deselect
    if (!mouse.overInfoBox) {

        //
        //
        //

        if (mouse.elementHovering == undefined) {
            if (dragStartCamPos.distance(cam.position) < 10) {
                mouse.deselect_element();
                infoBox.clear();
                infoBox.update();
            }
        } else {
            mouse.select_element(mouse.elementHovering);
        }
    } else {

        //Click GUI Events

        //Select a route
        if (mouse.gui_position.y > infoBox.height) {

            //Get box i would be in
            var xx = mouse.gui_position.x - infoBox.edgeBuffer;
            var BoxI = Math.floor((xx + infoBox.routeBoxXOffset) / (infoBox.routeBoxWidth + infoBox.routeBoxSep));

            if (BoxI >= 0 && BoxI < mouse.selectedRoutes.length) {
                //Update Routes
                let route = mouse.selectedRoutes[BoxI]
                mouse.selectedRoutes = [route];

                //
                highlightRoute(route);

                //
                infoBox.update();
            }
        }
    }
}

//
//
// Touch Events
//
//
var initialZoomAmount = 0;
var pinchStartDistance = 0;
var scalingFactor = 0.02;

var touchStartPos = {};

document.addEventListener('touchstart', function(event) {
    if (event.touches.length === 2) {
        // Calculate the initial distance between the two touch points
        var touch1 = event.touches[0];
        var touch2 = event.touches[1];
        pinchStartDistance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
        initialZoomAmount = cam.scaleInd;
    } 

    // One Finger, Do Movement Start
    touchStartPos = event.touches[0];
    startDrag(event);
});

document.addEventListener('touchmove', function(event) {

    console.log('dragging')

    // Pinching for Zooming
    if (event.touches.length === 2) {
        // Calculate the current distance between the two touch points
        var touch1 = event.touches[0];
        var touch2 = event.touches[1];
        var pinchCurrentDistance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
        
        // Calculate the change in distance and use it to determine the scroll change
        var pinchDelta = pinchCurrentDistance - pinchStartDistance;
        var scrollChange = pinchDelta * scalingFactor;
        
        // Apply the scroll change to the initial scroll position
        cam.zoom_delta(initialZoomAmount + scrollChange);
    }

    //
    //
    whileDragging(event);

});

document.addEventListener('touchend', function(event) {
    pinchStartDistance = 0;

    console.log('touch end');

    // Reposition
    var x = 0;
    var y = 0;

    var touch = touchStartPos; // Assuming you're interested in the first touch point
    console.log(touchStartPos);
    x = touch.clientX;
    y = touch.clientY;
    mouse.gui_position = new Vector2(x, y); 

    mouse_hovering_select();
    endDrag(event);
});

//
//
// 
window.addEventListener('mousedown', (event) => {
    startDrag(event);
});
window.addEventListener('mouseup', (event) => {
    endDrag(event);
});
window.addEventListener('mousemove', (event) => {
    whileDragging(event);
});

//
//
// Wheel Events
window.addEventListener('wheel', (event) => {
        
    let deltaY = event.deltaY > 0

    //Get
    if (!mouse.overInfoBox) {
        
        //Scroll Up
        if (event.deltaY > 0) {

            cam.zoom_in();
            dragStartMousePos = mouse.gui_position;
            dragStartCamPos = cam.position;
            return;
            
        }
        
        //Scroll Down
        cam.zoom_out();
        dragStartMousePos = mouse.gui_position;
        dragStartCamPos = cam.position;
    } else {
     
        if (mouse.gui_position.y > infoBox.height) {

            let yy = 1;
            if (event.deltaY > 0) {
                yy = -1;
            }

            let scrollSpeed = 30;
            let count = mouse.selectedRoutes.length;
            let secW = (infoBox.routeBoxWidth + infoBox.routeBoxSep);
            let maxBoxesOnScreen = (infoBox.width - infoBox.edgeBuffer*2) / secW;
            let maxXoffset = secW*Math.max(count-maxBoxesOnScreen, 0);

            //Change
            infoBox.routeBoxXOffset = Math.max(0, Math.min(infoBox.routeBoxXOffset + yy*scrollSpeed, maxXoffset))

            //Force Update
            infoBox.update();
        }

    }
});

function highlightRoute(route) {

    let routeInfo = G.route_data[route];

    //Set Scheme
    infoBox.setCustomScheme("#" + routeInfo['route_color'], routeDescInfoBoxColour);

    let title = routeInfo['route_short_name'] + ": " + routeInfo['route_long_name'];
    let desc = routeInfo['route_type'] == 2 ? "Type: Train Route" : "Type: Bus Route";
    desc += "\n" + routeInfo['subroute_count'] + " sub-routes"
    desc += "\nStops at " + routeInfo['stops_at'].length + " stops\n"
    desc += "\nCommon First Stop: " + G.get_stop_name(routeInfo['gen_first_stop']);
    desc += "\nCommon Last Stop: " + G.get_stop_name(routeInfo['gen_last_stop']);

    infoBox.set_text(title, "", desc);

    mouse.displayingOneRoute = true;
    infoBox.routeBoxXOffset = 0; //reset
}