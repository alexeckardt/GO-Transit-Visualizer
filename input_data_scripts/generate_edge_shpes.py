import re;

#Modify to meet GTFS Data
trip_headsign_format = "([\d\w]*) - [^,]*"; #Found in trips.txt
repeatsUntilAssumedFinished = 1000; # Takes X failed attempts to add to dictionary of trips until we assume we hit all routes

class System():
    pass


def line_to_dict(keys, line):

    ret = {}

    data = line.split(',')
    for i in range(len(keys)):
        key = keys[i]
        dat = data[i]
        ret[key] = dat

    return ret;

def get_route_identifier(headsign_text):
    match = re.match(trip_headsign_format, headsign_text);
    return match.groups()[0]

def generate_edge_shapes():
        
    
    with open('input_data_scripts/in_GTFS/trips.txt', 'r') as f:

        trips = {}

        # Drop Heading Line
        line = f.readline().strip();
        keys=''.join(filter(lambda x: ord(x)<128,line)).split(','); # Delete garbage

        subsequentRepeats = 0
        

        #Loop
        while line != '':
            #Next Line
            line = f.readline().strip();
            tripInfo = line_to_dict(keys, line)

            #
            #ASSUMPTION!!!! Trip Short Name + Direction detemines the shape id, that's it.
            routeType = get_route_identifier(tripInfo['trip_headsign'])
            direction = tripInfo['direction_id']
            shape = tripInfo['shape_id']

            # See If We've already filled this information
            key = f"{routeType}:{direction}";
            if (trips.get(key, None) != None):

                subsequentRepeats += 1
                if (subsequentRepeats>repeatsUntilAssumedFinished):
                    break;

            else:
                # New Data!!
                subsequentRepeats = 0;

                # Add To Data
                data = {}
                data['shape_id'] = shape

                #Store
                trips[key] = data


if __name__ == '__main__':
    generate_edge_shapes();
