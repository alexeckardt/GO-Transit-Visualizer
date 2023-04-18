import { BusStopNode } from "./Busstop.js";
import { Vector2 } from "../Components/helper.js";
import { originX, originY } from "../Components/Coordinates.js";
import { TripEdge } from  "./TripEdges.js";

function Graph() {

    this.busstops = [];
    this.stop_data = {};

    this.edges = {}
    this.display_edges = []

    this.addStop = function(stop) {

        this.busstops.push(stop);

        //Keep Reference
        this.stop_data[stop.stop_id].StopNode = stop;
        return;
    }

    this.getStop = function(stopId) {
        return this.stop_data[stopId].StopNode;
    }

    this.addEdge = function(fromId, toId, weight) {

        //Add Data
        this.edges[this.get_edge_id(fromId, toId)] = weight;

        //Get Stops
        var from = this.getStop(fromId);
        var to = this.getStop(toId);

        //new visual
        let newEdge = new TripEdge(from, to, weight);
        this.display_edges.push(newEdge);
    }

    this.get_edge_id = function(fromId, toId) {
        return fromId +"+"+ toId;
    }

    this.draw = function(ctx) {

        //New
        

        //Draw Edges
        for (var i = 0; i < this.display_edges.length; i++) {
            let edge = this.display_edges[i];
            edge.draw(ctx);
        }

        //Draw Stops
        for (var i = 0; i < this.busstops.length; i++) {
            let busstop = this.busstops[i];
            busstop.draw(ctx);
        }

        //End

    }
}

function bake_graph() {
    
    G.stop_data["NA"] = {}
    G.stop_data["NAA"] = {}

    let baseStop = new BusStopNode("NA", new Vector2(originX, originY));
    let baseStop2 = new BusStopNode("NAA", new Vector2(originX - 1, originY + 0.2));
    G.addStop(baseStop);
    G.addStop(baseStop2);

    G.addEdge("NA", "NAA", 1);
}

export async function generateGraph() {
    
    //Get From Json
    const res = await fetch('./Visual/Source/transitGraph.json')
    let obj = await res.json();

    //See

    //Add Nodes
    /*
    for (const [key, value] of Object.entries(obj.nodes)) {
        //console.log(value)

        //Pass Data Into Struct
        G.stop_data[key] = value;

        var newStop = new BusStopNode(value.stop_id, new Vector2(value.lon, value.lat));
        G.addStop(newStop);
    }
    //Add Edges
    for (const [source, adj] of Object.entries(obj.edges)) {

        //console.log(value)
        for (const [to, weight] of Object.entries(adj)) {

        }
    }
    generatedGraph = true;*/
    
    //Bake Graph
    bake_graph();

    generatedGraph = true;
}

export function drawGraph(ctx) {
    if (generatedGraph) {
        G.draw(ctx);
    }
}

let G = new Graph();
let generatedGraph = false;