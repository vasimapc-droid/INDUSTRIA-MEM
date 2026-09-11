package com.industriamem.service;

import com.industriamem.exception.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.*;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${app.upload.dir}")
    private String uploadDir;

    public String save(MultipartFile file, String category) {
        try {
            String ext = extractExt(file.getOriginalFilename());
            String name = UUID.randomUUID() + ext;
            Path dir = Paths.get(uploadDir, category);
            Files.createDirectories(dir);
            Files.copy(file.getInputStream(), dir.resolve(name), StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/" + category + "/" + name;
        } catch (Exception e) {
            throw new ApiException("Failed to store file: " + e.getMessage());
        }
    }

    private String extractExt(String fn) {
        if (fn == null) return "";
        int i = fn.lastIndexOf('.');
        return i >= 0 ? fn.substring(i) : "";
    }
}