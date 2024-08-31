package com.map.every.controller;

import com.map.every.service.GisService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.ai.azure.openai.AzureOpenAiChatModel;
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
    private final AzureOpenAiChatModel chatClient;

    @GetMapping(value = "/getShortestPath")
    public HashMap<String, Object> test(@RequestParam Map<String, Object> paramMap){
        log.debug(paramMap.toString());
        HashMap<String, Object> sp = gisService.getShortestPath(paramMap);
        List<HashMap<String, Object>> op = gisService.getObstaclePOIInRoute(sp);
        sp.put("obstaclePoiList", op);
        return sp;
    }

    @GetMapping("/ai/simple")
    public Map<String, String> completion(@RequestParam(value = "message", defaultValue = "Tell me a joke") String message) {
        return Map.of("generation", chatClient.call(message));
    }
}
