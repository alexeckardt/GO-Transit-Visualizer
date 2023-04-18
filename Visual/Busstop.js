import { cam } from "../Components/Camera.js";
import { backgroundCol, busStopCol } from "../Components/Colors.js";
import { real_coords_to_world_position } from "../Components/Coordinates.js";

const baseBusStopWidth = 8;

export function BusStopNode(pos) {

    this.coord = pos;

    this.draw = function(ctx) {

        //var s = cam.get_feature_scale();
        var w = baseBusStopWidth;

        var pos = real_coords_to_world_position(this.coord);

        //Occlude
        ctx.arc(pos.x, pos.y, w, 0, 2 * Math.PI, false);
        ctx.fillStyle = backgroundCol;
        ctx.fill();

        ctx.arc(pos.x, pos.y, w, 0, 2 * Math.PI, false);
        ctx.strokeStyle = busStopCol;
        ctx.lineWidth = 3;
        ctx.stroke();
    }
}