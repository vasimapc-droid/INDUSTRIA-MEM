package com.industriamem.controller;

import com.industriamem.entity.*;
import com.industriamem.exception.ApiException;
import com.industriamem.repository.*;
import com.industriamem.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/ratings")
@RequiredArgsConstructor
public class RatingController {

    private final RatingRepository ratingRepository;
    private final KnowledgeRepository knowledgeRepository;

    @GetMapping("/{knowledgeId}")
    public Map<String,Object> summary(@PathVariable Long knowledgeId, @CurrentUser User me) {
        Double avg = ratingRepository.averageForKnowledge(knowledgeId);
        long count = ratingRepository.countForKnowledge(knowledgeId);

        Integer myRating = ratingRepository.findByUserIdAndKnowledgeId(me.getId(), knowledgeId)
                .map(Rating::getRating).orElse(null);

        Map<String,Object> m = new LinkedHashMap<>();
        m.put("average", avg != null ? Math.round(avg * 10.0) / 10.0 : null);
        m.put("count", count);
        m.put("myRating", myRating);
        return m;
    }

    @PostMapping("/{knowledgeId}")
    public Map<String,Object> rate(@PathVariable Long knowledgeId,
                                   @RequestBody Map<String,Object> body,
                                   @CurrentUser User me) {
        knowledgeRepository.findById(knowledgeId)
                .orElseThrow(() -> new ApiException("Knowledge not found"));

        Object ratingObj = body.get("rating");
        if (ratingObj == null) throw new ApiException("rating (1-5) is required");
        int rating;
        try { rating = Integer.parseInt(ratingObj.toString()); }
        catch (Exception e) { throw new ApiException("rating must be 1-5"); }
        if (rating < 1 || rating > 5) throw new ApiException("rating must be 1-5");

        String feedback = (String) body.getOrDefault("feedback", null);

        Optional<Rating> existing = ratingRepository.findByUserIdAndKnowledgeId(me.getId(), knowledgeId);
        Rating r;
        if (existing.isPresent()) {
            r = existing.get();
            r.setRating(rating);
            r.setFeedback(feedback);
        } else {
            r = Rating.builder()
                    .userId(me.getId())
                    .knowledgeId(knowledgeId)
                    .rating(rating)
                    .feedback(feedback)
                    .build();
        }
        ratingRepository.save(r);

        Double avg = ratingRepository.averageForKnowledge(knowledgeId);
        long count = ratingRepository.countForKnowledge(knowledgeId);

        Map<String,Object> out = new LinkedHashMap<>();
        out.put("average", avg != null ? Math.round(avg * 10.0) / 10.0 : null);
        out.put("count", count);
        out.put("myRating", rating);
        return out;
    }
}