import json
import re;
from generate_stop_nodes import generate_transit_graph;

#Modify to meet GTFS Data
trip_headsign_format = "([\d\w]*) - [^,]*"; #Found in trips.txt
repeatsUntilAssumedFinished = 1000; # Takes X failed attempts to add to dictionary of trips until we assume we hit all routes

#
#
#
#

class System():
    pass

#
#
#
#
class ShapeHolder():
    def __init__(self):
        self.shapes = {}

    def add_point_to_shape(self, shapeid, lat, lon):

        #Fill If Empty
        if (self.shapes.get(shapeid, None) == None):
            self.shapes[shapeid] = []

        #Add
        self.shapes[shapeid].append({"lat":lat, 'lon':lon})
        return

    def get_shape(self, shape_id):
        return self.shapes[shape_id]

    def as_dict(self):
        return self.shapes;


#
#
#
# Helper
#

def line_to_dict(keys, line):

    ret = {}
    data = line.split(',')

    for i in range(len(keys)):
        try:
            key = keys[i]
            dat = data[i]
            ret[key] = dat
        except:
            k = keys[i]
            strr = f"Did not find pair for i={i}, meaning key={k}"
            raise Exception(strr)

    return ret;

def get_route_identifier(headsign_text):
    match = re.match(trip_headsign_format, headsign_text);
    return match.groups()[0]

def get_routedir_from_trip_id(trips, trip_id):
    base = trip_id.split("-")[0]

    dirkey = base+":0"
    routeInfo = trips.get(dirkey, None)
    if (routeInfo != None):
        listCheck = routeInfo['trip_ids']
        if trip_id in listCheck:
            return dirkey
    
    dirkey = base+":1"
    routeInfo = trips.get(dirkey, None)
    if (routeInfo != None):
        listCheck = routeInfo['trip_ids']
        if trip_id in listCheck:
            return dirkey
    
    return None
    
def get_route_shape(G, trips, shapes, route, edge):
    if route == None:
        return None
    
    # Route ID Exists
    shape_id = trips[route]['shape_id']
    shapeList = shapes.get_shape(shape_id)

    fromFrom = True #In case it's backwards, i don't really know
    store = False

    fromm = G.get_node(edge[0])
    too = G.get_node(edge[1])

    fromlat = fromm.lat
    fromlon = fromm.lon
    tolat = too.lat
    tolon = too.lon

    accuracy = 0.005 # accuracy, starts / end in range

    shape = []

    #Parse
    for shapePoint in shapeList:

        pointlat = float(shapePoint['lat'])
        pointlon = float(shapePoint['lon'])

        if not store:
            if abs(pointlat - fromlat) < accuracy and abs(pointlon - fromlon) < accuracy:
                #START!!
                fromFrom = True
                store = True
                shape.append([fromlat, fromlon])
            elif abs(pointlat - tolat) < accuracy and abs(pointlon - tolon) < accuracy:
                #START!!
                fromFrom = False
                store = True
                shape.append([tolat, tolon])

        else:
            
            #Not Ended
            shape.append([pointlat, pointlon])

            # END!!
            if fromFrom:
                if abs(pointlat - tolat) < accuracy and abs(pointlon - tolon) < accuracy:
                    #END
                    shape.append([tolat, tolon])
                    break
            if not fromFrom:
                if abs(pointlat - fromlat) < accuracy and abs(pointlon - fromlon) < accuracy:
                    #END
                    shape.append([tolat, tolon])
                    #Reverse
                    shape.reverse()
                    break

    return shape



def generate_edge_shapes():
        
    #
    # Generate Route & Shape Ids
    with open('input_data_scripts/in_GTFS/trips.txt', 'r') as f:

        trips = {}

        # Drop Heading Line
        line = f.readline().strip();
        keys=''.join(filter(lambda x: ord(x)<128,line)).split(','); # Delete garbage
        print(keys)
        
        

        #Loop
        line = f.readline().strip();
        lC = 0
        while line != '':
            #Next Line
            tripInfo = line_to_dict(keys, line)

            #
            #ASSUMPTION!!!! Trip Short Name + Direction detemines the shape id, that's it.
            routeType = get_route_identifier(tripInfo['trip_headsign'])
            direction = tripInfo['direction_id']
            shape = tripInfo['shape_id']
            trip_id = tripInfo['trip_id'][9::] #remove the date

            # See If We've already filled this information
            key = f"{routeType}:{direction}";
            if (trips.get(key, None) != None):
                trips[key]['trip_ids'].append(trip_id)

                subsequentRepeats += 1
                if (subsequentRepeats>repeatsUntilAssumedFinished):
                    pass
                    #break;
            else:
                # New Data!!
                subsequentRepeats = 0;

                # Add To Data
                data = {}
                data['shape_id'] = shape
                data['trip_ids'] = [trip_id]

                #Store
                trips[key] = data

            #Next
            line = f.readline().strip();
            lC += 1
            if (lC % 10000 == True):
                print(lC)

    #
    #Create Route Shapes
    shapes = ShapeHolder()
    with open('input_data_scripts/in_GTFS/shapes.txt', 'r') as f:
        line = f.readline().strip();
        keys=''.join(filter(lambda x: ord(x)<128,line)).split(','); # Delete garbage
        print(keys)

        line = f.readline().strip();
        while line != '':

            #Get Info
            info = line.split(',')

            #Store
            shapes.add_point_to_shape(info[0], info[1], info[2])

            #Done!!
            line = f.readline().strip();

    # Generate Graph
    G = generate_transit_graph(-1);

    edgeShapes = {}

    print(len(G.weights))
    count = 0
    for edge in G.weights:

        #Edge is the ID
        allRoutesOnEdge = G.get_routes_that_travel_edge(edge)

        #Loop
        viableSubroutes = []

        for routeAbstractId in allRoutesOnEdge:
            route = G.get_route(routeAbstractId)

            #Get Subroute with edge in it
            for subroute in route.subroute_paths:
                if (edge in route.subroute_paths[subroute]):
                    viableSubroutes.append(subroute)

        # Get Route+Direction from trip ids
        routeShapesToCheck = {}
        for viableSubroute in viableSubroutes:
            realId = get_routedir_from_trip_id(trips, viableSubroute)
            routeShapesToCheck[realId]=1

        for routeId in routeShapesToCheck:
            shapee = get_route_shape(G, trips, shapes, routeId, edge)
            if shapee != None:
                edgeShapes[str(edge)] = shapee
                break;
    
        count += 1
        if (count % 200 == 0):
            print(count)

    hi = True

    # Export All this data
    with open('./Visual/Source/edge_shapes.json', 'w') as f:
          strr = json.dumps(edgeShapes, indent=4)
          f.write(strr)




if __name__ == '__main__':
    generate_edge_shapes();
