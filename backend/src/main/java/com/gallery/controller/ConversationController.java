package com.gallery.controller;

import com.gallery.service.ConversationService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/conversation")
public class ConversationController {

    private final ConversationService conversationService;

    public ConversationController(ConversationService conversationService) {
        this.conversationService = conversationService;
    }

    @PostMapping
    public ResponseEntity<Object> conversation(@Valid @RequestBody ConversationRequest request, Authentication auth) {
        String username = auth != null ? auth.getName() : null;
        Object result = conversationService.sendPrompt(request.prompt().trim(), username);
        return ResponseEntity.ok(result);
    }

    public record ConversationRequest(@NotBlank(message = "프롬프트를 입력하세요") String prompt) {}
}
