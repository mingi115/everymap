let routeInfo;
let safetyRouteInfo;
let metRouteInfo;
const wktFormatter = new ol.format.WKT();
const baseLayer = new ol.layer.Tile({ //타일 생성
  title : 'Vworld Map', //이름
  visible : true, //보여짐 여부
  type : 'base', //지도 종류(일반) ---(야간(midnight), 위성(satellite) 등)
  source : new ol.source.XYZ({ //vworld api 사용
    url : `http://api.vworld.kr/req/wmts/1.0.0/${vworldKey}/Base/{z}/{y}/{x}.png`
  })
});

const colors = [
  { min: 0.04, max: 0.1, color: '#FFFFFF80' },
  { min: 0.1, max: 0.5, color: '#FFEEEE80' },
  { min: 0.5, max: 2, color: '#FFCCCC80' },
  { min: 2, max: 5, color: '#FFAAAA80' },
  { min: 5, max: 20, color: '#FF888880' },
  { min: 20, max: 50, color: '#FF666680' },
  { min: 50, max: 200, color: '#FF444480' },
  { min: 200, max: 500, color: '#FF222280' },
  { min: 500, max: 2000, color: '#FF000080' },
  { min: 2000, max: 3945, color: '#CC000080' }
];

const styleFunction = (feature) => {
  const value = feature.get('population'); // feature의 인구 데이터 속성값
  let color = '#000000'; // 기본 색상 (데이터가 구간에 없을 경우)

  // 각 구간에 맞는 색상 찾기
  for (let i = 0; i < colors.length; i++) {
    if (value >= colors[i].min && value < colors[i].max) {
      color = colors[i].color;
      break;
    }
  }
  return new ol.style.Style({
    fill: new ol.style.Fill({
      color: color
    }),
  });
};
const heamapSource = new ol.source.Vector();
const heatmapLayer = new ol.layer.VectorImage({
  source : heamapSource,
  style : styleFunction
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
    baseLayer,
    heatmapLayer,
    vectorLayer
  ],
  target: 'map',
});

const rClickOverlay = new ol.Overlay({
  positioning: 'top-left',
  stopEvent: true
});
function makeRClickOverlayDom(){
  const overlayContainer = document.createElement('div');
  overlayContainer.className = 'ol-overlay-container';
  overlayContainer.style.background = 'white';
  const startMarker = document.createElement('div');
  startMarker.innerHTML = '<svg  fill="#44c565" width="15px" height="15px" viewBox="0 0 15 15" version="1.1" id="marker" xmlns="http://www.w3.org/2000/svg">\n'
      + '  <path d="M7.5,0C5.0676,0,2.2297,1.4865,2.2297,5.2703&#xA;&#x9;C2.2297,7.8378,6.2838,13.5135,7.5,15c1.0811-1.4865,5.2703-7.027,5.2703-9.7297C12.7703,1.4865,9.9324,0,7.5,0z"/>\n'
      + '</svg>'
  const startDiv = document.createElement('div');
  startDiv.appendChild(startMarker);
  startDiv.id = 'overlay-start-btn';
  startDiv.style.border = '1px solid black';
  startDiv.style.cursor = 'pointer';
  startDiv.style.display = 'flex';
  startDiv.innerHTML += '출발';
  const endMarker = document.createElement('div');
  endMarker.innerHTML = '<svg  fill="#e53d5d" width="15px" height="15px" viewBox="0 0 15 15" version="1.1" id="marker" xmlns="http://www.w3.org/2000/svg">\n'
      + '  <path d="M7.5,0C5.0676,0,2.2297,1.4865,2.2297,5.2703&#xA;&#x9;C2.2297,7.8378,6.2838,13.5135,7.5,15c1.0811-1.4865,5.2703-7.027,5.2703-9.7297C12.7703,1.4865,9.9324,0,7.5,0z"/>\n'
      + '</svg>'
  const endDiv = document.createElement('div');
  endDiv.id = 'overlay-end-btn';
  endDiv.appendChild(endMarker);
  endDiv.style.border = '1px solid black';
  endDiv.style.display = 'flex';
  endDiv.style.cursor = 'pointer';
  endDiv.innerHTML += '도착';
  overlayContainer.appendChild(startDiv);
  overlayContainer.appendChild(endDiv);

  return overlayContainer;
}
map.on('contextmenu', function(e){
  e.preventDefault();
  map.removeOverlay(rClickOverlay);
  rClickOverlay.setElement(makeRClickOverlayDom());
  const coordinate = e.coordinate;
  rClickOverlay.setPosition(coordinate);
  map.addOverlay(rClickOverlay);
  const startBtn = document.getElementById('overlay-start-btn');
  startBtn.addEventListener('click', ()=>addStartEndPoint(coordinate, true));
  const endBtn  = document.getElementById('overlay-end-btn');
  endBtn.addEventListener('click', ()=>addStartEndPoint(coordinate, false));
})
function clearWindow(){
  vectorSource.clear();
  heamapSource.clear();
  routeInfo=null;
  safetyRouteInfo=null;
  metRouteInfo=null;
  if(popChart){
    popChart.destroy();
  }
}

