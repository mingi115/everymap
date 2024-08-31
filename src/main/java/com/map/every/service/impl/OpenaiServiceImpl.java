package com.map.every.service.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.core.io.Resource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.ai.azure.openai.AzureOpenAiChatModel;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.PromptTemplate;
import com.map.every.service.OpenaiService;

@Slf4j
@RequiredArgsConstructor
@Service
public class OpenaiServiceImpl implements OpenaiService {

    private final AzureOpenAiChatModel chatClient;

    @Value("classpath:prompts/summarize-path-info.prompt")
    private Resource getCapitalPromptWithInfo;

    @Override
    public String generateSummary(Map<String, Object> jsonMap) {
        Map<String, Object> slope = (Map<String, Object>) jsonMap.get("slope");
        Map<String, Object> floatingPopulation = (Map<String, Object>) jsonMap.get("floating_population");
        Map<String, Object> obstacles = (Map<String, Object>) jsonMap.get("obstacles");

        StringBuilder summary = new StringBuilder();
        summary.append("Slope: min=").append(slope.get("min"))
                .append(", max=").append(slope.get("max"))
                .append(", avg=").append(slope.get("agv"))
                .append(", safety_min=").append(slope.get("safety_min"))
                .append(", safety_max=").append(slope.get("safety_max")).append("\n");

        summary.append("Floating Population: current=").append(floatingPopulation.get("current"))
                .append(", quiet=").append(floatingPopulation.get("quiet"))
                .append(", crowded=").append(floatingPopulation.get("crowded")).append("\n");

        summary.append("Obstacles: 맨홀=").append(obstacles.get("맨홀"))
                .append(", 빗물받이=").append(obstacles.get("빗물받이"));

        return summary.toString();
    }

    @Override
    public String makeChatCompletion(String request) {
        PromptTemplate promptTemplate = new PromptTemplate(getCapitalPromptWithInfo);
        Prompt prompt = promptTemplate.create(
            Map.of("path-summary", request));
        return chatClient.call(prompt).getResult().getOutput().getContent();
    }
}
