package com.map.every.mapper;

import java.util.HashMap;
import java.util.Map;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface GisMapper {
    HashMap<String, Object> selectShortestPath(Map<String, Object> paramMap);
}
