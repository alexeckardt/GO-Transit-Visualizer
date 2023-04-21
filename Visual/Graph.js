import { BusStopNode } from "./Busstop.js";
import { Vector2 } from "../Components/helper.js";
import { originX, originY } from "../Components/Coordinates.js";
import { TripEdge } from  "./TripEdges.js";
import { mouse } from "../Components/Mouse.js";
import { edgeColour, backgroundCol, busStopCol } from "../Components/Colors.js";
import { cam } from "../Components/Camera.js";

const shouldBakeGraph = false;

function Graph() {

    this.busstops = [];
    this.stop_data = {};

    this.edges = {}
    this.display_edges = []
    this.display_edges_index = {}

    this.route_data = {};

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
        var eId = this.get_edge_id(fromId, toId);
        this.edges[eId] = weight;

        //Get Stops
        var from = this.getStop(fromId);
        var to = this.getStop(toId);

        //new visual
        let newEdge = new TripEdge(from, to, weight);
        this.display_edges.push(newEdge);

        this.display_edges_index[eId] = this.display_edges.length - 1;

        return newEdge;
    }

    this.get_edge_object = function(from, to) {
        var idd = this.get_edge_id(from, to);
        var index = this.display_edges_index[idd];
        return this.display_edges[index];
    }

    this.get_edge_id = function(fromId, toId) {
        return fromId +"+"+ toId;
    }

    this.draw = function(ctx) {

        //New
        

        //Draw Edges

        //Start
        var s = cam.get_feature_scale();
        for (var i = 0; i < this.display_edges.length; i++) {
            let edge = this.display_edges[i];
            edge.plot(ctx);
        }
        ctx.strokeStyle = edgeColour;
        ctx.lineWidth = 3*s;
        ctx.stroke();

        //Draw Stops
        ctx.beginPath();
        
        if (cam.selectable()) {
            for (var i = 0; i < this.busstops.length; i++) {
                let busstop = this.busstops[i];
                busstop.draw(ctx)
            }
        } else {
            ctx.fillStyle = edgeColour;
            for (var i = 0; i < this.busstops.length; i++) {
                let busstop = this.busstops[i];
                busstop.plot_rect(ctx)
            }
            ctx.fill();
        }
        
        ctx.closePath();

        //
        // Semi Selected
        //
        /*
        for (var i = 0; i < this.display_edges.length; i++) {
            let edge = this.display_edges[i];
            if (edge.from)
            edge.plot(ctx);
        }
        ctx.strokeStyle = edgeColour;
        ctx.lineWidth = 3*s;
        ctx.stroke();*/

        //
        // Route Selected info
        //
        var routesToDraw = mouse.selectedRoutes;
        for (var i = 0; i < routesToDraw.length; i++) {
            let routeId = routesToDraw[i];
            let routeData = this.route_data[routeId];
            let edgesOver = routeData['travels_edges'];
            let stopsAt = routeData['stops_at'];

            //Go Over Edges
            for (var j = 0; j < edgesOver.length; j++) {
                let edge = edgesOver[j];
                edge.draw_selected(ctx);
            }

            //Go Over Stops
            for (var j = 0; j < stopsAt.length; j++) {
                let stop =this.getStop(stopsAt[j]);
                stop.draw_selected(ctx);
            }
        }

        //Redraw Selected
        if (mouse.elementSelected != undefined) {
            mouse.elementSelected.draw_with_text(ctx);
        }
        if (mouse.elementHovering != undefined) {
            mouse.elementHovering.draw_with_text(ctx);
        }

        //End
    }

    this.get_all_routes_from_stop = function(node) {

        let adj = []

        //Get Node Data
        var nodeData = G.stop_data[node.stop_id]
        var routes = nodeData['routes_that_stop_here'];
        return routes;
    }
}

function bake_graph() {
    
    G.stop_data["NA"] = {}
    G.stop_data["NAA"] = {}

    let baseStop = new BusStopNode("NA", new Vector2(originX, originY), "Test");
    let baseStop2 = new BusStopNode("NAA", new Vector2(originX - 1, originY + 0.2), "Test");
    G.addStop(baseStop);
    G.addStop(baseStop2);

    let edge = G.addEdge("NA", "NAA", 1);
    edge.add_edge_shape_point(originX, originY)
    edge.add_edge_shape_point(originX-2, originY)
    edge.add_edge_shape_point(originX-1, originY+0.2)
}

function get_travel_edges(adjList) {
    var list = [];

    console.log(adjList);

    for (const [sourceid, value] of Object.entries(adjList)) {
        for (const [destid, _] of Object.entries(value)) {
            
            var edgeobj = G.get_edge_object(sourceid, destid)
            list.push(edgeobj);

        }
    }

    return list;
}

function get_travel_stop(adjList) {
    var list = [];

    for (const [key, value] of Object.entries(adjList)) {
        list.push(key);
    }

    return list;
}

export async function generateGraph() {
    
    //See
    if (!shouldBakeGraph) {
        
        //Get From Json
        const res = await fetch('./Visual/Source/transitGraph.json')
        let obj = await res.json();

        const result2 = await fetch('./Visual/Source/edge_shapes.json')
        let edgeObj = await result2.json();

        //Add Nodes
        for (const [key, value] of Object.entries(obj.nodes)) {
            //console.log(value)

            //Pass Data Into Struct
            G.stop_data[key] = value;
            
            var newStop = new BusStopNode(value.stop_id, new Vector2(value.lon, value.lat), value.name);
            G.addStop(newStop);
        }

        let failEdges = []

        //Add Edges
        for (const [source, adj] of Object.entries(obj.edges)) {

            //console.log(value)
            for (const [to, weight] of Object.entries(adj)) {
                
                //Generate Edge                
                var edge = G.addEdge(source, to, weight);

                //Get Edge
                var edgeId = "('" + source + "', '" + to + "')";
                var edgeShapes = edgeObj[edgeId]
                
                // Recreate, see if back works?
                if (edgeShapes == undefined) {
                    edgeId = "('" + to + "', '" + source + "')";
                    edgeShapes = edgeObj[edgeId]
                }

                //Add Shape
                if (edgeShapes != undefined) {
                    for (var i = 0; i < edgeShapes.length; i++) {
                        var point = edgeShapes[i]
                        edge.add_edge_shape_point(point[1], point[0])
                    }
                } else {
                    failEdges.push(edgeId)
                }
            }
        }
        console.log(failEdges)
        console.log(failEdges.length)

        //Add Routes
        for (const [key, value] of Object.entries(obj.routes)) {
            //Pass Data Into Struct
            let routeData = {};

            routeData.agency_id = value['agency_id']
            routeData.route_color = value['route_color']
            routeData.route_short_name = value['route_short_name']
            routeData.route_long_name = value['route_long_name']
            routeData.route_text_color = value['route_text_color']
            routeData.route_type = value['route_type']
            routeData.travels_edges = get_travel_edges(value['travels_edges']);
            routeData.stops_at = get_travel_stop(value['travels_edges']);

            G.route_data[key] = routeData;

        }

        console.log(G.route_data)
        
    } else {

        //Bake Graph
        bake_graph();

    }

    generatedGraph = true;
}

export function drawGraph(ctx) {
    if (generatedGraph) {
        G.draw(ctx);
    }
}

export const G = new Graph();
let generatedGraph = false;