import { cam } from "../Components/Camera.js";
import { backgroundCol, busStopCol, selectedBusStopCol, selectedAndHoveringBusStopCol, edgeColour, defFont } from "../Components/Style.js";
import { real_coords_to_world_position } from "../Components/Coordinates.js";
import { mouse } from "../Components/Mouse.js";
import { infoBox } from "../index.js";

const baseBusStopWidth = 6;

export function BusStopNode(stop_id, input_coordinate, name) {

    this.stop_id = stop_id;
    this.coord = input_coordinate;
    this.name = name;

    this.isHubOf = undefined;

    this.drewAsHighlighted = false;

    this.draw_position = function() {
        return real_coords_to_world_position(this.coord);
    }

    this.get_draw_col = function() {

        var c = (cam.selectable()) ? busStopCol : edgeColour;

        //Hide
        if (mouse.selectedRoutes.length != 0) {
            c = edgeColour;
        }

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
        ctx.fillStyle = backgroundCol;
        ctx.strokeStyle = c;
        ctx.lineWidth = 3*s;

        this.plot_arc(ctx)
            
            ctx.fill();
            ctx.stroke();
            ctx.closePath();

        this.drewAsHighlighted = false;
    }

    this.draw_selected = function(ctx, scale=1) {

        var s = cam.get_feature_scale()*scale;

        ctx.beginPath();
        ctx.fillStyle = backgroundCol;
        ctx.strokeStyle = selectedBusStopCol;
        ctx.lineWidth = 3*s;

        this.plot_arc(ctx, scale)
            
            ctx.fill();
            ctx.stroke();
            ctx.closePath();

        this.drewAsHighlighted = true;
    }


    this.draw_with_text = function(ctx) {

        this.draw(ctx);

        var s = cam.get_feature_scale();
        //Hubs Are Bigger
        if (this.isHubOf != undefined) {
            s *= 2;
        }

        var pos = this.draw_position();
        ctx.fillStyle = selectedBusStopCol;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.font = defFont;

        ctx.strokeStyle = backgroundCol;
        ctx.lineWidth = 2;

        ctx.strokeText(this.name, pos.x, pos.y - baseBusStopWidth*s*2);
        ctx.fillText(this.name, pos.x, pos.y - baseBusStopWidth*s*2);

        this.drewAsHighlighted = true;
    }

    this.plot_arc = function(ctx, scale=1) {
        var s = cam.get_feature_scale()*scale;
        var w = baseBusStopWidth*s*1.5;
        var pos = this.draw_position();

        //Hubs Are Bigger
        if (this.isHubOf != undefined) {
            w *= 2;
        }

        ctx.moveTo(pos.x + w, pos.y);
        ctx.arc(pos.x, pos.y, w, 0, 2 * Math.PI, false);
    }

    this.plot_rect = function(ctx) {
        var s = cam.get_feature_scale();
        var w = baseBusStopWidth*s*1.5;
        var pos = this.draw_position();
        ctx.fillRect(pos.x - w/2, pos.y - w/2, w, w);
        this.drewAsHighlighted = false;
    }

    this.coordinate_string = function() {
        return this.coord.y + ", " + this.coord.x
    }

    this.selected_events = function() {
        let desc = "\n";
        if (this.isHubOf != undefined) {
            desc += "Main Stop of " + this.isHubOf;
        }
        let descc = this.coordinate_string() + "\nID:" + this.stop_id;

        infoBox.setBusstopScheme();
        infoBox.set_text(this.name, descc, desc);
        infoBox.update();
    }
}