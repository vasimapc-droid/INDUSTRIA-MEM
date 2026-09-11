package com.industriamem.repository;

import com.industriamem.entity.ExpertRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExpertRequestRepository extends JpaRepository<ExpertRequest, Long> {
    List<ExpertRequest> findByRequesterIdOrderByCreatedAtDesc(Long requesterId);
    List<ExpertRequest> findByExpertIdOrderByCreatedAtDesc(Long expertId);
    List<ExpertRequest> findByExpertIdAndStatusOrderByCreatedAtDesc(Long expertId, String status);
    long countByExpertIdAndStatus(Long expertId, String status);
}