package com.gallery.service;

import com.gallery.domain.Todo;
import com.gallery.repository.TodoRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class TodoService {

    private final TodoRepository todoRepository;

    public TodoService(TodoRepository todoRepository) {
        this.todoRepository = todoRepository;
    }

    public List<Todo> findAll() {
        return todoRepository.findAllByOrderByCreatedAtDesc();
    }

    public Todo add(String title, String createdBy) {
        Todo todo = new Todo(title.trim(), createdBy);
        return todoRepository.save(todo);
    }

    public Todo toggleComplete(String id, String completedByUsername) {
        Todo todo = todoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("할 일을 찾을 수 없습니다: " + id));
        todo.setCompleted(!todo.isCompleted());
        todo.setCompletedAt(todo.isCompleted() ? Instant.now() : null);
        todo.setCompletedBy(todo.isCompleted() ? completedByUsername : null);
        return todoRepository.save(todo);
    }

    public void delete(String id) {
        if (!todoRepository.existsById(id)) {
            throw new IllegalArgumentException("할 일을 찾을 수 없습니다: " + id);
        }
        todoRepository.deleteById(id);
    }
}
