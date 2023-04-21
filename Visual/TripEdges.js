import { cam } from "../Components/Camera.js";
import { edgeColour } from "../Components/Colors.js";
import { Vector2 } from "../Components/helper.js";
import { real_coords_to_world_position } from "../Components/Coordinates.js";

export function TripEdge(fromStop, toStop) {
    this.from = fromStop
    this.to = toStop;
    this.draw_straight_line = true;
    this.edge_shape = [];

    this.add_edge_shape_point = function(lat, lon) {
        this.edge_shape.push(new Vector2(lat, lon))
        this.draw_straight_line = false;
    }

    this.draw = function(ctx) {

        var s = cam.get_feature_scale();

        var pFrom = this.from.draw_position();
        var fFrom = this.to.draw_position();

        ctx.beginPath();
        ctx.moveTo(pFrom.x, pFrom.y);
        ctx.lineTo(fFrom.x, fFrom.y);
        ctx.strokeStyle = edgeColour;
        ctx.lineWidth = 3*s;
        ctx.stroke();
        ctx.closePath();
    }
}