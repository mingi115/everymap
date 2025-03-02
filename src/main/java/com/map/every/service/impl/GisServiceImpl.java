package com.map.every.service.impl;

import com.map.every.mapper.GisMapper;
import com.map.every.service.GisService;
import jakarta.annotation.Resource;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.io.ParseException;
import org.locationtech.jts.io.WKTReader;
import org.locationtech.jts.operation.linemerge.LineMerger;
import org.springframework.stereotype.Service;


@Service
public class GisServiceImpl implements GisService {

    @Resource
    GisMapper gisDAO;

    @Override
    public HashMap<String, Object> getShortestPath(List<HashMap<String, Object>> paramMap) {
        return gisDAO.selectShortestPath(paramMap);
    }

    @Override
    public List<HashMap<String, Object>> getShortestPathLineList(List<HashMap<String, Object>> paramMap) {
        return gisDAO.selectShortestPathLineList(paramMap);
    }

    @Override
    public List<HashMap<String, Object>> getObstaclePOIInRoute(Map<String, Object> paramMap) {
        if(paramMap.get("route") != null && !paramMap.get("route").equals("")) {
            return gisDAO.selectObstaclePOIInRoute(paramMap);
        }else{
            return null;
        }
    }

    @Override
    public String mergeLinestringList(List<HashMap<String, Object>> linestringList)
        throws ParseException {
        GeometryFactory gf = new GeometryFactory();
        WKTReader wktReader = new WKTReader(gf);
        LineMerger lm = new LineMerger();

        for(HashMap<String, Object> ls: linestringList){
            lm.add(wktReader.read((String) ls.get("wktgeom")));
        }
        Collection mergedLs = lm.getMergedLineStrings();
        Iterator iterator = mergedLs.iterator();

        String result = "";
        while (iterator.hasNext()) {
            result = iterator.next().toString();
        }

        return result;
    }

    @Override
    public Double sumLinkLength(List<HashMap<String, Object>> linestringList) {
        if(!linestringList.isEmpty()){
            double result = 0.0;
            for(HashMap<String, Object> ls: linestringList){
                result+=(double) ls.get("link_len");
            }
            return result;
        }else{
            return null;
        }
    }

    @Override
    public List<HashMap<String, Object>> getFloatingPopHeatmapPoints(Map<String, Object> paramMap) {
        if(paramMap.get("route") != null && !paramMap.get("route").equals("")) {
            return gisDAO.selectFloatingPopHeatmapPoints(paramMap);
        }else{
            return null;
        }
    }

    @Override
    public List<HashMap<String, Object>> getFloatingPopStatInRoute(Map<String, Object> paramMap) {
        return gisDAO.selectFloatingPopStatInRoute(paramMap);
    }

    @Override
    public List<HashMap<String, Object>> getPathToLink(Map<String, Object> paramMap) {
        return gisDAO.selectPathToLink(paramMap);
    }

    @Override
    public List<HashMap<String, Object>> getMetPathLineList(List<HashMap<String, Object>> paramMap) {
        return gisDAO.selectMetPath(paramMap);
    }

    @Override
    public List<HashMap<String, Object>> getSafetyPathLineList(List<HashMap<String, Object>> paramMap) {
        return gisDAO.selectSafetyPath(paramMap);
    }

    @Override
    public List<HashMap<String, Object>> getAstarSafetyPathLineList(
        List<HashMap<String, Object>> paramMap) {
        return gisDAO.selectAstarSafetyPath(paramMap);
    }

    @Override
    public List<HashMap<String, Object>> getAstarMetPathLineList(
        List<HashMap<String, Object>> paramMap) {
        return gisDAO.selectAstarMetPath(paramMap);
    }

    @Override
    public List<HashMap<String, Object>> getAstarShortestPathLineList(
        List<HashMap<String, Object>> paramMap) {
        return gisDAO.selectAstarShortestPath(paramMap);
    }

    @Override
    public List<HashMap<String, Object>> getSafetyPathLineListWithPop(
        Map<String, Object> paramMap) {
        return gisDAO.selectSafetyPathLineListWithPop(paramMap);
    }

    @Override
    public List<HashMap<String, Object>> getMetPathLineListWithPop(
        Map<String, Object> paramMap) {
        return gisDAO.selectMetPathLineListWithPop(paramMap);
    }

    @Override
    public List<HashMap<String, Object>> getShortestPathLineListWithPop(
        Map<String, Object> paramMap) {
        return gisDAO.selectShortestPathLineListWithPop(paramMap);
    }
}
