package com.map.every.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.locationtech.jts.io.ParseException;

public interface GisService {
    HashMap<String,Object> getShortestPath(Map<String, Object> paramMap);
    List<HashMap<String, Object>> getShortestPathLineList(Map<String, Object> paramMap);
    List<HashMap<String, Object>> getObstaclePOIInRoute(Map<String, Object> paramMap);
    String mergeLinestringList(List<HashMap<String, Object>> linestringList) throws ParseException;
    List<HashMap<String, Object>> getFloatingPopHeatmapPoints(Map<String, Object> paramMap);
}
