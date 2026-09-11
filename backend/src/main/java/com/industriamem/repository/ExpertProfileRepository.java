package com.industriamem.repository;

import com.industriamem.entity.ExpertProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ExpertProfileRepository extends JpaRepository<ExpertProfile, Long> {
    Optional<ExpertProfile> findByUserId(Long userId);
}