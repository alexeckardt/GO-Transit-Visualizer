import { real_coords_to_world_position } from "../Components/Coordinates.js";
import { TripEdge } from  "./TripEdges.js";
import { mouse } from "../Components/Mouse.js";
import { edgeColour, backgroundCol, busStopCol, gridLineCol, cityColour, defFont, cityNameCol, } from "../Components/Style.js";
import { cam } from "../Components/Camera.js";

export const shouldBakeGraph = false;

function Graph() {

    this.busstops = [];
    this.stop_data = {};

    this.edges = {}
    this.display_edges = []
    this.display_edges_index = {}

    this.route_data = {};

    this.cities = [];
    this.city_index = {};
    this.stop_hubs = {};

    this.generated = false;

    this.addStop = function(stop) {

        this.busstops.push(stop);

        //Keep Reference
        this.stop_data[stop.stop_id].StopNode = stop;
        return;
    }

    this.addCity = function(city) {
        this.cities.push(city);
        this.city_index[city.name] = this.cities.length-1;
    }

    this.city_set_hub_city = function(cityName, hubId) {

        if (hubId == undefined) {
            return;
        }

        this.stop_hubs[hubId] = cityName;
        let stop = this.getStop(hubId);

        stop.isHubOf = cityName;
    }

    this.getStop = function(stopId) {
        return this.stop_data[stopId].StopNode;
    }

    this.get_stop_name = function(stopId) {
        return this.stop_data[stopId].name;
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
        
        //Draw Cities as
        ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = cityColour;
        ctx.beginPath();
        var s = cam.get_feature_scale();
        for (var i = 0; i < this.cities.length; i++) {
            let city = this.cities[i];
            city.plot(ctx);
        }
        ctx.closePath();
        ctx.fill();
        ctx.globalCompositeOperation = "normal";

        //Draw Edges
        //Start
        ctx.beginPath();
        for (var i = 0; i < this.display_edges.length; i++) {
            let edge = this.display_edges[i];
            edge.plot(ctx);
        }
        ctx.closePath();
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

            // Always draw Hub Bus Stops Small
            for (let key in this.stop_hubs) {
                let stop = this.getStop(key);
                stop.draw_selected(ctx, 0.5);
            }
        }
        
        ctx.closePath();

  

        //
        // Semi Selected
        //

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

        //
        //Draw City Names
        ctx.fillStyle = cityNameCol;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'center';
        ctx.strokeStyle = backgroundCol;
        ctx.lineWidth = 3;
        ctx.font = defFont;
        ctx.beginPath();
        for (var i = 0; i < this.cities.length; i++) {
            let city = this.cities[i];
            let position = real_coords_to_world_position(city.position);

            if (city.alwaysDrawName || (cam.scaleInd > 2)) {
                city.plot_name(ctx, position);
            }
        }
        ctx.closePath();
        ctx.fill();

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

export function drawGraph(ctx) {
    if (G.generated) {
        G.draw(ctx);
    }
}

export const G = new Graph();