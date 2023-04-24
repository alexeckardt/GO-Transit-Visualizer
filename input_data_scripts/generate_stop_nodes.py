import json
import math
import re
from export import export_g
from shortest_path import Element, MinHeap

def convert_time_to_seconds(timestr):
    if (timestr == None):
        return 0

    parts = timestr.split(":")

    hours = int(parts[0])
    mins = int(parts[1])
    seconds = int(parts[2])

    return seconds + 60*(mins + 60*hours) 

def seconds_to_time_elapsed(seconds):

    h = seconds // (60 * 60)
    seconds -= h*60*60

    m = seconds // 60
    seconds -= m*60

    return (h, m, seconds)

def km_distance_from_latlon(lat1,lon1,lat2,lon2):
  R = 6371; # Radius of the earth in km
  dLat = deg2rad(lat2-lat1);#// deg2rad below
  dLon = deg2rad(lon2-lon1); 
  a = math.sin(dLat/2) * math.sin(dLat/2) + math.cos(deg2rad(lat1)) * math.cos(deg2rad(lat2)) * math.sin(dLon/2) * math.sin(dLon/2) 
  
  c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a)); 
  d = R * c; # Distance in km
  return d;

def deg2rad(deg):
  return deg * (math.pi/180)


def strip_go_transit_id(long_trip_id):
    fake = long_trip_id.replace('04230623-', '')
    return fake

class Node:
    def __init__(self, stop_id, stop_name, stop_lat, stop_lon,zone_id,stop_url,location_type,parent_station,wheelchair_boarding,stop_code):
        self.id = stop_id;
        self.name = stop_name;
        self.lat = float(stop_lat);
        self.lon = float(stop_lon);
        self.zone_id= zone_id;
        self.stop_url =stop_url;
        self.location_type= location_type;
        self.parent_station= parent_station;
        self.wheelchair_boarding= wheelchair_boarding;
        self.stop_code= stop_code;

    #Assuming Average 90 km/h
    def distance_seconds(self, otherNode):
        
        spdkmh = 90
        dist = km_distance_from_latlon(self.lat, self.lon, otherNode.lat, otherNode.lon)
        seconds = dist / spdkmh * 3600
        return int(seconds)

    def __repr__(self):
        return self.name

