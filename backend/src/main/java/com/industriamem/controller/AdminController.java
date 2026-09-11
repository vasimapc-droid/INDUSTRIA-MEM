package com.industriamem.controller;

import com.industriamem.dto.AdminDtos.*;
import com.industriamem.entity.*;
import com.industriamem.exception.ApiException;
import com.industriamem.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogRepository auditLogRepository;
    private final MachineRepository machineRepository;
    private final NotificationRepository notificationRepository;

    private UserDto toDto(User u) {
        return new UserDto(
                u.getId(), u.getEmail(), u.getFullName(), u.getEmployeeId(), u.getPhone(),
                u.getDepartment() != null ? u.getDepartment().getId() : null,
                u.getDepartment() != null ? u.getDepartment().getName() : null,
                u.getRole() != null ? u.getRole().getId() : null,
                u.getRole() != null ? u.getRole().getName() : null,
                u.getActive()
        );
    }

    // ==================== USERS ====================

    @GetMapping("/users")
    public List<UserDto> listUsers() {
        return userRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @GetMapping("/users/{id}")
    public UserDto getUser(@PathVariable Long id) {
        User u = userRepository.findById(id).orElseThrow(() -> new ApiException("User not found"));
        return toDto(u);
    }

    @PostMapping("/users")
    public UserDto createUser(@RequestBody CreateUserRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new ApiException("Email already registered");
        }
        Role role = roleRepository.findByName(req.roleName() == null ? "TECHNICIAN" : req.roleName())
                .orElseThrow(() -> new ApiException("Role not found: " + req.roleName()));
        Department dept = req.departmentId() != null
                ? departmentRepository.findById(req.departmentId()).orElse(null) : null;

        User u = User.builder()
                .email(req.email())
                .password(passwordEncoder.encode(req.password()))
                .fullName(req.fullName())
                .employeeId(req.employeeId())
                .phone(req.phone())
                .department(dept)
                .role(role)
                .active(true)
                .build();
        userRepository.save(u);

        auditLogRepository.save(AuditLog.builder()
                .userId(u.getId())
                .action("USER_CREATED").entityType("USER").entityId(u.getId())
                .details("Created user " + u.getEmail() + " with role " + role.getName())
                .build());

        return toDto(u);
    }

    @PutMapping("/users/{id}")
    public UserDto updateUser(@PathVariable Long id, @RequestBody UpdateUserRequest req) {
        User u = userRepository.findById(id).orElseThrow(() -> new ApiException("User not found"));

        if (req.fullName() != null) u.setFullName(req.fullName());
        if (req.employeeId() != null) u.setEmployeeId(req.employeeId());
        if (req.phone() != null) u.setPhone(req.phone());
        if (req.active() != null) u.setActive(req.active());

        if (req.departmentId() != null) {
            if (req.departmentId() == 0) u.setDepartment(null);
            else {
                Department d = departmentRepository.findById(req.departmentId())
                        .orElseThrow(() -> new ApiException("Department not found"));
                u.setDepartment(d);
            }
        }

        if (req.roleName() != null && !req.roleName().isBlank()) {
            Role r = roleRepository.findByName(req.roleName())
                    .orElseThrow(() -> new ApiException("Role not found: " + req.roleName()));
            u.setRole(r);
        }

        if (req.newPassword() != null && !req.newPassword().isBlank()) {
            u.setPassword(passwordEncoder.encode(req.newPassword()));
        }

        userRepository.save(u);

        auditLogRepository.save(AuditLog.builder()
                .userId(u.getId())
                .action("USER_UPDATED").entityType("USER").entityId(u.getId())
                .details("Updated user " + u.getEmail())
                .build());

        return toDto(u);
    }

    @PatchMapping("/users/{id}/toggle-active")
    public UserDto toggleActive(@PathVariable Long id) {
        User u = userRepository.findById(id).orElseThrow(() -> new ApiException("User not found"));
        u.setActive(!Boolean.TRUE.equals(u.getActive()));
        userRepository.save(u);

        auditLogRepository.save(AuditLog.builder()
                .userId(u.getId())
                .action(u.getActive() ? "USER_ACTIVATED" : "USER_DEACTIVATED")
                .entityType("USER").entityId(u.getId())
                .details(u.getEmail() + " set " + (u.getActive() ? "active" : "inactive"))
                .build());

        return toDto(u);
    }

    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable Long id) {
        User u = userRepository.findById(id).orElseThrow(() -> new ApiException("User not found"));
        if ("ADMIN".equals(u.getRole().getName())) {
            long adminCount = userRepository.findAll().stream()
                    .filter(x -> x.getRole() != null && "ADMIN".equals(x.getRole().getName()))
                    .count();
            if (adminCount <= 1) throw new ApiException("Cannot delete the last admin");
        }
        String email = u.getEmail();
        userRepository.deleteById(id);

        auditLogRepository.save(AuditLog.builder()
                .action("USER_DELETED").entityType("USER").entityId(id)
                .details("Deleted user " + email)
                .build());
    }

    // ==================== DEPARTMENTS ====================

    @GetMapping("/departments")
    public List<DepartmentDto> listDepartments() {
        return departmentRepository.findAll().stream()
                .map(d -> new DepartmentDto(d.getId(), d.getName(), d.getDescription()))
                .collect(Collectors.toList());
    }

    @PostMapping("/departments")
    public DepartmentDto createDepartment(@RequestBody CreateDepartmentRequest req) {
        Department d = Department.builder().name(req.name()).description(req.description()).build();
        departmentRepository.save(d);

        auditLogRepository.save(AuditLog.builder()
                .action("DEPT_CREATED").entityType("DEPARTMENT").entityId(d.getId())
                .details("Created department " + d.getName())
                .build());

        return new DepartmentDto(d.getId(), d.getName(), d.getDescription());
    }

    @PutMapping("/departments/{id}")
    public DepartmentDto updateDepartment(@PathVariable Long id, @RequestBody CreateDepartmentRequest req) {
        Department d = departmentRepository.findById(id)
                .orElseThrow(() -> new ApiException("Department not found"));
        d.setName(req.name());
        d.setDescription(req.description());
        departmentRepository.save(d);

        auditLogRepository.save(AuditLog.builder()
                .action("DEPT_UPDATED").entityType("DEPARTMENT").entityId(d.getId())
                .details("Updated department " + d.getName())
                .build());

        return new DepartmentDto(d.getId(), d.getName(), d.getDescription());
    }

    @DeleteMapping("/departments/{id}")
    public void deleteDepartment(@PathVariable Long id) {
        Department d = departmentRepository.findById(id)
                .orElseThrow(() -> new ApiException("Department not found"));
        String name = d.getName();
        departmentRepository.deleteById(id);

        auditLogRepository.save(AuditLog.builder()
                .action("DEPT_DELETED").entityType("DEPARTMENT").entityId(id)
                .details("Deleted department " + name)
                .build());
    }

    // ==================== ROLES ====================

    @GetMapping("/roles")
    public List<RoleDto> listRoles() {
        return roleRepository.findAll().stream()
                .map(r -> new RoleDto(r.getId(), r.getName(), r.getDescription()))
                .collect(Collectors.toList());
    }

    // ==================== MACHINES ====================

    @GetMapping("/machines")
    public List<Machine> listMachines() {
        return machineRepository.findAll();
    }

    @PostMapping("/machines")
    public Machine createMachine(@RequestBody Machine m) {
        if (m.getMachineCode() == null || m.getMachineCode().isBlank()) {
            throw new ApiException("Machine code is required");
        }
        if (m.getName() == null || m.getName().isBlank()) {
            throw new ApiException("Machine name is required");
        }
        if (m.getStatus() == null || m.getStatus().isBlank()) {
            m.setStatus("OPERATIONAL");
        }
        Machine saved = machineRepository.save(m);

        auditLogRepository.save(AuditLog.builder()
                .action("MACHINE_CREATED").entityType("MACHINE").entityId(saved.getId())
                .details("Created machine " + saved.getMachineCode() + " (" + saved.getName() + ")")
                .build());

        return saved;
    }

    @PutMapping("/machines/{id}")
    public Machine updateMachine(@PathVariable Long id, @RequestBody Machine patch) {
        Machine m = machineRepository.findById(id)
                .orElseThrow(() -> new ApiException("Machine not found"));

        if (patch.getMachineCode() != null) m.setMachineCode(patch.getMachineCode());
        if (patch.getName() != null) m.setName(patch.getName());
        if (patch.getMachineType() != null) m.setMachineType(patch.getMachineType());
        if (patch.getDepartment() != null) m.setDepartment(patch.getDepartment());
        if (patch.getProductionLine() != null) m.setProductionLine(patch.getProductionLine());
        if (patch.getStatus() != null) m.setStatus(patch.getStatus());
        if (patch.getManufacturer() != null) m.setManufacturer(patch.getManufacturer());
        if (patch.getModel() != null) m.setModel(patch.getModel());
        if (patch.getSerialNumber() != null) m.setSerialNumber(patch.getSerialNumber());
        if (patch.getInstallationDate() != null) m.setInstallationDate(patch.getInstallationDate());
        if (patch.getLocation() != null) m.setLocation(patch.getLocation());
        if (patch.getDescription() != null) m.setDescription(patch.getDescription());

        Machine saved = machineRepository.save(m);

        auditLogRepository.save(AuditLog.builder()
                .action("MACHINE_UPDATED").entityType("MACHINE").entityId(saved.getId())
                .details("Updated machine " + saved.getMachineCode())
                .build());

        return saved;
    }

    @DeleteMapping("/machines/{id}")
    public void deleteMachine(@PathVariable Long id) {
        Machine m = machineRepository.findById(id)
                .orElseThrow(() -> new ApiException("Machine not found"));
        String code = m.getMachineCode();
        machineRepository.deleteById(id);

        auditLogRepository.save(AuditLog.builder()
                .action("MACHINE_DELETED").entityType("MACHINE").entityId(id)
                .details("Deleted machine " + code)
                .build());
    }

    // ==================== NOTIFICATIONS ====================

    @PostMapping("/notifications/broadcast")
    public Map<String,Object> broadcast(@RequestBody Map<String,String> body) {
        String title = body.getOrDefault("title", "").trim();
        String message = body.getOrDefault("message", "").trim();
        String audience = body.getOrDefault("audience", "ALL");

        if (title.isBlank() || message.isBlank()) {
            throw new ApiException("Title and message are required");
        }

        List<User> recipients;
        switch (audience) {
            case "TECHNICIANS" -> recipients = userRepository.findAll().stream()
                    .filter(u -> u.getRole() != null && "TECHNICIAN".equals(u.getRole().getName()))
                    .collect(Collectors.toList());
            case "EXPERTS" -> recipients = userRepository.findAll().stream()
                    .filter(u -> u.getRole() != null && "EXPERT".equals(u.getRole().getName()))
                    .collect(Collectors.toList());
            case "ADMINS" -> recipients = userRepository.findAll().stream()
                    .filter(u -> u.getRole() != null && "ADMIN".equals(u.getRole().getName()))
                    .collect(Collectors.toList());
            default -> recipients = userRepository.findAll().stream()
                    .filter(u -> Boolean.TRUE.equals(u.getActive()))
                    .collect(Collectors.toList());
        }

        for (User u : recipients) {
            notificationRepository.save(Notification.builder()
                    .userId(u.getId())
                    .title(title)
                    .message(message)
                    .type("BROADCAST")
                    .build());
        }

        auditLogRepository.save(AuditLog.builder()
                .action("NOTIFICATION_BROADCAST").entityType("NOTIFICATION")
                .details("To " + audience + " (" + recipients.size() + " users): " + title)
                .build());

        return Map.of("sent", recipients.size(), "audience", audience);
    }

    // ==================== AUDIT LOGS ====================

    @GetMapping("/audit-logs")
    public List<AuditLogDto> auditLogs(@RequestParam(required = false) String action,
                                       @RequestParam(required = false) Long userId) {
        List<AuditLog> logs;
        if (action != null && !action.isBlank()) {
            logs = auditLogRepository.findByActionOrderByCreatedAtDesc(action);
        } else if (userId != null) {
            logs = auditLogRepository.findByUserIdOrderByCreatedAtDesc(userId);
        } else {
            logs = auditLogRepository.findTop100ByOrderByCreatedAtDesc();
        }

        return logs.stream().map(a -> {
            String email = null;
            if (a.getUserId() != null) {
                email = userRepository.findById(a.getUserId())
                        .map(User::getEmail).orElse(null);
            }
            return new AuditLogDto(
                    a.getId(), a.getUserId(), email, a.getAction(),
                    a.getEntityType(), a.getEntityId(), a.getDetails(),
                    a.getCreatedAt() != null ? a.getCreatedAt().toString() : null
            );
        }).collect(Collectors.toList());
    }

    @GetMapping("/audit-logs/export")
    public ResponseEntity<byte[]> exportAuditLogs() {
        StringBuilder sb = new StringBuilder();
        sb.append("ID,Time,User,Action,EntityType,EntityId,Details,IP\n");
        for (AuditLog a : auditLogRepository.findTop100ByOrderByCreatedAtDesc()) {
            String email = a.getUserId() != null
                    ? userRepository.findById(a.getUserId()).map(User::getEmail).orElse("")
                    : "";
            sb.append(a.getId()).append(",")
              .append(a.getCreatedAt() != null ? a.getCreatedAt().toString() : "").append(",")
              .append(escape(email)).append(",")
              .append(escape(a.getAction())).append(",")
              .append(escape(a.getEntityType())).append(",")
              .append(a.getEntityId() != null ? a.getEntityId() : "").append(",")
              .append(escape(a.getDetails())).append(",")
              .append(escape(a.getIpAddress())).append("\n");
        }
        byte[] bytes = sb.toString().getBytes(StandardCharsets.UTF_8);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", "audit-logs.csv");
        return ResponseEntity.ok().headers(headers).body(bytes);
    }

    private String escape(Object o) {
        if (o == null) return "";
        String s = o.toString().replace("\"", "\"\"");
        if (s.contains(",") || s.contains("\"") || s.contains("\n")) {
            return "\"" + s + "\"";
        }
        return s;
    }
}