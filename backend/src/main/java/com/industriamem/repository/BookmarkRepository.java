package com.industriamem.repository;

import com.industriamem.entity.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {
    Optional<Bookmark> findByUserIdAndKnowledgeId(Long userId, Long knowledgeId);
    List<Bookmark> findByUserIdOrderByCreatedAtDesc(Long userId);
    boolean existsByUserIdAndKnowledgeId(Long userId, Long knowledgeId);
}