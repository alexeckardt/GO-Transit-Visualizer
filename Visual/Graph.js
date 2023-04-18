import { BusStopNode } from "./Busstop.js";
import { Vector2 } from "../Components/helper.js";
import { originX, originY } from "../Components/Coordinates.js";

function Graph() {

    this.busstops = [];
    this.stop_data = {};

    this.addStop = function(stop) {
        this.busstops.push(stop);
        return;
    }

    this.draw = function(ctx) {

        //New
        

        //Draw Edges

        //Draw Stops
        for (var i = 0; i < this.busstops.length; i++) {
            let busstop = this.busstops[i];
            busstop.draw(ctx);
        }

        //End

    }
}

export async function generateGraph() {
    
    //Get From Json
    const res = await fetch('./Visual/Source/transitGraph.json')
    let obj = await res.json();

    //See

    //Add Nodes
    for (const [key, value] of Object.entries(obj.nodes)) {
        //console.log(value)

        //Pass Data Into Struct
        G.stop_data[key] = value;

        var newStop = new BusStopNode(value.stop_id, new Vector2(value.lon, value.lat));
        G.addStop(newStop);
    }

    //let baseStop = new BusStopNode("NA", new Vector2(originX, originY));
    //let baseStop2 = new BusStopNode("NAA", new Vector2(originX + 1, originY));
    //G.addStop(baseStop);
    //G.addStop(baseStop2);
    generatedGraph = true;
}

export function drawGraph(ctx) {
    if (generatedGraph) {
        G.draw(ctx);
    }
}

let G = new Graph();
let generatedGraph = false;