class Route:
    def __init__(self, route_id,agency_id,route_short_name,route_long_name,route_type,route_color,route_text_color):
        
        #Info
        self.route_id = strip_go_transit_id(route_id)
        self.agency_id = agency_id
        self.route_short_name = route_short_name
        self.route_long_name = route_long_name
        self.route_type = route_type
        self.route_color = route_color
        self.route_text_color = route_text_color

        #Sub Routes (47 vs 47G .. same "Route", but different stops)
        self.subroute_paths = {}
        self.subroutes = {}
        self.stops = {}
        self.edges = {}

    def add_trip(self, long_trip_id, fromNodeId, toNodeId):

        #Create if DNE
        idd = strip_go_transit_id(long_trip_id)
        if self.subroute_paths.get(idd, None) == None:
            self.subroute_paths[idd] = []
        
        self.subroutes[idd] = 1

        #Add Edge
        edge = (fromNodeId, toNodeId)
        if (edge not in self.subroute_paths[idd]):
            self.subroute_paths[idd].append(edge)

        self.stops[fromNodeId] = True
        self.stops[toNodeId] = True

        d = self.edges.get(fromNodeId, {})
        d[toNodeId] = 1
        self.edges[fromNodeId] = d


    def stops_at_stop(self, stopid):
        return self.stops.get(stopid, False)

    def travels_edge(self, edge):

        for subroute_pathid in self.subroute_paths:
            subroute_path = self.subroute_paths[subroute_pathid]
            if (edge in subroute_path):
                return True
        return False

    def cleanup_subroutes(self):

        cleanedSubroutes = {}

        for subrouteId in self.subroutes.keys():
            path = self.subroute_paths[subrouteId]

            #Check Path DNE
            isCleanPath = True
            for cleanedPath in cleanedSubroutes.values():
                if (path == cleanedPath):
                    isCleanPath = False
                    break;
    
            #Path is Not Existing Yet
            if isCleanPath:
                cleanedSubroutes[subrouteId] = path

        #Store, Trash Prev
        self.subroute_paths = cleanedSubroutes


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
        self.duplicate_stops = {}
        self.city_data = {}

    #
    #
    #   Graph Generation
    #
    #

    #
    def set_city_data(self, key, value):
        self.city_data[key] = value

    def set_city_stop(self, city, stopid):
        data = self.city_data.get(city, None)
        if (data == None):
            print(f'Attempted to set {city} hub stop, city DNE.')
            return
        data['my_hub_stop'] = stopid;

    def add_node(self, node):

        #Make Sure Not Overriding
        if (self.adj.get(node.id, None) == None):

            self.adj[node.id] = {}

            #Store Node
            self.nodes[node.id] = node
        else:
            raise Exception(f"Node {node.id} exists in graph already!")
        
    def store_stop_as_duplicate(self, duplicate, source):
            self.duplicate_stops[duplicate] = source;

    def get_duplicate_if_duplicate(self, stopId):
        return self.duplicate_stops.get(stopId, stopId) #Return self if not found

    #
    def add_edge(self, fromNodeId, toNodeId, routeId, timeElapsed):
        
        #Get real
        fromNodeId = self.get_duplicate_if_duplicate(fromNodeId)
        toNodeId = self.get_duplicate_if_duplicate(toNodeId)

        #Mark As Edge Exists
        self.adj[fromNodeId][toNodeId] = timeElapsed # just hash it :)
    
        # Get Route
        route = self.get_route(routeId)
        route.add_trip(routeId, fromNodeId, toNodeId)
 
    def add_walking_edge(self, fromNodeId, toNodeId, timeElapsed):
                #Get real
        fromNodeId = self.get_duplicate_if_duplicate(fromNodeId)
        toNodeId = self.get_duplicate_if_duplicate(toNodeId)
        #Mark As Edge Exists
        self.adj[fromNodeId][toNodeId] = timeElapsed # just hash it :)
        self.adj[toNodeId][fromNodeId] = timeElapsed # just hash it :)

    def get_weight(self, fromm, to):

        #Get real
        fromm = self.get_duplicate_if_duplicate(fromm)
        to = self.get_duplicate_if_duplicate(to)
        return self.adj[fromm][to]

    def get_route(self, routeId):
        shortId = routeId.split('-')[0]
        return self.routes[shortId]

    def get_node(self, stop_id_str):
        return self.nodes.get(stop_id_str, None);
    #
    def add_route(self, route):

        idd = strip_go_transit_id(route.route_id)

        if (self.routes.get(idd, None) == None):
            self.routes[idd] = route
        else:
            raise Exception(f"Node {idd} exists in graph already!")

    def __str__(self):
        return str(self.adj)

    def dump(self, filePath):
        with open(filePath, 'w') as f:

            package = {}
            package["adjacency"] = {}

            for key in self.adj.keys():
                package['adjacency'][key] = []

                for item in self.adj[key]:
                    package['adjacency'][key].append(item)

            json_object = json.dumps(package, indent = 4) 
            f.writelines(json_object)
        return
    
    #
    #Side Affects
    def clean_routes(self):

        for route in self.routes:
            self.get_route(route).cleanup_subroutes()

    #
    #
    #   Functions
    #
    #

    #
    # Check if edge is bidirectional
    #
    def edge_exists(self, fromId, toId):
        #Get real
        fromId = self.get_duplicate_if_duplicate(fromId)
        toId = self.get_duplicate_if_duplicate(toId)

        return self.adj[fromId].get(toId, None) != None

    def edge_is_dual(self, fromId, toId):
        #Get real
        fromId = self.get_duplicate_if_duplicate(fromId)
        toId = self.get_duplicate_if_duplicate(toId)

        if (not self.edge_exists(fromId, toId)): #Edge DNE At least one way
            return False
        
        return self.edge_exists(toId, fromId) #Get the other way
    
    def get_routes_that_stop_at_stop(self, stopid):
        foundRoutes = []

        for routeid in self.routes.keys():
            route = self.routes[routeid]

            if (route.stops_at_stop(stopid)):
                foundRoutes.append(route.route_id)

        return foundRoutes
    
    def get_routes_that_travel_edge(self, edge):
        foundRoutes = []

        for routeid in self.routes.keys():
            route = self.routes[routeid]

            if (route.travels_edge(edge)):
                foundRoutes.append(route.route_id)

        return foundRoutes

    # Time in
    def get_shortest_travel_path(self, fromNode, toNode):

        #Get real
        fromId = self.get_duplicate_if_duplicate(fromId)
        toId = self.get_duplicate_if_duplicate(toId)

        # Dijksta
        pred = {}
        dist = {} #Distance dictionary
        Q = MinHeap([])
        nodes = list(G.adj.keys())

        #Initialize priority queue/heap and distances
        for node in nodes:
            Q.insert(Element(node, float("inf")))
            dist[node] = float("inf")

        Q.decrease_key(fromNode, 0)
        pred[fromNode] = None

        #Meat of the algorithm
        while not Q.is_empty():
            current_element = Q.extract_min()
            current_node = current_element.value
            dist[current_node] = current_element.key

            for neighbour in G.adj[current_node]:

                weight = G.get_weight(current_node, neighbour)

                if dist[current_node] + weight < dist[neighbour]:
                    Q.decrease_key(neighbour, dist[current_node] + weight)
                    dist[neighbour] = dist[current_node] + weight
                    pred[neighbour] = current_node

        # Have the Distances
        # Get All Edges

        stops = [toNode]

        lastStop = pred[toNode]
        while lastStop != None:
            stops.append(lastStop)
            lastStop = pred[lastStop]

        #
        # Calculate Routes I Could Take
        #

        #
        # Get All Routes per each edge
        #
 
        # Get all routes at each stop
        possibleRoutes = {}
        edgesToTravel = []
        for i in range(len(stops)-1):
            edge = (stops[i+1], stops[i])
            edgesToTravel.append(edge)
            possibleRoutes[edge] = self.get_routes_that_travel_edge(edge)

        # We now have every possible route at each edge, determine which routes are best to do
        
        #
        #Get route streaks
        #
        routeStreaks = {}
        for i in range(0, len(possibleRoutes)-1):
            # Check Edge Streaks
            edge = edgesToTravel[i]
            nextedge = edgesToTravel[i+1]
            here = possibleRoutes[edge]
            nexxt = possibleRoutes[nextedge]

            #Add Streaks
            for route in here:
                routeStreaks[route] = routeStreaks.get(route, 0)
            for route in nexxt:
                routeStreaks[route] = routeStreaks.get(route, 0)

            # Calc Streaks
            for route in here:
                if (route in nexxt):
                    routeStreaks[route] += 1
        
        #
        routePerEdge = {}
        while len(edgesToTravel) > 0:

            # Get Max, generally in order
            maxRoute = None
            maxStreak = 0
            for route in routeStreaks:
                if (routeStreaks[route] > maxStreak):
                    maxStreak = routeStreaks[route] 
                    maxRoute = route

            for i in range(len(edgesToTravel)):

                edge = edgesToTravel[i]
                if (maxRoute in possibleRoutes[edge]):
                    routePerEdge[edge] = maxRoute # say we travel this edge with this route
                    edgesToTravel[i] = -1

            #Delete any -1's Afterwards
            ii = 0
            for i in range(len(edgesToTravel)):
                if edgesToTravel[ii] == -1:
                    edgesToTravel.pop(ii)
                else:
                    ii += 1

            #Delete streak
            routeStreaks[maxRoute] = -1

        return routePerEdge
    
    def get_travel_time(self, travelPath):

        sumTime = 0

        for edge in travelPath:
            sumTime += self.get_weight(edge[0], edge[1])

        return sumTime
    
    def get_travel_route_details(self, fromStop, toStop):

        #Get real
        fromStop = self.get_duplicate_if_duplicate(fromStop)
        toStop = self.get_duplicate_if_duplicate(toStop)

        shortestPath = self.get_shortest_travel_path(fromStop, toStop)
        edges = shortestPath.keys()
        time = self.get_travel_time(edges)

        d = {}
        d['routePaths'] = shortestPath
        d['time'] = seconds_to_time_elapsed(time)

        return d

