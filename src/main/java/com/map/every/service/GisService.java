package com.map.every.service;

import java.util.HashMap;
import java.util.Map;

public interface GisService {
    HashMap<String,Object> getShortestPath(Map<String, Object> paramMap);
}
