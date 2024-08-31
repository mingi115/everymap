package com.map.every.controller;

import com.map.every.service.GisService;
import com.map.every.service.OpenaiService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.locationtech.jts.io.ParseException;
import org.springframework.ai.azure.openai.AzureOpenAiChatModel;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.Mapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping(value = "/api")
public class ApiController {

    private final GisService gisService;
    private final OpenaiService openaiService;

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

    @PostMapping("/ai/pathSummarization")
    public Map<String, String> sumarizePathInfo(@RequestBody Map<String, Object> paramMap) {
        // 경로 정보 요약 json 세팅
        // ex)
//         {
//             "slope": { min: 6, max: 8, agv: 7, safety_min: 4, safety_max: 6, },
//             "floating_population": { current: 10, quiet: 5, crowded: 20 },
//             "obstacles": { "맨홀": 3, "빗물받이: 1 }
//         }
//        Map<String, Object> slope = new HashMap<>();
//        slope.put("min", 6);
//        slope.put("max", 8);
//        slope.put("agv", 7);
//        slope.put("safety_min", 4);
//        slope.put("safety_max", 6);
//
//        Map<String, Object> floatingPopulation = new HashMap<>();
//        floatingPopulation.put("current", 10);
//        floatingPopulation.put("quiet", 5);
//        floatingPopulation.put("crowded", 20);
//
//        Map<String, Object> obstacles = new HashMap<>();
//        obstacles.put("맨홀", 3);
//        obstacles.put("빗물받이", 1);
//
//        Map<String, Object> jsonMap = new HashMap<>();
//        jsonMap.put("slope", slope);
//        jsonMap.put("floating_population", floatingPopulation);
//        jsonMap.put("obstacles", obstacles);

        // 경로 정보 요약 json 세팅
        String pathInfoSummary = openaiService.generateSummary(paramMap);
        String pathInfoChatCompletion = openaiService.makeChatCompletion(pathInfoSummary);

        return Map.of("pathInfo", pathInfoChatCompletion);
    }

    @PostMapping("/getFloatingPopStat")
    public Map<String, Object> getFloatingPopStat(@RequestBody Map<String, Object> paramMap) {
        HashMap<String, Object> result = new HashMap<>();
        List<HashMap<String, Object>> fps = gisService.getFloatingPopStatInRoute(paramMap);
        result.put("floatingPopStat", fps);
        return result;
    }


    @PostMapping("/ai/setSummarizeData")
    public HttpStatus setSummarizedData(
        @RequestBody Map<String, Object> paramMap,
        HttpServletRequest request
    ) {
        HttpSession session = request.getSession();
        session.setAttribute("summaryParam", paramMap);
        System.out.println("-------------------");
        System.out.println(paramMap);
        return HttpStatus.OK;
    }

    @GetMapping(value="/ai/pathSummarizationTest",
        produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ChatResponse> summarizedPathInfoTest(HttpServletRequest request) {
        HttpSession session = request.getSession();

        Map<String, Object> paramMap = (Map<String, Object>) session.getAttribute("summaryParam");
        System.out.println("-------------------");
        System.out.println(paramMap);
        String pathInfoSummary = openaiService.generateSummary(paramMap);
        return openaiService.makeChatFlux(pathInfoSummary);
    }

    private final AzureOpenAiChatModel chatModel;
    @GetMapping(value="/ai/generateStream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ChatResponse> generateStream(@RequestParam(value = "message", defaultValue = "Tell me a joke") String message) {
        Prompt prompt = new Prompt(new UserMessage(message));
        return chatModel.stream(prompt);
    }
}
