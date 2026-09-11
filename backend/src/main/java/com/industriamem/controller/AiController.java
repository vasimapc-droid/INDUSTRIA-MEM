package com.industriamem.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    @Value("${app.ai.service-url}")
    private String aiUrl;

    private final RestTemplate rest;

    @PostMapping("/structure-knowledge")
    public ResponseEntity<?> structure(@RequestBody Map<String,Object> body) {
        try { return rest.postForEntity(aiUrl + "/structure-knowledge", body, Map.class); }
        catch (Exception e) { return ResponseEntity.ok(Map.of("fallback", true, "error", "AI service unavailable", "structured", Map.of())); }
    }

    @PostMapping("/search")
    public ResponseEntity<?> search(@RequestBody Map<String,Object> body) {
        try { return rest.postForEntity(aiUrl + "/search", body, Map.class); }
        catch (Exception e) { return ResponseEntity.ok(Map.of("results", java.util.List.of(), "fallback", true)); }
    }

    @PostMapping("/similar-incidents")
    public ResponseEntity<?> similar(@RequestBody Map<String,Object> body) {
        try { return rest.postForEntity(aiUrl + "/similar-incidents", body, Map.class); }
        catch (Exception e) { return ResponseEntity.ok(Map.of("results", java.util.List.of(), "fallback", true)); }
    }

    @PostMapping("/ask")
    public ResponseEntity<?> ask(@RequestBody Map<String,Object> body) {
        try { return rest.postForEntity(aiUrl + "/ask", body, Map.class); }
        catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "answer", "AI service is currently unavailable. Please try again later or ask an expert.",
                "fallback", true));
        }
    }
}