document.getElementById('find-route').addEventListener('click', async ()=>{
  document.getElementById('shortest-path-btn').click();
});
document.getElementById('shortest-path-btn').addEventListener('click', async (e)=>{
  await getRouteInfo('shortest');
  if(routeInfo){
    routeSelectEvt(e);
  }
});
document.getElementById('safety-path-btn').addEventListener('click', async (e)=>{
  await getRouteInfo('safety');
  if(safetyRouteInfo){
    routeSelectEvt(e);
  }
});
document.getElementById('met-path-btn').addEventListener('click', async (e)=>{
  await getRouteInfo('met');
  if(metRouteInfo){
    routeSelectEvt(e);
  }
});

function routeSelectEvt(e){
  document.querySelectorAll('.accordion-button').forEach(item =>{
    item.classList.add('collapsed');
  })
  document.querySelectorAll('.accordion-collapse').forEach(item =>{
    item.classList.add('collapse');
  })
  e.target.classList.remove('collapsed');
  e.target.parentNode.parentNode.lastElementChild.classList.remove('collapse');
}
async function getRouteInfo(method){
  if(!startPoint || !endPoint)  {
    alert('출발지와 도착지를 선택해 주세요.');
    return;
  }

  const startCoord = startPoint.getGeometry().getCoordinates();
  const endCoord = endPoint.getGeometry().getCoordinates();

  showLodingImg();
  if(method==='shortest'){
    routeInfo= routeInfo ? routeInfo : await fetchShortestPath(startCoord, endCoord, method)
    await fillRouteInfoUI(routeInfo);
    addPathSummerization('shortest');
  }else if (method==='safety'){
    safetyRouteInfo= safetyRouteInfo ? safetyRouteInfo : await fetchShortestPath(startCoord, endCoord, method)
    await fillRouteInfoUI(safetyRouteInfo);
    addPathSummerization('safety');
  }else if(method === 'met'){
    metRouteInfo= metRouteInfo ? metRouteInfo : await fetchShortestPath(startCoord, endCoord, method)
    await fillRouteInfoUI(metRouteInfo);
    addPathSummerization('met');
  }
  hideLodingImg();
}

async function fillRouteInfoUI(info){
  addRouteOnMap(info.lsList);
  addLinkToPath(info.pathToLink);
  addObstaclePOIOnMap(info.obstaclePoiList);
  addHeatmapPoint(info.heatmapPointList);

  addActiveClassOnBtnUsingWeekDay(new Date().getDay());
  await showFlowPopChart(info.route, new Date().getDay());
}


function addLinkToPath(pathToLink){
  pathToLink.forEach((item, i)=>{
    const routeGeom = wktFormatter.readFeature(item.path_to_link).getGeometry();
    const feature = new ol.Feature({
      geometry: routeGeom
    });
    feature.setStyle(
        new ol.style.Style({
          stroke: new ol.style.Stroke({
            lineDash : [0,0,0,10],
            color: '#7e7e7e',
            width: 5,
          })
        })
    );
    vectorSource.addFeature(feature);
  })
}

