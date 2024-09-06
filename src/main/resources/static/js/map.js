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

function clearWindow(){
  vectorSource.clear();
  heamapSource.clear();
  routeInfo={};
  if(popChart){
    popChart.destroy();
  }
}

let pointArr =[];
async function addPointOnMap(e){
  if(pointArr.length === 0){
    clearWindow();
  }
  pointArr.push(e.coordinate);
  addStartEndPoint(e.coordinate);

  if(pointArr.length >= 2){
    showLodingImg();
    routeInfo= await fetchShortestPath(pointArr[0], pointArr[pointArr.length-1])
    hideLodingImg();
    pointArr=[];
    addRouteOnMap(routeInfo.lsList);
    addObstaclePOIOnMap(routeInfo.obstaclePoiList);
    addHeatmapPoint(routeInfo.heatmapPointList);
    addPathSummerization();
    addActiveClassOnBtnUsingWeekDay(new Date().getDay());
    await showFlowPopChart(routeInfo.route, new Date().getDay());
  }
}

function addPathSummerization(){
  addLoadingChatCard();
  fetchAiPathSummarization(makePromptParam()).then(result=>{
    deleteLoadingChatCard();
    addNewChatCard(result.pathInfo);
  });
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


function addRouteOnMap(lsList){
  lsList.forEach((item, i)=>{
    const routeGeom = wktFormatter.readFeature(item.wktgeom).getGeometry();
    const feature = new ol.Feature({
      geometry: routeGeom
    });
    let color;
    if(item.slope_max > 6){
      color = '#Ff0000';
    }else if (item.slope_max > 3){
      color = '#ff8400';
    }else{
      color = '#55ff00';
    }
    feature.setStyle(
        new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: color,
            width: 5,
          })
        })
    );
    vectorSource.addFeature(feature);
  })
}

function addStartEndPoint(coord){
  const pointFeature = new ol.Feature({
    geometry: new ol.geom.Point(coord),
  });
  pointFeature.setStyle(
      [
        new ol.style.Style({
          image: new ol.style.Icon({
            color: pointArr.length === 1 ? '#44c565' : '#e53d5d',
            anchor: [0.5, 40],
            anchorXUnits: 'fraction',
            anchorYUnits: 'pixels',
            src: '/image/marker.svg',
          }),
          text: new ol.style.Text({
            text: pointArr.length === 1 ? '출발' : '도착',
            offsetY: -25,
            fill: new ol.style.Fill({
              color: '#FFF',
            })
          })
        })
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
  const current = popValues.reduce((a, b) => a + b, 0) / popValues.length;
  const quite = Math.min(...popValues);
  const crowded = Math.max(...popValues);
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
//roadview 끝
