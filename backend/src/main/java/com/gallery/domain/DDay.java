package com.gallery.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.time.LocalDate;

@Document(collection = "ddays")
public class DDay {

    @Id
    private String id;
    private String title;       // e.g. "은혜랑 만난 날", "탄이 생일"
    private LocalDate targetDate;
    private Instant createdAt;

    public DDay() {}

    public DDay(String title, LocalDate targetDate) {
        this.title = title;
        this.targetDate = targetDate;
        this.createdAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public LocalDate getTargetDate() { return targetDate; }
    public void setTargetDate(LocalDate targetDate) { this.targetDate = targetDate; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
