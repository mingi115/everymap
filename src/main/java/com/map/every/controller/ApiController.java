package com.map.every.controller;

import com.map.every.service.GisService;
import com.map.every.service.OpenaiService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping(value = "/api")
public class ApiController {

    private final GisService gisService;
    private final OpenaiService openaiService;

    @GetMapping(value = "/getShortestPath")
    public HashMap<String, Object> test(@RequestParam Map<String, Object> paramMap){
        log.debug(paramMap.toString());
        HashMap<String, Object> sp = gisService.getShortestPath(paramMap);
        List<HashMap<String, Object>> op = gisService.getObstaclePOIInRoute(sp);
        sp.put("obstaclePoiList", op);
        return sp;
    }

    @GetMapping("/ai/path-summarization")
    public Map<String, String> sumarizePathInfo() {
        // 경로 정보 요약 json 세팅
        // ex)
        // {
        //     "slope": { min: 6, max: 8, agv: 7, safety_min: 4, safety_max: 6, },
        //     "floating_population": { current: 10, quiet: 5, crowded: 20 },
        //     "obstacles": { "맨홀": 3, "빗물받이: 1 }
        // }
        Map<String, Object> slope = new HashMap<>();
        slope.put("min", 6);
        slope.put("max", 8);
        slope.put("agv", 7);
        slope.put("safety_min", 4);
        slope.put("safety_max", 6);
        
        Map<String, Object> floatingPopulation = new HashMap<>();
        floatingPopulation.put("current", 10);
        floatingPopulation.put("quiet", 5);
        floatingPopulation.put("crowded", 20);
        
        Map<String, Object> obstacles = new HashMap<>();
        obstacles.put("맨홀", 3);
        obstacles.put("빗물받이", 1);
        
        Map<String, Object> jsonMap = new HashMap<>();
        jsonMap.put("slope", slope);
        jsonMap.put("floating_population", floatingPopulation);
        jsonMap.put("obstacles", obstacles);

        // 경로 정보 요약 json 세팅
        String pathInfoSummary = openaiService.generateSummary(jsonMap);
        String pathInfoChatCompletion = openaiService.makeChatCompletion(pathInfoSummary);

        return Map.of("path_info", pathInfoChatCompletion);
    }
}
