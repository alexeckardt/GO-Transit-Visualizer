import { BusStopNode } from "./Busstop.js";
import { Vector2 } from "../Components/helper.js";
import { originX, originY } from "../Components/Coordinates.js";
import { City } from "./City.js";
import { G, shouldBakeGraph } from "./Graph.js";

function bake_graph() {

    G.stop_data["NA"] = {};
    G.stop_data["NAA"] = {};

    let baseStop = new BusStopNode("NA", new Vector2(originX, originY), "Test");
    let baseStop2 = new BusStopNode("NAA", new Vector2(originX - 1, originY + 0.2), "Test");
    G.addStop(baseStop);
    G.addStop(baseStop2);

    let edge = G.addEdge("NA", "NAA", 1);
    edge.add_edge_shape_point(originX, originY);
    edge.add_edge_shape_point(originX - 2, originY);
    edge.add_edge_shape_point(originX - 1, originY + 0.2);
}
function get_travel_edges(adjList) {
    var list = [];


    for (const [sourceid, value] of Object.entries(adjList)) {
        for (const [destid, _] of Object.entries(value)) {

            var edgeobj = G.get_edge_object(sourceid, destid);
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
        const res = await fetch('./Visual/Source/transitGraph.json');
        let obj = await res.json();

        //Add Nodes
        for (const [key, value] of Object.entries(obj.nodes)) {

            //Pass Data Into Struct
            G.stop_data[key] = value;

            var newStop = new BusStopNode(value.stop_id, new Vector2(value.lon, value.lat), value.name);
            G.addStop(newStop);
        }

        //Add Edges
        for (const [source, adj] of Object.entries(obj.edges)) {

            for (const [to, weight] of Object.entries(adj)) {

                //Generate Edge                
                G.addEdge(source, to, weight);
            }
        }

        //Add Routes
        for (const [key, value] of Object.entries(obj.routes)) {
            //Pass Data Into Struct
            let routeData = {};

            routeData.agency_id = value['agency_id'];
            routeData.route_color = value['route_color'];
            routeData.route_short_name = value['route_short_name'];
            routeData.route_long_name = value['route_long_name'];
            routeData.route_text_color = value['route_text_color'];
            routeData.route_type = value['route_type'];
            routeData.travels_edges = get_travel_edges(value['travels_edges']);
            routeData.stops_at = get_travel_stop(value['travels_edges']);

            G.route_data[key] = routeData;

            //Add Self to the edges
            for (var i = 0; i < routeData.travels_edges.length; i++) {
                let edge = routeData.travels_edges[i];

                edge.add_route_that_travels_me(key, routeData.route_color, routeData.route_type);
            }

        }

        //Add Nodes
        for (const [key, value] of Object.entries(obj.cities)) {
            var cityData = value;
            var newCity = new City(key, cityData['population'], cityData['lat'], cityData['lon'], cityData['place'], cityData['my_hub_stop']);
            G.addCity(newCity);
            G.city_set_hub_city(key, cityData['my_hub_stop']);
        }

    } else {

        //Bake Graph
        bake_graph();

    }

    //Mark
    console.log("Generated!");
    console.log(G);
    G.generated = true;
}