function addPathSummerization(method){
  addLoadingChatCard();
  const promptParam = makePromptParam();
  fetchAiPathSummarization(promptParam).then(result=>{
    deleteLoadingChatCard();
    addNewChatCard(result.pathInfo);
  });

  let targetInfoContent =document.getElementById(`${method}-info-content`);
  targetInfoContent.innerHTML = parsingPromptParam(promptParam);
}

async function showFlowPopChart(route, weekday){
  if(!route) return;
  if(popChart){
    popChart.destroy();
  }
  const result = await fetchFlowPopStat(route, weekday);
  makeFlowPopChart(result.floatingPopStat);
}

function addHeatmapPoint(heatmapPointList){
  heamapSource.clear();
  for(const poi of heatmapPointList) {
    const pointFeature = new ol.Feature({
      geometry: wktFormatter.readFeature(poi.geom).getGeometry(),
    });
    pointFeature.setProperties({'population': poi.total_pop});
    heamapSource.addFeature(pointFeature);
  }
}

map.on('click', mapClickEvt);
const overlayDom = document.createElement("div");
overlayDom.className = "overlay";
let overlay;
function mapClickEvt(e){
  map.removeOverlay(rClickOverlay);
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
    }
  })
}


function addRouteOnMap(lsList){
  const features = vectorSource.getFeatures();
  features.forEach(feat =>{
    if(feat.getGeometry().getType() === 'LineString'){
      vectorSource.removeFeature(feat);
    }
  })
  lsList.forEach((item, i)=>{
    const routeGeom = wktFormatter.readFeature(item.wktgeom).getGeometry();
    const feature = new ol.Feature({
      geometry: routeGeom
    });
    let color;
    if(item.slope_max > 6){
      color = '#Ff0000';
    }else if (item.slope_max > 3){
      color = '#ffa600';
    }else{
      color = '#55ff00';
    }
    feature.setStyle(
        [
          new ol.style.Style({
            stroke: new ol.style.Stroke({
              color: '#000',
              width: 6,
            })
          }),
          new ol.style.Style({
            stroke: new ol.style.Stroke({
              color: color,
              width: 5,
            })
          }),
        ]
    );
    vectorSource.addFeature(feature);
  })
}

let startPoint;
let endPoint;
function addStartEndPoint(coord, isStart){
  if(routeInfo) clearWindow();
  map.removeOverlay(rClickOverlay);
  if(isStart){
    vectorSource.removeFeature(startPoint);
    startPoint=null;
  }else{
    vectorSource.removeFeature(endPoint);
    endPoint=null;
  }
  const pointFeature = new ol.Feature({
    geometry: new ol.geom.Point(coord),
  });
  pointFeature.setStyle(
      [
        new ol.style.Style({
          image: new ol.style.Icon({
            color: isStart ? '#44c565' : '#e53d5d',
            anchor: [0.5, 40],
            anchorXUnits: 'fraction',
            anchorYUnits: 'pixels',
            src: '/image/marker.svg',
          }),
          text: new ol.style.Text({
            text: isStart ? '출발' : '도착',
            offsetY: -25,
            fill: new ol.style.Fill({
              color: '#FFF',
            })
          })
        })
      ]
  );
  vectorSource.addFeature(pointFeature);

  if(isStart){
    startPoint=pointFeature;
  }else{
    endPoint=pointFeature;
  }
}

function addObstaclePOIOnMap(obstaclePoiList){
  for(const poi of obstaclePoiList) {
    const pointFeature = new ol.Feature({
      geometry: wktFormatter.readFeature(poi.geom).getGeometry(),
    });

    pointFeature.setProperties({'poiInfo': poi});
    pointFeature.setStyle(makeObstaclePoiStyle(poi.category));
    vectorSource.addFeature(pointFeature);
  }
}

function makeObstaclePoiStyle(category){
  let style;
  if(category === '빗물받이'){
    style = new ol.style.Style({
      image: new ol.style.Icon({
        src: '/image/rain_gutter.png',
      })
    })
  }
  else if(category === '맨홀'){
    style = new ol.style.Style({
      image: new ol.style.Icon({
        src: '/image/manhole.png',
      })
    })
  }
  else if(category === '과속방지턱'){
    style = new ol.style.Style({
      image: new ol.style.Icon({
        src: '/image/speed_bump.png',
      })
    })
  }
  return style;
}

