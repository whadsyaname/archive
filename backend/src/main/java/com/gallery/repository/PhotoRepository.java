package com.gallery.repository;

import com.gallery.domain.Photo;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface PhotoRepository extends MongoRepository<Photo, String> {

    List<Photo> findAllByOrderByUploadedAtDesc();
}
