package com.gallery.repository;

import com.gallery.domain.DDay;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface DDayRepository extends MongoRepository<DDay, String> {

    List<DDay> findAllByOrderByTargetDateAsc();
}
