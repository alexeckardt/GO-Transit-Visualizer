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

        nodes[node]=stopp

    return nodes;

def export_g(G):

    print(G)

    nodes = export_nodes(G)

    graphDict = {}
    graphDict["nodes"] = nodes

    strr = json.dumps(graphDict, indent=4)
    with open('transitGraph.json', 'w') as f:
          f.write(strr)