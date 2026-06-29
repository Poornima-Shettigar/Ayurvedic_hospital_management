package com.hms.backend.repository;

import com.hms.backend.entity.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface MedicineRepository extends JpaRepository<Medicine, Long> {
    List<Medicine> findByStockQuantityLessThanEqual(int threshold);
    List<Medicine> findByNameContainingIgnoreCase(String name);

    @Query("SELECT COUNT(m) FROM Medicine m WHERE m.stockQuantity <= m.reorderLevel")
    long countLowStock();
}
