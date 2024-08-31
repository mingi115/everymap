package com.map.every.service.impl;

import com.map.every.mapper.GisMapper;
import com.map.every.service.GisService;
import jakarta.annotation.Resource;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
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
    public HashMap<String, Object> getShortestPath(Map<String, Object> paramMap) {
        return gisDAO.selectShortestPath(paramMap);
    }

    @Override
    public List<HashMap<String, Object>> getShortestPathLineList(Map<String, Object> paramMap) {
        return gisDAO.selectShortestPathLineList(paramMap);
    }

    @Override
    public List<HashMap<String, Object>> getObstaclePOIInRoute(Map<String, Object> paramMap) {
        return gisDAO.selectObstaclePOIInRoute(paramMap);
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
}
