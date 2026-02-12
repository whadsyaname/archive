package com.gallery.controller;

import com.gallery.domain.DDay;
import com.gallery.service.DDayService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/ddays")
public class DDayController {

    private final DDayService dDayService;

    public DDayController(DDayService dDayService) {
        this.dDayService = dDayService;
    }

    @GetMapping
    public ResponseEntity<List<DDay>> list() {
        return ResponseEntity.ok(dDayService.findAll());
    }

    @PostMapping
    public ResponseEntity<DDay> add(@Valid @RequestBody DDayRequest request) {
        return ResponseEntity.ok(dDayService.add(request.title(), request.targetDate()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DDay> update(@PathVariable String id, @Valid @RequestBody DDayRequest request) {
        return ResponseEntity.ok(dDayService.update(id, request.title(), request.targetDate()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        dDayService.delete(id);
        return ResponseEntity.noContent().build();
    }

    public record DDayRequest(
            @NotBlank(message = "제목을 입력하세요") String title,
            @NotNull(message = "날짜를 입력하세요") LocalDate targetDate
    ) {}
}
