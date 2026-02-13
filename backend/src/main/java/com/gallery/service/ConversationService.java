package com.gallery.service;

import com.gallery.config.ConversationProperties;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class ConversationService {

    private final ConversationProperties properties;
    private final TodoService todoService;
    private final McpClientService mcpClientService;

    public ConversationService(
            ConversationProperties properties,
            TodoService todoService,
            McpClientService mcpClientService) {
        this.properties = properties;
        this.todoService = todoService;
        this.mcpClientService = mcpClientService;
    }

    /**
     * MCP를 통해 재미나이와 대화
     */
    public Object sendPrompt(String prompt, String username) {
        if (!properties.isConfigured()) {
            return Map.of(
                    "text", "재미나이 API 키가 설정되지 않았습니다. GEMINI_API_KEY 환경 변수에 발급받은 API 키를 설정해 주세요.",
                    "demo", true
            );
        }

        try {
            // MCP 서버를 통해 재미나이 호출 (세션ID로 사용자명 사용)
            String sessionId = username != null ? username : "anonymous";
            String response = mcpClientService.sendChatMessage(prompt, sessionId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("text", response);
            
            // "투두에 ... 추가" 같은 의도가 있으면 MCP 서버가 처리하거나,
            // 여기서 간단히 파싱해서 todoService.add() 호출 가능
            
            return result;
        } catch (Exception e) {
            return Map.of("text", "오류 발생: " + e.getMessage());
        }
    }
}
