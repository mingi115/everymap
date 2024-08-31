package com.map.every.controller;

import com.map.every.service.GisService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.locationtech.jts.io.ParseException;
import org.springframework.ai.azure.openai.AzureOpenAiChatModel;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping(value = "/api")
public class ApiController {

    private final GisService gisService;
    private final AzureOpenAiChatModel chatClient;

    @GetMapping(value = "/getShortestPath")
    public HashMap<String, Object> getShortestPath(@RequestParam Map<String, Object> paramMap)
        throws ParseException {
        log.debug(paramMap.toString());
        HashMap<String, Object> result = new HashMap<>();
        List<HashMap<String, Object>> lsList = gisService.getShortestPathLineList(paramMap);
        result.put("lsList", lsList);

        String route = gisService.mergeLinestringList(lsList);
        paramMap.put("route", route);
        result.put("route", route);

        List<HashMap<String, Object>> op = gisService.getObstaclePOIInRoute(paramMap);
        result.put("obstaclePoiList", op);

        List<HashMap<String, Object>> hmpl = gisService.getFloatingPopHeatmapPoints(paramMap);
        result.put("heatmapPointList", hmpl);
        return result;
    }

    @GetMapping("/ai/simple")
    public Map<String, String> completion(@RequestParam(value = "message", defaultValue = "Tell me a joke") String message) {
        return Map.of("generation", chatClient.call(message));
    }

    @PostMapping("/getFloatingPopStat")
    public Map<String, Object> getFloatingPopStat(@RequestBody Map<String, Object> paramMap) {
        HashMap<String, Object> result = new HashMap<>();
        List<HashMap<String, Object>> fps = gisService.getFloatingPopStatInRoute(paramMap);
        result.put("floatingPopStat", fps);
        return result;
    }
}
