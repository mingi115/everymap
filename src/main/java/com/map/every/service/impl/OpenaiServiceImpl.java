package com.map.every.service.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.stereotype.Service;
import org.springframework.core.io.Resource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.ai.azure.openai.AzureOpenAiChatModel;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.ai.chat.prompt.SystemPromptTemplate;
import org.springframework.ai.chat.messages.Message;
import com.map.every.service.OpenaiService;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

@Slf4j
@RequiredArgsConstructor
@Service
public class OpenaiServiceImpl implements OpenaiService {

    private final AzureOpenAiChatModel chatClient;

    @Value("classpath:prompts/system.prompt")
    private Resource systemPrompt;

    @Value("classpath:prompts/summarize-path-info.prompt")
    private Resource summarizePathInfoPrompt;

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
        SystemPromptTemplate systemPromptTemplate = new SystemPromptTemplate(systemPrompt);
        Message systemPromptMessage = systemPromptTemplate.createMessage();

        PromptTemplate promptTemplate = new PromptTemplate(summarizePathInfoPrompt);
        Message promptMessage = promptTemplate.createMessage(Map.of("path-summary", request));

        Prompt prompt = new Prompt(List.of(systemPromptMessage, promptMessage));

        return chatClient.call(prompt).getResult().getOutput().getContent();
    }



    @Override
    public Flux<ChatResponse> makeChatFlux(String request) {
        PromptTemplate promptTemplate = new PromptTemplate(getCapitalPromptWithInfo);
        Prompt prompt = promptTemplate.create(
            Map.of("path-summary", request));
        return chatClient.stream(prompt);
    }
}
