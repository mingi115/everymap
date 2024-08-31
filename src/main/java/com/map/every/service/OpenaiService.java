package com.map.every.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public interface OpenaiService {
    public String generateSummary(Map<String, Object> jsonMap);
    public String makeChatCompletion(String request);
}
