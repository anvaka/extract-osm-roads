/**
 * Uses https://wiki.openstreetmap.org/wiki/Nominatim API to fetch
 * area id, and then downloads all nodes/edges inside the are through
 * https://wiki.openstreetmap.org/wiki/Overpass_turbo
 */
var query_overpass = require('./lib/query-op.js');
var request = require('request');

var searchQuery = process.argv[2];

if (!searchQuery) {
  console.error('Please pass the search query for the area');
  process.exit(1);
}

let highwayTags = [
  'motorway',
  'motorway_link',
  'trunk',
  'trunk_link',
  'primary',
  'primary_link',
  'secondary',
  'secondary_link',
  'tertiary',
  'tertiary_link',
  'unclassified',
  'unclassified_link',
  'residential',
  'residential_link',
  'service',
  'service_link',
  'living_street',
  'pedestrian',
  'road'
].join('|');

if (searchQuery[0] !== '"') searchQuery = `"${searchQuery}"`;

// First step - find area id of required city;
console.warn('Searching for area ', searchQuery);
fetchAreaIdForQuery(searchQuery).then(runOSM).catch(e => console.log(e));

function runOSM(area) {
  let roadFilter = `["highway"~"${highwayTags}"]`;
  let query = `
area(${area});
(._; )->.area;
(
way${roadFilter}(area.area);
node(w);
);
out skel;`

  return query_overpass(query).then(print)
}

function print(res) {
  console.log(res);
  console.warn('')
  console.warn('All done. Now run: ')
  console.warn('')
  console.warn('node 1.save-roads-graph.js data/[your .json file]')
  console.warn('')
  console.warn('To save the graph.')
}

function fetchAreaIdForQuery(searchQuery) {
  return new Promise((resolve, reject) => {
    let options = {
      headers: { 
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36'
      },
    };
    request(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`, options,
      function (error, response, body) {
        if (error) {
          reject(error);
          return;
        }
        let nominatimResponse = JSON.parse(body);
        if (nominatimResponse.length === 0) {
          reject('No matches for ' + searchQuery);
          return;
        }
        let mainMatch = nominatimResponse[0];
        console.warn('Found: ' + mainMatch.display_name);
        let osmID = 1 * mainMatch.osm_id;
        if ('relation' === mainMatch.osm_type) {
          osmID += 36e8;
        } else if ( 'way' == mainMatch.osm_type) {
          osmID += 24e8;
        } else {
          reject('unknown osm type: ' + mainMatch.osm_type);
          return;
        }

        resolve(osmID);
    });
  });
}