package com.map.every.mapper;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface GisMapper {
    HashMap<String, Object> selectShortestPath(Map<String, Object> paramMap);
    List<HashMap<String, Object>> selectShortestPathLineList(Map<String, Object> paramMap);
    List<HashMap<String, Object>> selectObstaclePOIInRoute(Map<String, Object> paramMap);
    List<HashMap<String, Object>> selectFloatingPopHeatmapPoints(Map<String, Object> paramMap);
    List<HashMap<String, Object>> selectFloatingPopStatInRoute(Map<String, Object> paramMap);

    List<HashMap<String, Object>> selectPathToLink(Map<String, Object> paramMap);
}
