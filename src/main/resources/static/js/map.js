const wktFormatter = new ol.format.WKT();

// const baseLayer = new ol.layer.Tile({ //타일 생성
//   title : 'Vworld Map', //이름
//   visible : true, //보여짐 여부
//   type : 'base', //지도 종류(일반) ---(야간(midnight), 위성(satellite) 등)
//   source : new ol.source.XYZ({ //vworld api 사용
//     url : 'http://api.vworld.kr/req/wmts/1.0.0/5E8B79D4-972E-3C82-A9A6-74272B88643F/Base/{z}/{y}/{x}.png'
//   })
// });
let vectorSource = new ol.source.Vector();
const vectorLayer = new ol.layer.Vector({
  source : vectorSource,
});
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
function addPointOnMap(e){
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
}

map.on('click', addPointOnMap);

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

let isRoadviewMode = false;
const rvbtn = document.getElementById('road-view-btn');
rvbtn.addEventListener("click", onClickRoadviewBtn);

const roadviewSource = new ol.source.Vector();
const roadviewLayer = new ol.layer.Vector({
  source : roadviewSource,
});
const roadviewPoint = new ol.Feature({
  geometry: new ol.geom.Point(0,0),
});
roadviewPoint.setStyle([
  new ol.style.Style({
    image: new ol.style.Icon({
      anchor: [0.3, 60],
      anchorXUnits: 'fraction',
      anchorYUnits: 'pixels',
      src: '/image/camera.png',
    }),
  })
]);
function movePointerWithFeature(e){
  roadviewPoint.getGeometry().setCoordinates(e.coordinate);
}
function showRoadview(e){
  closeRoadviewMode();
  const roadviewPosition = new kakao.maps.LatLng(e.coordinate[1], e.coordinate[0]);
  roadviewClient.getNearestPanoId(roadviewPosition, 50, function(panoId) {
    roadview.setPanoId(panoId, roadviewPosition);
  });
}
function closeRoadviewMode(){
  isRoadviewMode = false;
  roadviewModal.style.zIndex = '2';
  map.on('click', addPointOnMap);
  roadviewSource.clear();
  map.removeLayer(roadviewLayer);
}
function onClickRoadviewBtn(){
  isRoadviewMode = !isRoadviewMode;
  if(isRoadviewMode){
    roadviewPoint.getGeometry().setCoordinates(0.0);
    roadviewSource.addFeature(roadviewPoint);
    map.addLayer(roadviewLayer);
    map.on('pointermove', movePointerWithFeature);
    map.un('click', addPointOnMap);
    map.once('click', showRoadview);
  }else{
    closeRoadviewMode();
  }
}

const roadviewModal = document.querySelector('#roadview-modal');
const roadviewTarget = document.querySelector('#roadview-target');
const closeRoadviewBtn = document.querySelector('#close-roadview');
closeRoadviewBtn.addEventListener('click', function(){
  roadviewModal.style.zIndex = '-1';
});

const roadview = new kakao.maps.Roadview(roadviewTarget);
const roadviewClient = new kakao.maps.RoadviewClient();
