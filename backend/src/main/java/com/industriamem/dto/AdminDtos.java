package com.industriamem.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class AdminDtos {

    public record UserDto(
        Long id, String email, String fullName, String employeeId, String phone,
        Long departmentId, String departmentName,
        Long roleId, String roleName, Boolean active
    ) {}

    public record CreateUserRequest(
        @Email @NotBlank String email,
        @NotBlank String password,
        @NotBlank String fullName,
        String employeeId, String phone, Long departmentId, String roleName
    ) {}

    public record UpdateUserRequest(
        String fullName, String employeeId, String phone,
        Long departmentId, String roleName, Boolean active, String newPassword
    ) {}

    public record RoleDto(Long id, String name, String description) {}

    public record DepartmentDto(Long id, String name, String description) {}

    public record CreateDepartmentRequest(@NotBlank String name, String description) {}

    public record AuditLogDto(Long id, Long userId, String userEmail, String action,
                              String entityType, Long entityId, String details, String createdAt) {}
}