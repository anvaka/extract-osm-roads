## OSM Scripts

Just a collection of scripts that I sometimes use to extract graphs from Open Street Maps.

## Usage

Install npm modules (once):

```
npm install
```

To download JSON file with all roads in the area that matches your search query:

```
node 0.download-city-roads Bellevue > data/bellevue.json
```

To convert it to binary format of a graph:

```
node 1.save-roads-graph.js data/bellevue.json
```

The graph will be saved in a binary format that is described here: 

https://github.com/anvaka/ngraph.path.demo#storing-a-graph