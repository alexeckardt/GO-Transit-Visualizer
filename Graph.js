import { BusStopNode } from "./Busstop.js";
import { Vector2 } from "./helper.js";
import { originX, originY } from "./Coordinates.js";

function Graph() {
    this.stops = [];

    this.addStop = function(stop) {
        this.stops.push(stop);
        return;
    }

    this.draw = function(ctx) {

        //New
        ctx.beginPath();

        //Draw Edges

        //Draw Stops
        for (var i = 0; i < this.stops.length; i++) {
            let busstop = this.stops[i];
            busstop.draw(ctx);
        }

        //End
        ctx.closePath();
    }
}

export async function generateGraph() {
    generatedGraph = true;

    let baseStop = new BusStopNode(new Vector2(originX, originY));
    G.addStop(baseStop);
}

export function drawGraph(ctx) {
    G.draw(ctx);
}

let G = new Graph();
let generatedGraph = false;