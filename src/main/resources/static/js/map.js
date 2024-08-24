const wktFormatter = new ol.format.WKT();

let vectorSource = new ol.source.Vector()
const vectorLayer = new ol.layer.Vector({
  source : vectorSource,
})
const map = new ol.Map({
  view: new ol.View({
    projection : 'EPSG:4326',
    center: [126.98653675016352, 37.48199882817191],
    extent : [125.01266399672463, 32.26999548234554, 132.32723839911958, 39.69721733446938],
    zoom: 17,
  }),
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM({
        attributions : false
      }),
    }),
    vectorLayer
  ],
  target: 'map',
});

let pointArr =[];
map.on('click', function(e){
  pointArr.length === 0 ? vectorSource.clear() : '';
  pointArr.push(e.coordinate);
  addPoint(e.coordinate);

  if(pointArr.length >= 2){
    showLodingImg();
    fetchShortestPath(pointArr[0], pointArr[pointArr.length-1])
      .then(value => {
        hideLodingImg();
        pointArr=[];
        addRouteOnMap(value.route);
      });
  }
});

function addRouteOnMap(route){
  const routeGeom = wktFormatter.readFeature(route).getGeometry();
  const feature = new ol.Feature({
    geometry: routeGeom
  });
  feature.setStyle(
    new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: '#Ff0000',
        width: 5,
      })
    })
  );
  vectorSource.addFeature(feature);
}

function addPoint(coord){
  const pointFeature = new ol.Feature({
    geometry: new ol.geom.Point(coord),
  });
  pointFeature.setStyle(
      [
        new ol.style.Style({
          image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
              color: '#0099FF',
            }),
        })})
      ]
  );
  vectorSource.addFeature(pointFeature);
}

function fetchShortestPath(startCoord, endCoord){
  const params = new URLSearchParams({
    startCoord : convertCoordinateToWKTFormat(startCoord),
    endCoord : convertCoordinateToWKTFormat(endCoord),
  })
  return fetch(`/api/getShortestPath?${params.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((response) => response.json());
}

function convertCoordinateToWKTFormat(coord){
  const point = new ol.geom.Point(coord);
  return wktFormatter.writeGeometry(point);
}
