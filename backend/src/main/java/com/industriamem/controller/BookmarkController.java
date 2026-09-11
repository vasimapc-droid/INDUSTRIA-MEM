package com.industriamem.controller;

import com.industriamem.entity.*;
import com.industriamem.exception.ApiException;
import com.industriamem.repository.*;
import com.industriamem.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bookmarks")
@RequiredArgsConstructor
public class BookmarkController {

    private final BookmarkRepository bookmarkRepository;
    private final KnowledgeRepository knowledgeRepository;

    @GetMapping
    public List<KnowledgeEntry> myBookmarks(@CurrentUser User me) {
        List<Bookmark> bm = bookmarkRepository.findByUserIdOrderByCreatedAtDesc(me.getId());
        List<Long> ids = bm.stream().map(Bookmark::getKnowledgeId).collect(Collectors.toList());
        if (ids.isEmpty()) return List.of();
        return knowledgeRepository.findAllById(ids);
    }

    @GetMapping("/{knowledgeId}/status")
    public Map<String,Object> status(@PathVariable Long knowledgeId, @CurrentUser User me) {
        boolean bookmarked = bookmarkRepository.existsByUserIdAndKnowledgeId(me.getId(), knowledgeId);
        return Map.of("bookmarked", bookmarked);
    }

    @PostMapping("/{knowledgeId}/toggle")
    public Map<String,Object> toggle(@PathVariable Long knowledgeId, @CurrentUser User me) {
        // verify knowledge exists
        knowledgeRepository.findById(knowledgeId)
                .orElseThrow(() -> new ApiException("Knowledge not found"));

        Optional<Bookmark> existing = bookmarkRepository.findByUserIdAndKnowledgeId(me.getId(), knowledgeId);
        if (existing.isPresent()) {
            bookmarkRepository.delete(existing.get());
            return Map.of("bookmarked", false);
        } else {
            Bookmark b = Bookmark.builder()
                    .userId(me.getId())
                    .knowledgeId(knowledgeId)
                    .build();
            bookmarkRepository.save(b);
            return Map.of("bookmarked", true);
        }
    }
}