function fetchShortestPath(startCoord, endCoord, method){
  const params = new URLSearchParams({
    startCoord : convertCoordinateToWKTFormat(startCoord),
    endCoord : convertCoordinateToWKTFormat(endCoord),
    weekday : new Date().getDay(),
    time : new Date().getHours()
  })
  return fetch(`/api/getShortestPath/${method}?${params.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((response) => response.json());
}

function fetchAiPathSummarization(param){
  if(!param) return;
  return fetch(`/api/ai/pathSummarization`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(param)
  }).then((response) => response.json())
}

function fetchFlowPopStat(route, weekday){
  return fetch(`/api/getFloatingPopStat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      weekday,
      route
    })
  }).then((response) => response.json())
}

function fetchAstarShortestPath(startCoord, endCoord, method){
  const params = new URLSearchParams({
    startCoord : convertCoordinateToWKTFormat(startCoord),
    endCoord : convertCoordinateToWKTFormat(endCoord),
    weekday : new Date().getDay(),
    time : new Date().getHours()
  })
  return fetch(`/api/getAstarShortestPath/${method}?${params.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((response) => response.json());
}
