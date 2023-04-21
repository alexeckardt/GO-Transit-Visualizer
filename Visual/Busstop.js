import { cam } from "../Components/Camera.js";
import { backgroundCol, busStopCol, selectedBusStopCol, selectedAndHoveringBusStopCol, edgeColour } from "../Components/Colors.js";
import { real_coords_to_world_position } from "../Components/Coordinates.js";
import { mouse } from "../Components/Mouse.js";

const baseBusStopWidth = 6;

export function BusStopNode(stop_id, input_coordinate, name) {

    this.stop_id = stop_id;
    this.coord = input_coordinate;
    this.name = name;

    this.draw_position = function() {
        return real_coords_to_world_position(this.coord);
    }

    this.get_draw_col = function() {
        var c = (cam.selectable()) ? busStopCol : edgeColour;
        if (mouse.elementHovering == this || mouse.elementSelected == this) {
            c = selectedBusStopCol;

            if (mouse.elementHovering == this && mouse.elementSelected == this) {
                c = selectedAndHoveringBusStopCol;
            }
        }
        return c;
    }

    this.draw = function(ctx) {

        var c = this.get_draw_col();
        var s = cam.get_feature_scale();

        ctx.beginPath();
        this.plot_arc(ctx)
            ctx.fillStyle = backgroundCol;
            ctx.strokeStyle = c;
            ctx.lineWidth = 3*s;
            ctx.fill();
            ctx.stroke();
            ctx.closePath();
    }

    this.draw_with_text = function(ctx) {

        this.draw(ctx);

        var s = cam.get_feature_scale();
        var pos = this.draw_position();
        ctx.fillStyle = selectedBusStopCol;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';

        ctx.fillText(this.name, pos.x, pos.y - baseBusStopWidth*s*2);

    }

    this.plot_arc = function(ctx) {
        var s = cam.get_feature_scale();
        var w = baseBusStopWidth*s*1.5;
        var pos = this.draw_position();

        ctx.moveTo(pos.x + w, pos.y);
        ctx.arc(pos.x, pos.y, w, 0, 2 * Math.PI, false);
    }

    this.plot_rect = function(ctx) {
        var s = cam.get_feature_scale();
        var w = baseBusStopWidth*s*1.5;
        var pos = this.draw_position();
        ctx.fillRect(pos.x - w/2, pos.y - w/2, w, w);
    }
}