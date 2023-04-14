import re

def convert_time_to_seconds(timestr):
    if (timestr == None):
        return 0

    parts = timestr.split(":")

    hours = int(parts[0])
    mins = int(parts[1])
    seconds = int(parts[2])

    return seconds + 60*(mins + 60*hours) 

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
        self.subroutes = {}

    def add_trip(self, long_trip_id, fromNodeId, toNodeId):

        #Create if DNE
        if self.subroutes.get(long_trip_id, None) == None:
            self.subroutes[long_trip_id] = []
        
        #Add Edge
        self.subroutes[long_trip_id].append((fromNodeId, toNodeId))

    def __repr__(self):
        return self.name
    
class Trip:
    def __init__(self, trip_id,arrival_time,departure_time,stop_id,stop_sequence,pickup_type,drop_off_type,stop_headsign):
        self.trip_id = trip_id
        self.arrival_time = convert_time_to_seconds(arrival_time)
        self.departure_time = convert_time_to_seconds(departure_time)
        self.stop_id = stop_id
        self.stop_sequence = stop_sequence
        self.pickup_type = pickup_type
        self.drop_off_type = drop_off_type
        self.stop_headsign = stop_headsign

    def get_route_long_id(self):
        if (self.trip_id == None):
            return ""
        
        return re.search('\d{8}-(.*)', self.trip_id).groups()[0]
    
    def get_route_split(self):
        s = self.get_route_long_id().split('-')
        return tuple(s)

    def get_route_shortname(self):
        return self.get_route_split()[0]
    
    def __eq__(self, __value):
        
        if (self.trip_id != __value.trip_id):
            return False
        
        if (self.stop_id != __value.stop_id):
            return False

        return True

class Graph:
    def __init__(self):
        self.adj = {}
        self.weights = {}
        self.routes = {}
        self.nodes = {}
    #
    def add_node(self, node):

        #Make Sure Not Overriding
        if (self.adj.get(node.id, None) == None):

            self.adj[node.id] = []
            print(node.id)

            #Store Node
            self.nodes[node.id] = node
        else:
            raise Exception(f"Node {node.id} exists in graph already!")
        
    #
    def add_edge(self, fromNodeId, toNodeId, routeId, timeElapsed):
        
        #Mark As Edge Exists
        self.adj[fromNodeId].append(toNodeId)
        
        # Add Weights
        self.weights[(fromNodeId, toNodeId)] = (timeElapsed)

        # Get Route
        route = self.get_route(routeId)
        route.add_trip(routeId, fromNodeId, toNodeId)

        
    def get_route(self, routeId):
        shortId = routeId.split('-')[0]
        return self.routes[shortId]

    def get_node(self, stop_id_str):
        return self.nodes[stop_id_str];

    #
    def add_route(self, route):
        idd = route.route_short_name

        if (self.routes.get(idd, None) == None):
            self.routes[idd] = route

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

        #Storing
        lastTrip = Trip(None,None,None,None,None,None,None,None)

        #Loop
        while line != '':

            trip_id,arrival_time,departure_time,stop_id,stop_sequence,pickup_type,drop_off_type,stop_headsign = line.split(',')
            trip = Trip(trip_id,arrival_time,departure_time,stop_id,stop_sequence,pickup_type,drop_off_type,stop_headsign)

            #Route in Form
            # XX-$$$$$$$
            #
            # XX is the route id (LW, MI, 47), and from what I can tell, $$$$$$$ is an identifier (sub route?)

            #Ensure Same Route
            if (lastTrip.get_route_long_id() == trip.get_route_long_id()):

                # An Edge Found!
                # We only use arrival time, because we want to include layover time
                timeElapsed = trip.arrival_time - lastTrip.arrival_time
                
                route_id = trip.get_route_long_id();

                lastNode = lastTrip.stop_id
                thisNode = trip.stop_id

                G.add_edge(lastNode, thisNode, route_id, timeElapsed)

            #Store
            lastTrip = trip

            #Continue
            line = f.readline().strip();

        # Print Adj List
        print(G)