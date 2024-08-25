package com.map.every.service.impl;

import com.map.every.mapper.GisMapper;
import com.map.every.service.GisService;
import jakarta.annotation.Resource;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class GisServiceImpl implements GisService {

    @Resource
    GisMapper gisDAO;

    @Override
    public HashMap<String, Object> getShortestPath(Map<String, Object> paramMap) {
        return gisDAO.selectShortestPath(paramMap);
    }

    @Override
    public List<HashMap<String, Object>> getObstaclePOIInRoute(Map<String, Object> paramMap) {
        return gisDAO.selectObstaclePOIInRoute(paramMap);
    }
}
