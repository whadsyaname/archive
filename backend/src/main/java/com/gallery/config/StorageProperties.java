package com.gallery.config;

import jakarta.annotation.PostConstruct;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
@ConfigurationProperties(prefix = "gallery.storage")
public class StorageProperties {

    /**
     * 사진 저장 루트 경로 (외장 SSD 경로 설정 가능)
     * 예: D:\gallery-photos (Windows), /Volumes/SSD/gallery-photos (Mac)
     */
    private String path = "./gallery-storage";

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public Path getPathAsPath() {
        return Paths.get(path).toAbsolutePath().normalize();
    }

    @PostConstruct
    public void init() {
        try {
            Path root = getPathAsPath();
            if (!Files.exists(root)) {
                Files.createDirectories(root);
            }
        } catch (Exception e) {
            throw new RuntimeException("저장 디렉토리를 생성할 수 없습니다: " + path, e);
        }
    }
}
