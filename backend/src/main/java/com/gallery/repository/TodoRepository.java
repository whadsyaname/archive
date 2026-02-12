package com.gallery.repository;

import com.gallery.domain.Todo;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TodoRepository extends MongoRepository<Todo, String> {

    List<Todo> findAllByOrderByCreatedAtDesc();
}
