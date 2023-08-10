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
