package com.industriamem.repository;

import com.industriamem.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface RatingRepository extends JpaRepository<Rating, Long> {
    Optional<Rating> findByUserIdAndKnowledgeId(Long userId, Long knowledgeId);
    List<Rating> findByKnowledgeId(Long knowledgeId);

    @Query("SELECT AVG(r.rating) FROM Rating r WHERE r.knowledgeId = :kid")
    Double averageForKnowledge(@Param("kid") Long knowledgeId);

    @Query("SELECT COUNT(r) FROM Rating r WHERE r.knowledgeId = :kid")
    long countForKnowledge(@Param("kid") Long knowledgeId);
}