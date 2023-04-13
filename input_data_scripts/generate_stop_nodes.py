import re

class Node:
    def __init__(self, stop_id, name):
        self.id = stop_id
        self.name = name
    def __repr__(self):
        return self.name

class Route:
    def __init__(self, route_id,agency_id,route_short_name,route_long_name,route_type,route_color,route_text_color):
        
        #Info
        self.route_id = route_id,
        self.agency_id = agency_id
        self.route_short_name = route_short_name
        self.route_long_name = route_long_name
        self.route_type = route_type
        self.route_color = route_color
        self.route_text_color = route_text_color

        #Sub Routes (47 vs 47G .. same "Route", but different stops)
        self.edges = {}

    def __repr__(self):
        return self.name
    

class Edge:
    def __init__(self, name):
        self.name = name

    def __repr__(self):
        return self.name
    
class Graph:
    def __init__(self):
        self.adj = {}
        self.routes = {}

    #
    def add_node(self, node):

        #Make Sure Not Overriding
        if (self.adj.get(node.id, '{}') != {}):
            self.adj[node.id] = {}
        else:
            raise Exception(f"Node {node.id} exists in graph already!")
        
    #
    def add_edge(self):
        pass

    #
    def add_route(self, route):
        idd = route.route_short_name

        if (self.adj.get(idd, '{}') != {}):
            self.adj[idd] = {}
        else:
            raise Exception(f"Node {idd} exists in graph already!")

    def __str__(self):
        return str(self.adj)
    
if __name__ == '__main__':
        
    with open('input_data_scripts/in_GTFS/stops.txt', 'r') as f:

        G = Graph()

        # Drop Heading Line
        line = f.readline();
        line = f.readline().strip();

        #Loop
        while line != '':

            stop_id,stop_name,stop_lat,stop_lon,zone_id,stop_url,location_type,parent_station,wheelchair_boarding,stop_code = line.split(',')
            stopNode = Node(stop_id, stop_name)

            G.add_node(stopNode)

            #Continue
            line = f.readline().strip();

        # Done, Generated Nodes

    #
    #Generate Routes
    with open('input_data_scripts/in_GTFS/routes.txt', 'r') as f:
         # Drop Heading Line
        line = f.readline();
        line = f.readline().strip();

        while line != '':

            route_id,agency_id,route_short_name,route_long_name,route_type,route_color,route_text_color = line.split(',')
            route = Route(route_id,agency_id,route_short_name,route_long_name,route_type,route_color,route_text_color);
            G.add_route(route)

            #Continue
            line = f.readline().strip();

    #
    # Generate Edges
    with open('input_data_scripts/in_GTFS/stop_times.txt', 'r') as f:

        # Drop Heading Line
        line = f.readline();
        line = f.readline().strip();

        #Loop
        while line != '':

            trip_id,arrival_time,departure_time,stop_id,stop_sequence,pickup_type,drop_off_type,stop_headsign = line.split(',')
            route = re.search('\d{8}-(.*)-', trip_id).groups()[0]

            #Continue
            line = f.readline().strip();




        # Print Adj List
        print(G)