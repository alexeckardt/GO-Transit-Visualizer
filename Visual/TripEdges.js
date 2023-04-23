import { cam } from "../Components/Camera.js";
import { edgeColour, busStopCol } from "../Components/Style.js";
import { Vector2 } from "../Components/helper.js";
import { real_coords_to_world_position } from "../Components/Coordinates.js";
import { mouse } from "../Components/Mouse.js";

export function TripEdge(fromStop, toStop) {
    this.from = fromStop
    this.to = toStop;
    this.draw_straight_line = true;
    this.edge_shape = [];

    this.routes_on_me = []
    this.edge_colors = {}

    this.add_edge_shape_point = function(lat, lon) {
        this.edge_shape.push(new Vector2(lat, lon))
        this.draw_straight_line = false;
    }

    this.plot = function(ctx) {
        var pFrom = this.from.draw_position();
        var fFrom = this.to.draw_position();

        ctx.moveTo(pFrom.x, pFrom.y);
        ctx.lineTo(fFrom.x, fFrom.y);
    }

    this.draw = function(ctx) {
        
        ctx.beginPath();
        this.plot(ctx);
            ctx.strokeStyle = edgeColour;
            ctx.lineWidth = 3*cam.get_feature_scale();
            ctx.stroke();
            ctx.closePath();
    }

    this.draw_selected = function(ctx) {

        ctx.beginPath();

        //Find Which Edges are highlighted
        let selectedRoutesOfMine = []
        for (var i = 0; i < this.routes_on_me.length; i++) {
            if (mouse.is_route_selected(this.routes_on_me[i])) {
                selectedRoutesOfMine.push(this.routes_on_me[i]);
            }
        }

        //
        //
        //

        var pFrom = this.from.draw_position();
        var fFrom = this.to.draw_position();

        let diff = fFrom.subtract(pFrom);
        diff.normalize();
        let realDiff = new Vector2(-diff.y, diff.x);

        //
        //
        //
        let s = selectedRoutesOfMine.length;
        let lW = 3*cam.get_feature_scale();;
        ctx.lineWidth = lW;

        for (var i = 0; i < s; i++) {
            var ii = i - (s-1)/2;
            var route = selectedRoutesOfMine[i];
            var offset = realDiff.scale(ii*(lW));
            let col = this.edge_colors[route];;

            ctx.strokeStyle = '#' + col;

            ctx.beginPath();
            ctx.moveTo(pFrom.x + offset.x, pFrom.y + offset.y);
            ctx.lineTo(fFrom.x + offset.x, fFrom.y + offset.y);
            ctx.closePath();
            ctx.stroke();
        }
        
    }

    this.add_route_that_travels_me = function(routeId, colourToDrawWhenHighlighted) {
        this.edge_colors[routeId] = colourToDrawWhenHighlighted;
        this.routes_on_me.push(routeId);
        console.log(colourToDrawWhenHighlighted);
    }
}