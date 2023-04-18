import { cam } from "../Components/Camera.js";
import { edgeColour } from "../Components/Colors.js";

export function TripEdge(fromStop, toStop) {
    this.from = fromStop
    this.to = toStop;

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