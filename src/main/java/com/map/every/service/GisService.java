package com.map.every.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.locationtech.jts.io.ParseException;

public interface GisService {
    HashMap<String,Object> getShortestPath(List<HashMap<String, Object>> paramMap);
    List<HashMap<String, Object>> getShortestPathLineList(List<HashMap<String, Object>> paramMap);
    List<HashMap<String, Object>> getObstaclePOIInRoute(Map<String, Object> paramMap);
    String mergeLinestringList(List<HashMap<String, Object>> linestringList) throws ParseException;
    Double sumLinkLength(List<HashMap<String, Object>> linestringList);
    List<HashMap<String, Object>> getFloatingPopHeatmapPoints(Map<String, Object> paramMap);
    List<HashMap<String, Object>> getFloatingPopStatInRoute(Map<String, Object> paramMap);
    List<HashMap<String, Object>> getPathToLink(Map<String, Object> paramMap);
    List<HashMap<String, Object>> getMetPathLineList(List<HashMap<String, Object>> paramMap);

    List<HashMap<String, Object>> getSafetyPathLineList(List<HashMap<String, Object>> paramMap);

    List<HashMap<String, Object>> getAstarSafetyPathLineList(List<HashMap<String, Object>> paramMap);

    List<HashMap<String, Object>> getAstarMetPathLineList(List<HashMap<String, Object>> paramMap);

    List<HashMap<String, Object>> getAstarShortestPathLineList(List<HashMap<String, Object>> paramMap);
}
