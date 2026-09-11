package com.industriamem.repository;

import com.industriamem.entity.KnowledgeEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDateTime;
import java.util.List;

public interface KnowledgeRepository extends JpaRepository<KnowledgeEntry, Long> {
    List<KnowledgeEntry> findByStatusOrderByCreatedAtDesc(String status);
    List<KnowledgeEntry> findByMachineIdOrderByCreatedAtDesc(Long machineId);
    long countByStatus(String status);
    List<KnowledgeEntry> findByCreatedAtAfterOrderByCreatedAtAsc(LocalDateTime since);

    @Query("SELECT k.verifiedBy.fullName, COUNT(k) FROM KnowledgeEntry k WHERE k.verifiedBy IS NOT NULL AND k.status = 'EXPERT_VERIFIED' GROUP BY k.verifiedBy.fullName ORDER BY COUNT(k) DESC")
    List<Object[]> countByExpert();
}