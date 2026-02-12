package com.gallery.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "gallery.conversation")
public class ConversationProperties {

    /**
     * 재미나이(Google Gemini) API 키.
     * 환경 변수 JAEMINAI_API_KEY 또는 application.yml의 gallery.conversation.api-key 로 설정.
     */
    private String apiKey = "";

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }
}
