package com.gallery.controller;

import com.gallery.domain.Todo;
import com.gallery.service.TodoService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/todos")
public class TodoController {

    private final TodoService todoService;

    public TodoController(TodoService todoService) {
        this.todoService = todoService;
    }

    @GetMapping
    public ResponseEntity<List<Todo>> list() {
        return ResponseEntity.ok(todoService.findAll());
    }

    @PostMapping
    public ResponseEntity<Todo> add(@Valid @RequestBody TodoAddRequest request, Authentication auth) {
        String username = auth != null ? auth.getName() : "anonymous";
        Todo todo = todoService.add(request.title(), username);
        return ResponseEntity.ok(todo);
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Todo> toggle(@PathVariable String id, Authentication auth) {
        String username = auth != null ? auth.getName() : "anonymous";
        return ResponseEntity.ok(todoService.toggleComplete(id, username));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        todoService.delete(id);
        return ResponseEntity.noContent().build();
    }

    public record TodoAddRequest(@NotBlank(message = "제목을 입력하세요") String title) {}
}