function convertCoordinateToWKTFormat(coord){
  const point = new ol.geom.Point(coord);
  return wktFormatter.writeGeometry(point);
}
addChartDayBtnEvt();
function addChartDayBtnEvt(){
  const btnList = document.querySelectorAll('.day-btn-grp > *');

  btnList.forEach((btn, index) => {
    btn.onclick = () => {
      showFlowPopChart(routeInfo.route, index);
      addActiveClassOnBtnUsingWeekDay(index);
    };
  })
}
function addActiveClassOnBtnUsingWeekDay(weekday){
  const btnList = document.querySelectorAll('.day-btn-grp > *');
  btnList.forEach(button => button.classList.remove('active'));
  btnList.item(weekday).classList.add('active');
}


const chartDiv = document.getElementById("chart");
let popChart;
function makeFlowPopChart(floatingPopStat){
  if(popChart){
    popChart.destroy();
  }
  const dataSeries = floatingPopStat.map(item => item.avg);
  const peakIndex = dataSeries.indexOf(Math.max(...dataSeries));

  popChart = new Chart(chartDiv, {
    type: 'line',
    data: {
      labels: floatingPopStat.map(item => item.time),
      datasets: [{
        label: '경로상의 평균 유동인구',
        data: dataSeries,
        borderWidth: 1,
        pointBackgroundColor: dataSeries.map((value, index) => index === peakIndex ? 'red' : 'rgba(54, 162, 235, 1)'),
        pointBorderColor: dataSeries.map((value, index) => index === peakIndex ? 'red' : 'rgba(54, 162, 235, 1)'),
        pointRadius: dataSeries.map((value, index) => index === peakIndex ? 6 : 3),
        pointHoverRadius: dataSeries.map((value, index) => index === peakIndex ? 8 : 5),
      }]
    },

    options: {
      scales: {
        y: {
          max: Math.max(...dataSeries) + 2,
          beginAtZero: false
        },
      },
      plugins: {
        annotation: {
          annotations: {
            label1: {
              type: 'label',
              xValue: peakIndex,
              yValue: dataSeries[peakIndex],
              backgroundColor: 'rgba(255, 99, 132, 0.8)',
              content: ['최고 인기 ' + peakIndex + '시'],
              enabled: true,
              position: 'top',
              yAdjust: -11,
              borderRadius: 4,
              font: {
                size: 10,
                weight: 'bold',
                color: '#fff'
              }
            }
          }
        },
      }
    }
  });
}
function makePromptParam(){
  const heatmapPointList = routeInfo.heatmapPointList;
  const popValues = heatmapPointList.map(item => item.total_pop);
  const current = (popValues.reduce((a, b) => a + b, 0) / popValues.length).toFixed(1);
  const quite = Math.min(...popValues).toFixed(1);
  const crowded = Math.max(...popValues).toFixed(1);
  const floating_population ={
    current, quite, crowded
  }

  //slope 정보
  const lsList = routeInfo.lsList;
  const slopeMinValues = lsList.map(item => item.slope_min);
  const slopeMedianValues = lsList.map(item => item.slope_median);
  const slopeMaxValues = lsList.map(item => item.slope_max);
  const avgSlopeMedian = slopeMedianValues.reduce((a, b) => a + b, 0) / slopeMedianValues.length;
  const minSlopeMin = Math.min(...slopeMinValues);
  const maxSlopeMax = Math.max(...slopeMaxValues);
  const slope ={
    'min':minSlopeMin,
    'max':maxSlopeMax,
    'avg': avgSlopeMedian,
    'safety_min': '4',
    'safety_max': '6'
  }

  const obstaclePoiList = routeInfo.obstaclePoiList;
  const obstacles = obstaclePoiList.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});

  return {
    floating_population, slope, obstacles
  };
}



//roadview 시작
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
//roadview 끝
