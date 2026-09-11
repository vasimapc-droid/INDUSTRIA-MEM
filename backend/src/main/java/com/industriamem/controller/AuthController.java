package com.industriamem.controller;

import com.industriamem.dto.AuthDtos.*;
import com.industriamem.entity.*;
import com.industriamem.exception.ApiException;
import com.industriamem.repository.*;
import com.industriamem.security.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.industriamem.audit.Auditable;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @PostMapping("/login")
    @Auditable(action = "USER_LOGIN", entityType = "USER")
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
}