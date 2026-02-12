package com.gallery.service;

import com.gallery.domain.DDay;
import com.gallery.repository.DDayRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class DDayService {

    private final DDayRepository dDayRepository;

    public DDayService(DDayRepository dDayRepository) {
        this.dDayRepository = dDayRepository;
    }

    public List<DDay> findAll() {
        return dDayRepository.findAllByOrderByTargetDateAsc();
    }

    public DDay add(String title, LocalDate targetDate) {
        DDay d = new DDay(title.trim(), targetDate);
        return dDayRepository.save(d);
    }

    public DDay update(String id, String title, LocalDate targetDate) {
        DDay d = dDayRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("디데이를 찾을 수 없습니다: " + id));
        d.setTitle(title != null ? title.trim() : d.getTitle());
        if (targetDate != null) d.setTargetDate(targetDate);
        return dDayRepository.save(d);
    }

    public void delete(String id) {
        if (!dDayRepository.existsById(id)) {
            throw new IllegalArgumentException("디데이를 찾을 수 없습니다: " + id);
        }
        dDayRepository.deleteById(id);
    }
}
