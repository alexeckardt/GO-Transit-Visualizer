import { cam } from "../Components/Camera.js";
import { backgroundCol, busStopCol, selectedBusStopCol, selectedAndHoveringBusStopCol, edgeColour } from "../Components/Colors.js";
import { real_coords_to_world_position } from "../Components/Coordinates.js";
import { mouse } from "../Components/Mouse.js";

const baseBusStopWidth = 8;

export function BusStopNode(stop_id, input_coordinate) {

    this.stop_id = stop_id;
    this.coord = input_coordinate;

    this.draw_position = function() {
        return real_coords_to_world_position(this.coord);
    }

    this.draw = function(ctx) {

        var s = cam.get_feature_scale();

        var c = (cam.selectable()) ? busStopCol : edgeColour;
        if (mouse.elementHovering == this || mouse.elementSelected == this) {
            c = selectedBusStopCol;

            if (mouse.elementHovering == this && mouse.elementSelected == this) {
                c = selectedAndHoveringBusStopCol;
            }
        }

        ctx.beginPath();
        this.plot_arc(ctx)
            ctx.fillStyle = backgroundCol;
            ctx.strokeStyle = c;
            ctx.lineWidth = 3*s;
            ctx.fill();
            ctx.stroke();
            ctx.closePath();
    }

    this.plot_arc = function(ctx) {
        var s = cam.get_feature_scale();
        var w = baseBusStopWidth*s;
        var pos = this.draw_position();

        ctx.moveTo(pos.x + w, pos.y);
        ctx.arc(pos.x, pos.y, w, 0, 2 * Math.PI, false);
    }
}