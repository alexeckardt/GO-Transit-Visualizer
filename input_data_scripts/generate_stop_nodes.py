
class Node:
    def __init__(self, name):
        self.name = name

    def __repr__(self):
        return self.name


with open('input_data_scripts/in_GTFS/stops.txt', 'r') as f:

    stops = {}

    # Drop Heading Line
    line = f.readline();
    line = f.readline().strip();

    #Loop
    while line != '':

        stop_id,stop_name,stop_lat,stop_lon,zone_id,stop_url,location_type,parent_station,wheelchair_boarding,stop_code = line.split(',')
        stopNode = Node(stop_name)

        stops[stop_id] = stopNode;

        #Continue
        line = f.readline().strip();

    # Done, Generated Nodes

    print(stops)
