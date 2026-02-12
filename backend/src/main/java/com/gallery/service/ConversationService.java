package com.gallery.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gallery.config.ConversationProperties;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ConversationService {

    private static final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

    /** 투두 추가 의도: "투두에 '탄이 간식 사기' 추가해줘", "할일 ... 넣어줘" 등 */
    private static final Pattern TODO_ADD_PATTERN = Pattern.compile(
            "(?:투두에?|할일|할 일)\\s*[\\'\"]?([^\\'\"]+)[\\'\"]?\\s*(?:추가|넣어|등록)",
            Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE
    );

    private final ConversationProperties properties;
    private final TodoService todoService;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ConversationService(ConversationProperties properties, TodoService todoService) {
        this.properties = properties;
        this.todoService = todoService;
    }

    /**
     * 프롬프트 처리: "투두에 ... 추가" 의도면 공유 투두에 추가하고, Gemini 응답과 함께 반환.
     * @param username 현재 사용자 (투두 등록자)
     */
    public Object sendPrompt(String prompt, String username) {
        String todoTitle = extractTodoAddIntent(prompt);
        if (todoTitle != null && username != null) {
            todoService.add(todoTitle, username);
            Map<String, Object> base = callGemini(prompt);
            Map<String, Object> result = new HashMap<>(base);
            result.put("todoAdded", true);
            result.put("todoTitle", todoTitle);
            return result;
        }
        return callGemini(prompt);
    }

    private String extractTodoAddIntent(String prompt) {
        if (prompt == null) return null;
        Matcher m = TODO_ADD_PATTERN.matcher(prompt.trim());
        if (m.find()) {
            String title = m.group(1).trim();
            return title.isEmpty() ? null : title;
        }
        return null;
    }

    private Map<String, Object> callGemini(String prompt) {
        if (!properties.isConfigured()) {
            return Map.of(
                    "text", "재미나이 API 키가 설정되지 않았습니다. application.yml의 gallery.conversation.api-key 또는 환경 변수 JAEMINAI_API_KEY에 발급받은 API 키를 설정해 주세요.",
                    "demo", true
            );
        }
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-goog-api-key", properties.getApiKey());

            Map<String, Object> body = Map.of(
                    "contents", java.util.List.of(
                            Map.of("parts", java.util.List.of(Map.of("text", prompt)))
                    )
            );
            HttpEntity<String> request = new HttpEntity<>(objectMapper.writeValueAsString(body), headers);
            ResponseEntity<String> response = restTemplate.exchange(
                    GEMINI_URL,
                    HttpMethod.POST,
                    request,
                    String.class
            );
            String responseBody = response.getBody();
            if (responseBody == null) {
                return Map.of("text", "(빈 응답)");
            }
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode candidates = root.path("candidates");
            if (candidates.isEmpty()) {
                return Map.of("text", "(응답 없음)", "raw", responseBody);
            }
            JsonNode parts = candidates.get(0).path("content").path("parts");
            if (parts.isEmpty()) {
                return Map.of("text", "(응답 없음)");
            }
            String text = parts.get(0).path("text").asText("");
            return Map.of("text", text);
        } catch (Exception e) {
            throw new RuntimeException("재미나이 API 호출 실패: " + e.getMessage(), e);
        }
    }
}
