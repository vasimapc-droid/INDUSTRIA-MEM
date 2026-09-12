package com.industriamem.controller;

import com.industriamem.dto.AuthDtos.*;
import com.industriamem.entity.*;
import com.industriamem.exception.ApiException;
import com.industriamem.repository.*;
import com.industriamem.security.CurrentUser;
import com.industriamem.security.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.*;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Value("${app.upload.dir}")
    private String uploadDir;

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        User user = userRepository.findByEmail(req.email())
                .orElseThrow(() -> new ApiException("Invalid credentials"));
        if (!passwordEncoder.matches(req.password(), user.getPassword())) {
            throw new ApiException("Invalid credentials");
        }
        if (Boolean.FALSE.equals(user.getActive())) throw new ApiException("Account disabled");
        String token = jwtService.generateToken(user.getEmail(), user.getId(), user.getRole().getName());
        return new AuthResponse(token, user.getId(), user.getEmail(), user.getFullName(),
                user.getRole().getName(),
                user.getDepartment() != null ? user.getDepartment().getId() : null);
    }

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest req) {
        if (userRepository.existsByEmail(req.email())) throw new ApiException("Email already registered");
        Role role = roleRepository.findByName(req.role() == null ? "TECHNICIAN" : req.role())
                .orElseThrow(() -> new ApiException("Role not found"));
        Department dept = req.departmentId() != null
                ? departmentRepository.findById(req.departmentId()).orElse(null) : null;
        User user = User.builder()
                .email(req.email())
                .password(passwordEncoder.encode(req.password()))
                .fullName(req.fullName())
                .employeeId(req.employeeId())
                .phone(req.phone())
                .department(dept)
                .role(role)
                .active(true)
                .build();
        userRepository.save(user);
        String token = jwtService.generateToken(user.getEmail(), user.getId(), role.getName());
        return new AuthResponse(token, user.getId(), user.getEmail(), user.getFullName(),
                role.getName(), dept != null ? dept.getId() : null);
    }

    // ==================== PROFILE ====================

    @GetMapping("/me")
    public User me(@CurrentUser User user) {
        return user;
    }

    @PutMapping("/me")
    public User updateMe(@RequestBody Map<String,String> body, @CurrentUser User user) {
        if (body.containsKey("fullName")) user.setFullName(body.get("fullName"));
        if (body.containsKey("phone")) user.setPhone(body.get("phone"));
        if (body.containsKey("employeeId")) user.setEmployeeId(body.get("employeeId"));
        if (body.containsKey("profileImage")) user.setProfileImage(body.get("profileImage"));
        return userRepository.save(user);
    }

    @PostMapping("/me/change-password")
    public Map<String,Object> changePassword(@RequestBody Map<String,String> body, @CurrentUser User user) {
        String current = body.get("currentPassword");
        String newPassword = body.get("newPassword");

        if (current == null || newPassword == null || newPassword.length() < 6) {
            throw new ApiException("Current password and new password (min 6 chars) required");
        }
        if (!passwordEncoder.matches(current, user.getPassword())) {
            throw new ApiException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return Map.of("success", true);
    }

    @PostMapping("/me/avatar")
    public Map<String,String> uploadAvatar(@RequestParam("file") MultipartFile file, @CurrentUser User user) {
        try {
            String ext = "";
            String fn = file.getOriginalFilename();
            if (fn != null && fn.contains(".")) ext = fn.substring(fn.lastIndexOf('.'));
            String name = UUID.randomUUID() + ext;
            Path dir = Paths.get(uploadDir, "avatars");
            Files.createDirectories(dir);
            Files.copy(file.getInputStream(), dir.resolve(name), StandardCopyOption.REPLACE_EXISTING);
            String url = "/uploads/avatars/" + name;
            user.setProfileImage(url);
            userRepository.save(user);
            return Map.of("url", url);
        } catch (Exception e) {
            throw new ApiException("Failed to upload: " + e.getMessage());
        }
    }

    // ==================== PASSWORD RESET ====================

    @PostMapping("/forgot-password")
    public Map<String,Object> forgotPassword(@RequestBody Map<String,String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            throw new ApiException("Email is required");
        }

        User user = userRepository.findByEmail(email).orElse(null);

        // Always return success to prevent email enumeration
        Map<String,Object> response = new java.util.LinkedHashMap<>();
        response.put("success", true);
        response.put("message", "If an account exists with that email, reset instructions have been sent.");

        if (user == null) {
            return response;
        }

        // Generate reset token
        String token = UUID.randomUUID().toString().replace("-", "");
        user.setResetToken(token);
        user.setResetTokenExpiresAt(java.time.LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        // In production, send email here.
        // For DEMO, return the token directly in the response.
        // In production, remove these two lines.
        response.put("devToken", token);
        response.put("devNote", "Token returned directly (development mode). In production this would be emailed.");

        System.out.println("=======================================");
        System.out.println("PASSWORD RESET TOKEN FOR: " + email);
        System.out.println("Token: " + token);
        System.out.println("Expires in 15 minutes.");
        System.out.println("=======================================");

        return response;
    }

    @PostMapping("/reset-password")
    public Map<String,Object> resetPassword(@RequestBody Map<String,String> body) {
        String token = body.get("token");
        String newPassword = body.get("newPassword");

        if (token == null || token.isBlank() || newPassword == null || newPassword.length() < 6) {
            throw new ApiException("Token and new password (min 6 chars) are required");
        }

        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new ApiException("Invalid or expired reset token"));

        if (user.getResetTokenExpiresAt() == null ||
            user.getResetTokenExpiresAt().isBefore(java.time.LocalDateTime.now())) {
            throw new ApiException("Reset token has expired. Please request a new one.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiresAt(null);
        userRepository.save(user);

        return Map.of("success", true, "message", "Password reset successfully. You can now log in.");
    }
}