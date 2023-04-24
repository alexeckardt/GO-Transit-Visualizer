import { Vector2 } from "./helper.js";
import { cam } from "./Camera.js";
import { gui_coords_to_world_coords } from "./Coordinates.js";
import { G } from "../Visual/Graph.js";
import { infoBox } from "../index.js";
import { routeDescInfoBoxColour } from "./Style.js";

function Mouse() {
    this.gui_position = new Vector2(0, 0);
    this.world_position = new Vector2(0, 0);

    this.elementHovering = undefined;
    this.elementSelected = undefined;

    this.overInfoBox = false;

    this.selectedRoutes = [];

    this.deselect_element = function() {
        this.elementSelected = undefined;
        this.selectedRoutes = [];
    }

    //Busstop
    this.select_element = function(el) {
        this.elementSelected = el;

        infoBox.setBusstopScheme();
        el.selected_events();

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
            mouse.world_position = gui_coords_to_world_coords(mouse.gui_position);

            //Check if In GUI
            let inW = infoBox.width;
            let inH = infoBox.height;

            if (mouse.selectedRoutes.length > 0) {
                inH = infoBox.canvas.height;
            }
            mouse.overInfoBox = (mouse.gui_position.x < inW && mouse.gui_position.y < inH && infoBox.draw_box);
            

            // Use event.pageX / event.pageY here
            if (dragging) {

                //Add to Difference
                let x = dragStartCamPos.x + (dragStartMousePos.x - mouse.gui_position.x);
                let y = dragStartCamPos.y + (dragStartMousePos.y - mouse.gui_position.y);

                //Update Position
                cam.position = new Vector2(x, y);

            } else {

                let selectable = cam.selectable();
                let sc = cam.get_feature_scale();

                //Check Which Bus Stop Hovering Over
                for (const node of G.busstops) {
                    if (mouse.gui_position.distance(node.draw_position()) < 10*sc && (selectable || node.drewAsHighlighted)) {
                        mouse.elementHovering = node;
                        node.selected_events();
                    }
                }

                if (mouse.elementHovering != undefined) {
                    if (mouse.gui_position.distance(mouse.elementHovering.draw_position()) > 40) {
                        mouse.elementHovering = undefined;
                        if (mouse.elementSelected != undefined) {
                            mouse.elementSelected.selected_events();
                        }
                    }
                }

            }

            //Update
            mouse.latlon_position = new Vector2(0, 0);
        }
    })();

    //Mouse Events
    window.addEventListener('mousedown', (event) => {
        console.log("Mouse Down");

        if (!mouse.overInfoBox) {
            dragging = true;
            dragStartMousePos = mouse.gui_position;
            dragStartCamPos = cam.position;
            dragged = false;
        }
    });

    window.addEventListener('mouseup', (event) => {
        console.log("Mouse Up");
        dragging = false;

        console.log(cam.position);

        //Drag
        if (!mouse.overInfoBox) {
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
    });

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
}

function highlightRoute(route) {

    let routeInfo = G.route_data[route];
    console.log(routeInfo);

    //Set Scheme
    infoBox.setCustomScheme("#" + routeInfo['route_color'], routeDescInfoBoxColour);

    let title = routeInfo['route_short_name'] + ": " + routeInfo['route_long_name'];
    let desc = routeInfo['route_type'] == 2 ? "Train Route" : "Bus Route";
    desc += "\nStops at " + routeInfo['stops_at'].length + " stops"
    desc += "\nStops at " + routeInfo['stops_at'].length + " stops"

    infoBox.set_text(title, "", desc);
}