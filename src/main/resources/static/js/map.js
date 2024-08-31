let routeInfo ={};

const wktFormatter = new ol.format.WKT();

const baseLayer = new ol.layer.Tile({ //타일 생성
  title : 'Vworld Map', //이름
  visible : true, //보여짐 여부
  type : 'base', //지도 종류(일반) ---(야간(midnight), 위성(satellite) 등)
  source : new ol.source.XYZ({ //vworld api 사용
    url : `http://api.vworld.kr/req/wmts/1.0.0/${vworldKey}/Base/{z}/{y}/{x}.png`
  })
});

const heamapSource = new ol.source.Vector();
const heatmapLayer = new ol.layer.Heatmap({
  source : heamapSource,
  weight: function (feature) {
    return feature.get('weight');
  },
});
const vectorSource = new ol.source.Vector();
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
    // new ol.layer.Tile({
    //   source: new ol.source.OSM({
    //     attributions : false
    //   }),
    // }),
    baseLayer,
    heatmapLayer,
    vectorLayer
  ],
  target: 'map',
});

let pointArr =[];
function addPointOnMap(e){
  if(pointArr.length === 0){
    vectorSource.clear();
    heamapSource.clear();

  };
  pointArr.push(e.coordinate);
  addPoint(e.coordinate);

  if(pointArr.length >= 2){
    showLodingImg();
    fetchShortestPath(pointArr[0], pointArr[pointArr.length-1])
    .then(value => {
      hideLodingImg();
      pointArr=[];
      routeInfo=value;
      addRouteOnMap(value.route);
      addObstaclePOIOnMap(value.obstaclePoiList);
      addHeatmapPoint(value.heatmapPointList);
      fetchFlowPopStat(value.route);
    });
  }
}

function addHeatmapPoint(heatmapPointList){
  heamapSource.clear();
  for(const poi of heatmapPointList) {
    const pointFeature = new ol.Feature({
      geometry: wktFormatter.readFeature(poi.geom).getGeometry(),
      weight:poi.total_pop
    });
    heamapSource.addFeature(pointFeature);
  }
}

map.on('click', mapClickEvt);
const overlayDom = document.createElement("div");
overlayDom.className = "overlay";
let overlay;
function mapClickEvt(e){
  if(overlay){
    map.removeOverlay(overlay);
    overlay=null;
    return;
  }

  vectorLayer.getFeatures(e.pixel).then(function (features) {
    const feature = features.length ? features[0] : undefined;
    if(feature && feature.getProperties().poiInfo){
      const poiInfo = feature.getProperties().poiInfo;
      overlayDom.innerHTML ='';
      for(const key in poiInfo){
        overlayDom.innerHTML += `${key} : ${poiInfo[key]}` + '<br>';
      }

      overlay = new ol.Overlay({
        element: overlayDom,
        positioning : 'bottom-center'
      });

      overlay.setPosition(feature.getGeometry().getCoordinates());
      map.addOverlay(overlay);
    }else{
      addPointOnMap(e);
    }
  })
}


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

function addObstaclePOIOnMap(obstaclePoiList){
  for(const poi of obstaclePoiList) {
    const pointFeature = new ol.Feature({
      geometry: wktFormatter.readFeature(poi.geom).getGeometry(),
    });

    pointFeature.setProperties({'poiInfo': poi});
    pointFeature.setStyle(
        [
          new ol.style.Style({
            image: new ol.style.Circle({
              radius: 6,
              fill: new ol.style.Fill({
                color: stringToColour(poi.category),
              }),
            })
          })
        ]
    );
    vectorSource.addFeature(pointFeature);
  }
}

function stringToColour(str) {
  let hash = 0;
  str.split('').forEach(char => {
    hash = char.charCodeAt(0) + ((hash << 5) - hash)
  })
  let colour = '#'
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff
    colour += value.toString(16).padStart(2, '0')
  }
  return colour
}

function fetchShortestPath(startCoord, endCoord){
  const params = new URLSearchParams({
    startCoord : convertCoordinateToWKTFormat(startCoord),
    endCoord : convertCoordinateToWKTFormat(endCoord),
    weekday : 5,
    time : new Date().getHours()
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
    map.un('click', mapClickEvt);
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

function fetchFlowPopStat(route){
  return fetch(`/api/getFloatingPopStat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      weekday : 5,
      route
    })
  }).then((response) => response.json())
  .then(result =>{
    makeFlowPopChart(result.floatingPopStat);
  });
}


const chartDiv = document.getElementById("chart");





function makeFlowPopChart(floatingPopStat){
  new Chart(chartDiv, {
    type: 'line',
    data: {
      labels: floatingPopStat.map(item => item.time),
      datasets: [{
        label: '경로상의 평균 유동인구',
        data: floatingPopStat.map(item => item.avg),
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

