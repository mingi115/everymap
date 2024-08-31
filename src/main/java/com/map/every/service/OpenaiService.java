package com.map.every.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.ai.chat.model.ChatResponse;
import reactor.core.publisher.Flux;

public interface OpenaiService {
    public String generateSummary(Map<String, Object> jsonMap);
    public String makeChatCompletion(String request);
    public Flux<ChatResponse> makeChatFlux(String request);
}
