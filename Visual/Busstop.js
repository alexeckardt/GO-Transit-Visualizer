import { cam } from "../Components/Camera.js";
import { backgroundCol, busStopCol } from "../Components/Colors.js";
import { real_coords_to_world_position } from "../Components/Coordinates.js";

const baseBusStopWidth = 8;

export function BusStopNode(stop_id, pos) {

    this.stop_id = stop_id;
    this.coord = pos;

    this.draw = function(ctx) {

        var s = cam.get_feature_scale();
        var w = baseBusStopWidth*s;

        var pos = real_coords_to_world_position(this.coord);

        ctx.beginPath();
            ctx.arc(pos.x, pos.y, w, 0, 2 * Math.PI, false);
                ctx.fillStyle = backgroundCol;
                ctx.strokeStyle = busStopCol;
                ctx.lineWidth = 3*s;
                ctx.fill();
                ctx.stroke();
        ctx.closePath();
    }
}