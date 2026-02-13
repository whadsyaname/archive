package com.gallery.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import java.io.*;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

/**
 * MCP 클라이언트: Python MCP 서버(jaeminai_server.py)를 subprocess로 실행하고,
 * stdio를 통해 JSON-RPC 2.0 메시지를 주고받습니다.
 */
@Service
public class McpClientService {

    private static final Logger log = LoggerFactory.getLogger(McpClientService.class);
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    private Process mcpProcess;
    private BufferedReader reader;
    private BufferedWriter writer;
    private final Map<String, CompletableFutureWrapper> pendingRequests = new ConcurrentHashMap<>();
    
    private static class CompletableFutureWrapper {
        java.util.concurrent.CompletableFuture<JsonNode> future = new java.util.concurrent.CompletableFuture<>();
    }

    @PostConstruct
    public void startMcpServer() {
        try {
            // Python 경로 및 스크립트 경로 (프로젝트 루트 기준)
            Path scriptPath = Paths.get("mcp-server", "jaeminai_server.py").toAbsolutePath();
            
            log.info("Starting MCP server: {}", scriptPath);
            
            ProcessBuilder pb = new ProcessBuilder("python", scriptPath.toString());
            pb.redirectErrorStream(true);
            
            // 환경 변수 전달 (GEMINI_API_KEY)
            String geminiKey = System.getenv("GEMINI_API_KEY");
            if (geminiKey != null && !geminiKey.isEmpty()) {
                pb.environment().put("GEMINI_API_KEY", geminiKey);
            }
            
            mcpProcess = pb.start();
            reader = new BufferedReader(new InputStreamReader(mcpProcess.getInputStream()));
            writer = new BufferedWriter(new OutputStreamWriter(mcpProcess.getOutputStream()));
            
            // 응답 리스너 스레드
            Thread listenerThread = new Thread(this::listenForResponses);
            listenerThread.setDaemon(true);
            listenerThread.start();
            
            // 초기화 (MCP initialize)
            sendInitialize();
            
            log.info("MCP server started successfully");
        } catch (Exception e) {
            log.error("Failed to start MCP server", e);
        }
    }

    @PreDestroy
    public void stopMcpServer() {
        if (mcpProcess != null && mcpProcess.isAlive()) {
            mcpProcess.destroy();
            try {
                mcpProcess.waitFor(5, TimeUnit.SECONDS);
            } catch (InterruptedException e) {
                mcpProcess.destroyForcibly();
            }
        }
    }

    private void sendInitialize() throws Exception {
        ObjectNode request = objectMapper.createObjectNode();
        request.put("jsonrpc", "2.0");
        request.put("id", UUID.randomUUID().toString());
        request.put("method", "initialize");
        
        ObjectNode params = objectMapper.createObjectNode();
        params.put("protocolVersion", "2024-11-05");
        params.put("clientInfo", objectMapper.createObjectNode()
                .put("name", "gallery-backend")
                .put("version", "1.0.0"));
        request.set("params", params);
        
        sendRequest(request);
    }

    /**
     * 재미나이에게 메시지 전송 (chat 프롬프트 사용)
     */
    public String sendChatMessage(String message, String sessionId) {
        try {
            if (mcpProcess == null || !mcpProcess.isAlive()) {
                return "MCP 서버가 실행되지 않았습니다.";
            }

            String requestId = UUID.randomUUID().toString();
            ObjectNode request = objectMapper.createObjectNode();
            request.put("jsonrpc", "2.0");
            request.put("id", requestId);
            request.put("method", "prompts/get");
            
            ObjectNode params = objectMapper.createObjectNode();
            params.put("name", "chat");
            ObjectNode arguments = objectMapper.createObjectNode();
            arguments.put("message", message);
            arguments.put("session_id", sessionId != null ? sessionId : "default");
            params.set("arguments", arguments);
            request.set("params", params);
            
            CompletableFutureWrapper wrapper = new CompletableFutureWrapper();
            pendingRequests.put(requestId, wrapper);
            
            sendRequest(request);
            
            // 응답 대기 (최대 30초)
            JsonNode response = wrapper.future.get(30, TimeUnit.SECONDS);
            
            // 응답 파싱
            JsonNode result = response.path("result");
            JsonNode messages = result.path("messages");
            if (messages.isArray() && messages.size() > 0) {
                JsonNode content = messages.get(0).path("content");
                return content.path("text").asText("응답 없음");
            }
            
            return "응답을 파싱할 수 없습니다.";
            
        } catch (Exception e) {
            log.error("Failed to send chat message", e);
            return "오류 발생: " + e.getMessage();
        }
    }

    private void sendRequest(ObjectNode request) throws IOException {
        String json = objectMapper.writeValueAsString(request);
        synchronized (writer) {
            writer.write(json);
            writer.newLine();
            writer.flush();
        }
        log.debug("Sent MCP request: {}", json);
    }

    private void listenForResponses() {
        try {
            String line;
            while ((line = reader.readLine()) != null) {
                log.debug("Received MCP response: {}", line);
                JsonNode response = objectMapper.readTree(line);
                
                String id = response.path("id").asText(null);
                if (id != null && pendingRequests.containsKey(id)) {
                    CompletableFutureWrapper wrapper = pendingRequests.remove(id);
                    wrapper.future.complete(response);
                }
            }
        } catch (Exception e) {
            log.error("Error reading MCP responses", e);
        }
    }
}
