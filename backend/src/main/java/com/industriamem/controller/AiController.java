package com.industriamem.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

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

    // ============ AUDIO TRANSCRIPTION PROXY ============
    @PostMapping("/transcribe")
    public ResponseEntity<?> transcribe(@RequestParam("file") MultipartFile file) {
        try {
            // Prepare multipart body for forwarding to AI service
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            ByteArrayResource resource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename() != null ? file.getOriginalFilename() : "audio.webm";
                }
            };
            body.add("file", resource);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = rest.postForEntity(
                aiUrl + "/transcribe",
                requestEntity,
                Map.class
            );

            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            System.err.println("[transcribe] Failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(Map.of(
                "text", "",
                "fallback", true,
                "error", "AI service unavailable: " + e.getMessage()
            ));
        }
    }
}