
class Node:
    def __init__(self, stop_id, name):
        self.id = stop_id
        self.name = name

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

        # Print Adj List
        print(G)