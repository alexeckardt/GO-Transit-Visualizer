import { cam } from "../Components/Camera.js";
import { real_coords_to_world_position } from "../Components/Coordinates.js";
import { Vector2 } from "../Components/helper.js";

function clampCityRadius(rad) {
    return Math.max(1, Math.min(Math.sqrt(rad)/100, 30));
}

export function City(name, pop, lat, lon, type, hub) {
    this.name = name;
    this.population = pop;
    this.position = new Vector2(lat, lon);
    this.type = type;
    this.hub_stop = hub;

    this.alwaysDrawName = pop >= 100000;

    this.radius = clampCityRadius(pop);

    this.plot = function(ctx) {
        let r = this.radius * cam.scale;
        let pos = real_coords_to_world_position(this.position);
        ctx.moveTo(pos.x + r, pos.y);
        ctx.arc(pos.x, pos.y, r, 0, 2 * Math.PI);
    }

    this.plot_name = function(ctx, pos) {
        ctx.strokeText(this.name, pos.x, pos.y);
        ctx.fillText(this.name, pos.x, pos.y);
    }
}

