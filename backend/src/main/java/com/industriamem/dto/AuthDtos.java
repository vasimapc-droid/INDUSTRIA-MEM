package com.industriamem.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class AuthDtos {

    public record LoginRequest(
        @Email @NotBlank String email,
        @NotBlank String password
    ) {}

    public record RegisterRequest(
        @Email @NotBlank String email,
        @NotBlank String password,
        @NotBlank String fullName,
        String employeeId,
        String phone,
        Long departmentId,
        String role
    ) {}

    public record AuthResponse(
        String token,
        Long userId,
        String email,
        String fullName,
        String role,
        Long departmentId
    ) {}
}