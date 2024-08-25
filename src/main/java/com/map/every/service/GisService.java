package com.map.every.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public interface GisService {
    HashMap<String,Object> getShortestPath(Map<String, Object> paramMap);
    List<HashMap<String, Object>> getObstaclePOIInRoute(Map<String, Object> paramMap);
}
