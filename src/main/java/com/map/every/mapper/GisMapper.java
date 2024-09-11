package com.map.every.mapper;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface GisMapper {
    HashMap<String, Object> selectShortestPath(List<HashMap<String, Object>> paramMap);
    List<HashMap<String, Object>> selectShortestPathLineList(List<HashMap<String, Object>> paramMap);
    List<HashMap<String, Object>> selectObstaclePOIInRoute(Map<String, Object> paramMap);
    List<HashMap<String, Object>> selectFloatingPopHeatmapPoints(Map<String, Object> paramMap);
    List<HashMap<String, Object>> selectFloatingPopStatInRoute(Map<String, Object> paramMap);

    List<HashMap<String, Object>> selectPathToLink(Map<String, Object> paramMap);

    List<HashMap<String, Object>> selectMetPath(List<HashMap<String, Object>> paramMap);

    List<HashMap<String, Object>> selectSafetyPath(List<HashMap<String, Object>> paramMap);

    List<HashMap<String, Object>> selectAstarSafetyPath(List<HashMap<String, Object>> paramMap);

    List<HashMap<String, Object>> selectAstarMetPath(List<HashMap<String, Object>> paramMap);

    List<HashMap<String, Object>> selectAstarShortestPath(List<HashMap<String, Object>> paramMap);
    List<HashMap<String, Object>> selectSafetyPathLineListWithPop(Map<String, Object> paramMap);
    List<HashMap<String, Object>> selectMetPathLineListWithPop(Map<String, Object> paramMap);
    List<HashMap<String, Object>> selectShortestPathLineListWithPop(Map<String, Object> paramMap);
}
