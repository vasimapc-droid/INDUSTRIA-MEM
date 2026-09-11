package com.industriamem.controller;

import com.industriamem.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileStorageService storage;

    @PostMapping("/upload/image")
    public Map<String,String> image(@RequestParam("file") MultipartFile file) {
        return Map.of("url", storage.save(file, "images"));
    }

    @PostMapping("/upload/audio")
    public Map<String,String> audio(@RequestParam("file") MultipartFile file) {
        return Map.of("url", storage.save(file, "audio"));
    }

    @PostMapping("/upload/video")
    public Map<String,String> video(@RequestParam("file") MultipartFile file) {
        return Map.of("url", storage.save(file, "videos"));
    }

    @PostMapping("/upload/document")
    public Map<String,String> doc(@RequestParam("file") MultipartFile file) {
        return Map.of("url", storage.save(file, "documents"));
    }
}