def name_is_duplicate(stopNamesToId, stop_name):
    return stopNamesToId.get(stop_name, None) == None

#https://stackoverflow.com/questions/61488790/how-can-i-proportionally-mix-colors-in-python
def combine_hex_values(d):
    d_items = sorted(d.items())
    tot_weight = sum(d.values())
    red = int(sum([int(k[:2], 16)*v for k, v in d_items])/tot_weight)
    green = int(sum([int(k[2:4], 16)*v for k, v in d_items])/tot_weight)
    blue = int(sum([int(k[4:6], 16)*v for k, v in d_items])/tot_weight)
    zpad = lambda x: x if len(x)==2 else '0' + x
    return zpad(hex(red)[2:]) + zpad(hex(green)[2:]) + zpad(hex(blue)[2:])

def generate_transit_graph(tripCountLimit = -1):
        
    G = Graph()

    #Generate Cities
    cityOrgData = []
    with open('input_data_scripts/cities.json', 'r') as f:
        cityOrgData = json.load(f);
    
        for city in cityOrgData:

            name = city['name']
            pos = city['coords']

            del city['name']
            del city['coords']

            city['my_hub_stop'] = None;
            city['lat'] = pos[0]
            city['lon'] = pos[1]

            G.set_city_data(name, city)

    #
    #
    #

    with open('input_data_scripts/in_GTFS/stops.txt', 'r') as f:



        # Drop Heading Line
        line = f.readline();
        line = f.readline().strip();

        stopNamesToId = {}
        
        #Loop
        while line != '':

            stop_id,stop_name,stop_lat,stop_lon,zone_id,stop_url,location_type,parent_station,wheelchair_boarding,stop_code = line.split(',')
            stopNode = Node(stop_id, stop_name, stop_lat, stop_lon,zone_id,stop_url,location_type,parent_station,wheelchair_boarding,stop_code)

            # Rename GO BUS, Keep them the same station
            if ("GO Bus" in stop_name):
                stop_name = stop_name.replace(" Bus", "")

            #Check if same named stop
            if stopNamesToId.get(stop_name, None) == None:
                stopNamesToId[stop_name] = stop_id
                G.add_node(stopNode)
            else:
                diff = 0.03
                sameNameId = stopNamesToId[stop_name];
                other = G.get_node(sameNameId)
                latDist = abs(stopNode.lat - other.lat)
                lonDist = abs(stopNode.lon - other.lon)

                if (latDist < diff and lonDist < diff):

                    #Store as a duplicate
                    G.store_stop_as_duplicate(stop_id, sameNameId)

                else:
                    #Too Far, Keep Seperate
                    G.add_node(stopNode)

            #Store as City Name
            if (" GO" == stop_name[-3:]):
                cityName = stop_name.replace(" GO", "")
                replaceName = stopNamesToId[stop_name];
                G.set_city_stop(cityName, replaceName);

            #Continue
            line = f.readline().strip();

        # Done, Generated Nodes
    COT = {}
    with open('input_data_scripts/color_switch.json', 'r') as f:
        COT = json.load(f);

    #
    #Generate Routes
    with open('input_data_scripts/in_GTFS/routes.txt', 'r') as f:
         # Drop Heading Line
        line = f.readline();
        line = f.readline().strip();

        while line != '':

            route_id,agency_id,route_short_name,route_long_name,route_type,route_color,route_text_color = line.split(',')
            col = COT[route_color];

            if (route_type == '2'): #Train
                col = combine_hex_values({col: 1.0, "ffffff": 0.2})

            route = Route(route_id,agency_id,route_short_name,route_long_name,route_type,col,route_text_color);
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
        tripCount = 0;
        print('Starting Trip 0...')

        #Loop
        while (line != '' and (tripCount < tripCountLimit or tripCountLimit == -1)):

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
                timeElapsed = abs(lastTrip.arrival_time - trip.arrival_time)
                
                route_id = trip.get_route_long_id();

                lastNode = lastTrip.stop_id
                thisNode = trip.stop_id

                G.add_edge(lastNode, thisNode, route_id, timeElapsed)

            #Store
            lastTrip = trip

            #Continue
            line = f.readline().strip();

            #Debug
            tripCount += 1
            if (tripCount % 100000 == 0):
                print(f"{tripCount} trips processed")

        #
        # Clean Routes
        #

    #
    # Add Constant Walking Edges
    #
    G.add_walking_edge("UN", "02300", 600) #10 minute walk

    #Set City Stops, Force
    G.set_city_stop('Toronto', 'UN');
    G.set_city_stop('Mississagua', '00133');

    G.clean_routes()

    # Print Adj List
    return G
    

if __name__ == '__main__':
    G = generate_transit_graph()
    export_g(G)