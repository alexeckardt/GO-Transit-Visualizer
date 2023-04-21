import json

def export_nodes(G):

    nodes = {}
    for node in G.nodes:
        stop = G.nodes[node]

        stopp = {}
        stopp['stop_id'] = stop.id
        stopp['name'] = stop.name
        stopp['lat'] = stop.lat
        stopp['lon'] = stop.lon
        stopp['zone_id'] = stop.zone_id
        stopp['stop_url'] = stop.stop_url
        stopp['location_type'] = stop.location_type
        stopp['parent_station'] = stop.parent_station
        stopp['wheelchair_boarding'] = stop.wheelchair_boarding
        stopp['stop_code'] = stop.stop_code

        stopp['routes_that_stop_here'] = routes_that_stop_at_stop(G, stop.id)

        nodes[node]=stopp

    return nodes;

def export_edges(G):
    return G.adj


def routes_that_stop_at_stop(G, stop_id):
    routes = []

    for route in G.routes.values():
        if (route.stops_at_stop(stop_id)):
            routes.append(route.route_id)
    
    return routes


def export_routes(G):
    routesin = G.routes;
    routes = {}
    for route in routesin:
        info = routesin[route]

        store = {}
        store['agency_id'] = info.agency_id
        store['route_color'] = info.route_color
        store['route_short_name'] = info.route_short_name
        store['route_long_name'] = info.route_long_name
        store['route_text_color'] = info.route_text_color
        store['route_type'] = info.route_type

        store['travels_edges'] = info.edges

        #Store
        routes[info.route_id] = store

    return routes

def export_g(G):

    print(G)

    graphDict = {}
    graphDict["routes"] = export_routes(G)
    graphDict["edges"] = export_edges(G)
    graphDict["nodes"] = export_nodes(G)

    strr = json.dumps(graphDict, indent=4)
    with open('./Visual/Source/transitGraph.json', 'w') as f:
          f.write(strr)