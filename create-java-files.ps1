$BASE = "backend\src\main\java\com\industriamem"

function Write-File($path, $content) {
    $dir = Split-Path $path -Parent
    if (!(Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
    Set-Content -Path $path -Value $content -Encoding UTF8 -NoNewline
    Write-Host "  ✓ $path"
}

Write-Host "Writing Java files..."

Write-File "$BASE\IndustriaMemApplication.java" @"
package com.industriamem;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class IndustriaMemApplication {
    public static void main(String[] args) {
        SpringApplication.run(IndustriaMemApplication.class, args);
    }
}
"@

Write-File "$BASE\entity\Role.java" @"
package com.industriamem.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "roles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Role {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true, nullable = false) private String name;
    private String description;
}
"@

Write-File "$BASE\entity\Department.java" @"
package com.industriamem.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "departments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Department {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true, nullable = false) private String name;
    private String description;
}
"@

Write-File "$BASE\entity\User.java" @"
package com.industriamem.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true, nullable = false) private String email;
    @Column(nullable = false) private String password;
    @Column(name = "full_name", nullable = false) private String fullName;
    @Column(name = "employee_id") private String employeeId;
    private String phone;
    @ManyToOne(fetch = FetchType.EAGER) @JoinColumn(name = "department_id") private Department department;
    @ManyToOne(fetch = FetchType.EAGER) @JoinColumn(name = "role_id", nullable = false) private Role role;
    private Boolean active = true;
    @Column(name = "profile_image") private String profileImage;
    @Column(name = "created_at") private LocalDateTime createdAt;
    @Column(name = "updated_at") private LocalDateTime updatedAt;

    @PrePersist public void prePersist() { createdAt = LocalDateTime.now(); updatedAt = LocalDateTime.now(); }
    @PreUpdate  public void preUpdate()  { updatedAt = LocalDateTime.now(); }
}
"@

Write-File "$BASE\entity\Machine.java" @"
package com.industriamem.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "machines")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Machine {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "machine_code", unique = true, nullable = false) private String machineCode;
    @Column(nullable = false) private String name;
    @Column(name = "machine_type") private String machineType;
    @ManyToOne @JoinColumn(name = "department_id") private Department department;
    @Column(name = "production_line") private String productionLine;
    private String status;
    private String manufacturer;
    private String model;
    @Column(name = "serial_number") private String serialNumber;
    @Column(name = "installation_date") private LocalDate installationDate;
    private String location;
    @Column(columnDefinition = "TEXT") private String description;
    @Column(name = "qr_code_url") private String qrCodeUrl;
    @Column(name = "created_at") private LocalDateTime createdAt;
    @Column(name = "updated_at") private LocalDateTime updatedAt;

    @PrePersist public void prePersist() { createdAt = LocalDateTime.now(); updatedAt = LocalDateTime.now(); }
    @PreUpdate  public void preUpdate()  { updatedAt = LocalDateTime.now(); }
}
"@

Write-File "$BASE\entity\Incident.java" @"
package com.industriamem.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "incidents")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Incident {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false) private String title;
    @Column(columnDefinition = "TEXT") private String description;
    @Column(columnDefinition = "TEXT") private String symptoms;
    @ManyToOne @JoinColumn(name = "machine_id") private Machine machine;
    @ManyToOne @JoinColumn(name = "department_id") private Department department;
    @Column(name = "production_line") private String productionLine;
    @Column(nullable = false) private String priority = "MEDIUM";
    @Column(nullable = false) private String status = "OPEN";
    @ManyToOne @JoinColumn(name = "reported_by", nullable = false) private User reportedBy;
    @ManyToOne @JoinColumn(name = "assigned_to") private User assignedTo;
    @Column(name = "incident_date") private LocalDateTime incidentDate;
    @Column(name = "resolved_at") private LocalDateTime resolvedAt;
    @Column(name = "troubleshooting_performed", columnDefinition = "TEXT") private String troubleshootingPerformed;
    @Column(name = "root_cause", columnDefinition = "TEXT") private String rootCause;
    @Column(columnDefinition = "TEXT") private String solution;
    @Column(name = "additional_notes", columnDefinition = "TEXT") private String additionalNotes;
    @Column(name = "photo_urls", columnDefinition = "TEXT") private String photoUrls;
    @Column(name = "voice_url") private String voiceUrl;
    @Column(columnDefinition = "TEXT") private String transcript;
    @Column(name = "ai_generated") private Boolean aiGenerated = false;
    @Column(name = "verification_status") private String verificationStatus = "AI_GENERATED";
    @Column(name = "created_at") private LocalDateTime createdAt;
    @Column(name = "updated_at") private LocalDateTime updatedAt;

    @PrePersist public void prePersist() {
        createdAt = LocalDateTime.now(); updatedAt = LocalDateTime.now();
        if (incidentDate == null) incidentDate = LocalDateTime.now();
    }
    @PreUpdate public void preUpdate() { updatedAt = LocalDateTime.now(); }
}
"@

Write-File "$BASE\entity\KnowledgeEntry.java" @"
package com.industriamem.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "knowledge_entries")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class KnowledgeEntry {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "incident_id") private Long incidentId;
    @ManyToOne @JoinColumn(name = "machine_id") private Machine machine;
    @Column(nullable = false) private String title;
    @Column(columnDefinition = "TEXT") private String problem;
    @Column(columnDefinition = "TEXT") private String symptoms;
    @Column(name = "possible_cause", columnDefinition = "TEXT") private String possibleCause;
    @Column(name = "root_cause", columnDefinition = "TEXT") private String rootCause;
    @Column(name = "troubleshooting_steps", columnDefinition = "TEXT") private String troubleshootingSteps;
    @Column(columnDefinition = "TEXT") private String solution;
    @Column(name = "safety_notes", columnDefinition = "TEXT") private String safetyNotes;
    @Column(name = "parts_components", columnDefinition = "TEXT") private String partsComponents;
    private String severity;
    private String category;
    @Column(nullable = false) private String status = "AI_GENERATED";
    @ManyToOne @JoinColumn(name = "submitted_by", nullable = false) private User submittedBy;
    @ManyToOne @JoinColumn(name = "verified_by") private User verifiedBy;
    @Column(name = "verified_at") private LocalDateTime verifiedAt;
    @Column(name = "expert_comment", columnDefinition = "TEXT") private String expertComment;
    @Column(name = "helpful_count") private Integer helpfulCount = 0;
    @Column(name = "view_count") private Integer viewCount = 0;
    @Column(name = "created_at") private LocalDateTime createdAt;
    @Column(name = "updated_at") private LocalDateTime updatedAt;

    @PrePersist public void prePersist() { createdAt = LocalDateTime.now(); updatedAt = LocalDateTime.now(); }
    @PreUpdate public void preUpdate() { updatedAt = LocalDateTime.now(); }
}
"@

Write-File "$BASE\entity\Notification.java" @"
package com.industriamem.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Notification {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "user_id", nullable = false) private Long userId;
    @Column(nullable = false) private String title;
    @Column(columnDefinition = "TEXT") private String message;
    private String type;
    @Column(name = "reference_id") private Long referenceId;
    @Column(name = "is_read") private Boolean isRead = false;
    @Column(name = "created_at") private LocalDateTime createdAt;

    @PrePersist public void prePersist() { createdAt = LocalDateTime.now(); }
}
"@

Write-File "$BASE\repository\UserRepository.java" @"
package com.industriamem.repository;

import com.industriamem.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}
"@

Write-File "$BASE\repository\RoleRepository.java" @"
package com.industriamem.repository;

import com.industriamem.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(String name);
}
"@

Write-File "$BASE\repository\DepartmentRepository.java" @"
package com.industriamem.repository;

import com.industriamem.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DepartmentRepository extends JpaRepository<Department, Long> {}
"@

Write-File "$BASE\repository\MachineRepository.java" @"
package com.industriamem.repository;

import com.industriamem.entity.Machine;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface MachineRepository extends JpaRepository<Machine, Long> {
    Optional<Machine> findByMachineCode(String machineCode);
    List<Machine> findByDepartmentId(Long departmentId);
}
"@

Write-File "$BASE\repository\IncidentRepository.java" @"
package com.industriamem.repository;

import com.industriamem.entity.Incident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface IncidentRepository extends JpaRepository<Incident, Long> {
    List<Incident> findByMachineIdOrderByIncidentDateDesc(Long machineId);
    List<Incident> findByReportedByIdOrderByIncidentDateDesc(Long userId);
    List<Incident> findByStatusOrderByIncidentDateDesc(String status);

    @Query("SELECT i.machine.name, COUNT(i) FROM Incident i GROUP BY i.machine.name")
    List<Object[]> countByMachine();

    @Query("SELECT i.priority, COUNT(i) FROM Incident i GROUP BY i.priority")
    List<Object[]> countByPriority();
}
"@

Write-File "$BASE\repository\KnowledgeRepository.java" @"
package com.industriamem.repository;

import com.industriamem.entity.KnowledgeEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface KnowledgeRepository extends JpaRepository<KnowledgeEntry, Long> {
    List<KnowledgeEntry> findByStatusOrderByCreatedAtDesc(String status);
    List<KnowledgeEntry> findByMachineIdOrderByCreatedAtDesc(Long machineId);
    long countByStatus(String status);
}
"@

Write-File "$BASE\repository\NotificationRepository.java" @"
package com.industriamem.repository;

import com.industriamem.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    long countByUserIdAndIsReadFalse(Long userId);
}
"@

Write-File "$BASE\exception\ApiException.java" @"
package com.industriamem.exception;

public class ApiException extends RuntimeException {
    public ApiException(String message) { super(message); }
}
"@

Write-File "$BASE\exception\GlobalExceptionHandler.java" @"
package com.industriamem.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<?> handleApi(ApiException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidation(MethodArgumentNotValidException ex) {
        String msg = ex.getBindingResult().getFieldError() != null
                ? ex.getBindingResult().getFieldError().getDefaultMessage()
                : "Validation failed";
        return ResponseEntity.badRequest().body(Map.of("error", msg));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<?> handleDenied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGeneric(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", ex.getMessage() == null ? "Server error" : ex.getMessage()));
    }
}
"@

Write-File "$BASE\security\JwtService.java" @"
package com.industriamem.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {

    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.expiration-ms}")
    private long expirationMs;

    private SecretKey key() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(String email, Long userId, String role) {
        Date now = new Date();
        return Jwts.builder()
                .subject(email)
                .claims(Map.of("uid", userId, "role", role))
                .issuedAt(now)
                .expiration(new Date(now.getTime() + expirationMs))
                .signWith(key())
                .compact();
    }

    public Claims parse(String token) {
        return Jwts.parser().verifyWith(key()).build()
                .parseSignedClaims(token).getPayload();
    }
}
"@

Write-File "$BASE\security\CustomUserDetailsService.java" @"
package com.industriamem.security;

import com.industriamem.entity.User;
import com.industriamem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().getName()))
        );
    }
}
"@

Write-File "$BASE\security\JwtAuthFilter.java" @"
package com.industriamem.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        String authHeader = req.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                String token = authHeader.substring(7);
                Claims claims = jwtService.parse(token);
                String email = claims.getSubject();
                if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                    UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(req));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            } catch (Exception ignored) {}
        }
        chain.doFilter(req, res);
    }
}
"@

Write-File "$BASE\security\CurrentUser.java" @"
package com.industriamem.security;

import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.lang.annotation.*;

@Target({ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@AuthenticationPrincipal(expression = "@userService.loadByEmail(#this.username)")
public @interface CurrentUser {}
"@

Write-File "$BASE\service\UserService.java" @"
package com.industriamem.service;

import com.industriamem.entity.User;
import com.industriamem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service("userService")
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public User loadByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    public User get(Long id) {
        return userRepository.findById(id).orElse(null);
    }
}
"@

Write-File "$BASE\service\FileStorageService.java" @"
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
"@

Write-File "$BASE\config\SecurityConfig.java" @"
package com.industriamem.config;

import com.industriamem.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Value("\${app.cors.origins}")
    private String corsOrigins;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
            .cors(c -> c.configurationSource(corsConfigurationSource()))
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/uploads/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/machines/**").authenticated()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOrigins(Arrays.asList(corsOrigins.split(",")));
        cfg.setAllowedMethods(List.of("GET","POST","PUT","DELETE","PATCH","OPTIONS"));
        cfg.setAllowedHeaders(List.of("*"));
        cfg.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
        src.registerCorsConfiguration("/**", cfg);
        return src;
    }

    @Bean
    public PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration cfg) throws Exception {
        return cfg.getAuthenticationManager();
    }
}
"@

Write-File "$BASE\config\WebMvcConfig.java" @"
package com.industriamem.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("\${app.upload.dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String location = Paths.get(uploadDir).toAbsolutePath().toUri().toString();
        registry.addResourceHandler("/uploads/**").addResourceLocations(location);
    }
}
"@

Write-File "$BASE\config\RestTemplateConfig.java" @"
package com.industriamem.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class RestTemplateConfig {
    @Bean
    public RestTemplate restTemplate() { return new RestTemplate(); }
}
"@

Write-File "$BASE\dto\AuthDtos.java" @"
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
"@

Write-File "$BASE\controller\AuthController.java" @"
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
"@

Write-File "$BASE\controller\MachineController.java" @"
package com.industriamem.controller;

import com.industriamem.entity.Machine;
import com.industriamem.repository.MachineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/machines")
@RequiredArgsConstructor
public class MachineController {

    private final MachineRepository machineRepository;

    @GetMapping
    public List<Machine> list() { return machineRepository.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<Machine> get(@PathVariable Long id) {
        return machineRepository.findById(id).map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Machine create(@RequestBody Machine m) { return machineRepository.save(m); }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Machine update(@PathVariable Long id, @RequestBody Machine m) {
        m.setId(id);
        return machineRepository.save(m);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        machineRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
"@

Write-File "$BASE\controller\IncidentController.java" @"
package com.industriamem.controller;

import com.industriamem.entity.*;
import com.industriamem.repository.*;
import com.industriamem.exception.ApiException;
import com.industriamem.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/incidents")
@RequiredArgsConstructor
public class IncidentController {

    private final IncidentRepository incidentRepository;
    private final MachineRepository machineRepository;
    private final NotificationRepository notificationRepository;

    @GetMapping
    public List<Incident> list() { return incidentRepository.findAll(); }

    @GetMapping("/{id}")
    public Incident get(@PathVariable Long id) {
        return incidentRepository.findById(id).orElseThrow(() -> new ApiException("Incident not found"));
    }

    @GetMapping("/by-machine/{machineId}")
    public List<Incident> byMachine(@PathVariable Long machineId) {
        return incidentRepository.findByMachineIdOrderByIncidentDateDesc(machineId);
    }

    @GetMapping("/my")
    public List<Incident> my(@CurrentUser User user) {
        return incidentRepository.findByReportedByIdOrderByIncidentDateDesc(user.getId());
    }

    @PostMapping
    public Incident create(@RequestBody Incident req, @CurrentUser User user) {
        if (req.getMachine() == null || req.getMachine().getId() == null) {
            throw new ApiException("Machine is required");
        }
        Machine machine = machineRepository.findById(req.getMachine().getId())
                .orElseThrow(() -> new ApiException("Machine not found"));
        req.setMachine(machine);
        req.setReportedBy(user);
        if (machine.getDepartment() != null) req.setDepartment(machine.getDepartment());
        if (req.getProductionLine() == null) req.setProductionLine(machine.getProductionLine());
        if (req.getIncidentDate() == null) req.setIncidentDate(LocalDateTime.now());
        if (req.getPriority() == null) req.setPriority("MEDIUM");
        if (req.getStatus() == null) req.setStatus("OPEN");
        return incidentRepository.save(req);
    }

    @PutMapping("/{id}")
    public Incident update(@PathVariable Long id, @RequestBody Incident patch, @CurrentUser User user) {
        Incident existing = incidentRepository.findById(id)
                .orElseThrow(() -> new ApiException("Incident not found"));
        boolean isOwner = existing.getReportedBy().getId().equals(user.getId());
        boolean isExpert = user.getRole().getName().equals("EXPERT") || user.getRole().getName().equals("ADMIN");
        if (!isOwner && !isExpert) throw new ApiException("Not allowed");

        if (patch.getStatus() != null) existing.setStatus(patch.getStatus());
        if (patch.getPriority() != null) existing.setPriority(patch.getPriority());
        if (patch.getRootCause() != null) existing.setRootCause(patch.getRootCause());
        if (patch.getSolution() != null) existing.setSolution(patch.getSolution());
        if (patch.getTroubleshootingPerformed() != null) existing.setTroubleshootingPerformed(patch.getTroubleshootingPerformed());
        if (patch.getAdditionalNotes() != null) existing.setAdditionalNotes(patch.getAdditionalNotes());
        if (patch.getVerificationStatus() != null) existing.setVerificationStatus(patch.getVerificationStatus());
        if ("RESOLVED".equals(existing.getStatus()) && existing.getResolvedAt() == null) {
            existing.setResolvedAt(LocalDateTime.now());
        }
        Incident saved = incidentRepository.save(existing);

        if (saved.getStatus().equals("RESOLVED") || saved.getStatus().equals("CLOSED")) {
            Notification n = Notification.builder()
                    .userId(saved.getReportedBy().getId())
                    .title("Incident resolved")
                    .message("Incident #" + saved.getId() + " has been resolved.")
                    .type("INCIDENT")
                    .referenceId(saved.getId())
                    .build();
            notificationRepository.save(n);
        }
        return saved;
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Long id) { incidentRepository.deleteById(id); }
}
"@

Write-File "$BASE\controller\KnowledgeController.java" @"
package com.industriamem.controller;

import com.industriamem.entity.*;
import com.industriamem.exception.ApiException;
import com.industriamem.repository.*;
import com.industriamem.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/knowledge")
@RequiredArgsConstructor
public class KnowledgeController {

    private final KnowledgeRepository knowledgeRepository;
    private final MachineRepository machineRepository;
    private final NotificationRepository notificationRepository;

    @GetMapping
    public List<KnowledgeEntry> list() { return knowledgeRepository.findAll(); }

    @GetMapping("/verified")
    public List<KnowledgeEntry> verified() {
        return knowledgeRepository.findByStatusOrderByCreatedAtDesc("EXPERT_VERIFIED");
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('EXPERT','ADMIN')")
    public List<KnowledgeEntry> pending() {
        return knowledgeRepository.findByStatusOrderByCreatedAtDesc("PENDING_VERIFICATION");
    }

    @GetMapping("/{id}")
    public KnowledgeEntry get(@PathVariable Long id) {
        KnowledgeEntry k = knowledgeRepository.findById(id).orElseThrow(() -> new ApiException("Not found"));
        k.setViewCount((k.getViewCount() == null ? 0 : k.getViewCount()) + 1);
        return knowledgeRepository.save(k);
    }

    @PostMapping
    public KnowledgeEntry create(@RequestBody KnowledgeEntry req, @CurrentUser User user) {
        if (req.getMachine() != null && req.getMachine().getId() != null) {
            Machine m = machineRepository.findById(req.getMachine().getId())
                    .orElseThrow(() -> new ApiException("Machine not found"));
            req.setMachine(m);
        }
        req.setSubmittedBy(user);
        req.setStatus("PENDING_VERIFICATION");
        return knowledgeRepository.save(req);
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('EXPERT','ADMIN')")
    public KnowledgeEntry approve(@PathVariable Long id, @CurrentUser User user,
                                  @RequestBody(required = false) KnowledgeEntry patch) {
        KnowledgeEntry k = knowledgeRepository.findById(id).orElseThrow(() -> new ApiException("Not found"));
        if (patch != null) {
            if (patch.getRootCause() != null) k.setRootCause(patch.getRootCause());
            if (patch.getSolution() != null) k.setSolution(patch.getSolution());
            if (patch.getTroubleshootingSteps() != null) k.setTroubleshootingSteps(patch.getTroubleshootingSteps());
            if (patch.getSafetyNotes() != null) k.setSafetyNotes(patch.getSafetyNotes());
            if (patch.getExpertComment() != null) k.setExpertComment(patch.getExpertComment());
        }
        k.setStatus("EXPERT_VERIFIED");
        k.setVerifiedBy(user);
        k.setVerifiedAt(LocalDateTime.now());
        KnowledgeEntry saved = knowledgeRepository.save(k);

        Notification n = Notification.builder()
                .userId(saved.getSubmittedBy().getId())
                .title("Knowledge verified")
                .message("Your knowledge entry '" + saved.getTitle() + "' was verified by " + user.getFullName())
                .type("KNOWLEDGE_VERIFIED")
                .referenceId(saved.getId())
                .build();
        notificationRepository.save(n);
        return saved;
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('EXPERT','ADMIN')")
    public KnowledgeEntry reject(@PathVariable Long id, @CurrentUser User user,
                                 @RequestBody(required = false) KnowledgeEntry patch) {
        KnowledgeEntry k = knowledgeRepository.findById(id).orElseThrow(() -> new ApiException("Not found"));
        if (patch != null && patch.getExpertComment() != null) k.setExpertComment(patch.getExpertComment());
        k.setStatus("REJECTED");
        k.setVerifiedBy(user);
        k.setVerifiedAt(LocalDateTime.now());
        return knowledgeRepository.save(k);
    }

    @PostMapping("/{id}/helpful")
    public KnowledgeEntry markHelpful(@PathVariable Long id) {
        KnowledgeEntry k = knowledgeRepository.findById(id).orElseThrow(() -> new ApiException("Not found"));
        k.setHelpfulCount((k.getHelpfulCount() == null ? 0 : k.getHelpfulCount()) + 1);
        return knowledgeRepository.save(k);
    }
}
"@

Write-File "$BASE\controller\NotificationController.java" @"
package com.industriamem.controller;

import com.industriamem.entity.*;
import com.industriamem.repository.*;
import com.industriamem.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;

    @GetMapping
    public List<Notification> mine(@CurrentUser User user) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    @GetMapping("/unread-count")
    public long unread(@CurrentUser User user) {
        return notificationRepository.countByUserIdAndIsReadFalse(user.getId());
    }

    @PatchMapping("/{id}/read")
    public Notification markRead(@PathVariable Long id, @CurrentUser User user) {
        Notification n = notificationRepository.findById(id).orElseThrow();
        if (!n.getUserId().equals(user.getId())) throw new RuntimeException("Not allowed");
        n.setIsRead(true);
        return notificationRepository.save(n);
    }
}
"@

Write-File "$BASE\controller\FileController.java" @"
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

    @PostMapping("/upload/document")
    public Map<String,String> doc(@RequestParam("file") MultipartFile file) {
        return Map.of("url", storage.save(file, "documents"));
    }
}
"@

Write-File "$BASE\controller\AiController.java" @"
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

    @Value("\${app.ai.service-url}")
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
"@

Write-File "$BASE\controller\ExpertController.java" @"
package com.industriamem.controller;

import com.industriamem.entity.User;
import com.industriamem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/experts")
@RequiredArgsConstructor
public class ExpertController {

    private final UserRepository userRepository;

    @GetMapping
    public List<Map<String,Object>> list() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() != null && "EXPERT".equals(u.getRole().getName()))
                .map(u -> {
                    Map<String,Object> m = new LinkedHashMap<>();
                    m.put("id", u.getId());
                    m.put("fullName", u.getFullName());
                    m.put("email", u.getEmail());
                    m.put("department", u.getDepartment() != null ? u.getDepartment().getName() : "");
                    return m;
                }).collect(Collectors.toList());
    }

    @GetMapping("/find")
    public List<Map<String,Object>> find(@RequestParam(required = false) String skill,
                                         @RequestParam(required = false) String department) {
        String skillLower = skill != null ? skill.toLowerCase() : null;
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() != null && "EXPERT".equals(u.getRole().getName()))
                .filter(u -> department == null || (u.getDepartment() != null &&
                        department.equalsIgnoreCase(u.getDepartment().getName())))
                .map(u -> {
                    Map<String,Object> m = new LinkedHashMap<>();
                    m.put("id", u.getId());
                    m.put("fullName", u.getFullName());
                    m.put("email", u.getEmail());
                    m.put("department", u.getDepartment() != null ? u.getDepartment().getName() : "");
                    m.put("matchScore", skillLower != null && (u.getFullName().toLowerCase().contains(skillLower)
                            || (u.getDepartment() != null && u.getDepartment().getName().toLowerCase().contains(skillLower))) ? 95 : 70);
                    return m;
                }).sorted((a,b) -> Integer.compare((int)b.get("matchScore"), (int)a.get("matchScore")))
                .collect(Collectors.toList());
    }
}
"@

Write-File "$BASE\controller\AnalyticsController.java" @"
package com.industriamem.controller;

import com.industriamem.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final IncidentRepository incidentRepository;
    private final KnowledgeRepository knowledgeRepository;
    private final MachineRepository machineRepository;
    private final UserRepository userRepository;

    @GetMapping("/summary")
    public Map<String,Object> summary() {
        Map<String,Object> m = new LinkedHashMap<>();
        m.put("totalMachines", machineRepository.count());
        m.put("totalIncidents", incidentRepository.count());
        m.put("totalKnowledge", knowledgeRepository.count());
        m.put("verifiedKnowledge", knowledgeRepository.countByStatus("EXPERT_VERIFIED"));
        m.put("pendingVerification", knowledgeRepository.countByStatus("PENDING_VERIFICATION"));
        m.put("activeIncidents", incidentRepository.findByStatusOrderByIncidentDateDesc("OPEN").size()
                + incidentRepository.findByStatusOrderByIncidentDateDesc("INVESTIGATING").size());
        m.put("totalUsers", userRepository.count());
        return m;
    }

    @GetMapping("/incidents-by-machine")
    public List<Map<String,Object>> incidentsByMachine() {
        List<Map<String,Object>> out = new ArrayList<>();
        for (Object[] row : incidentRepository.countByMachine())
            out.add(Map.of("name", row[0], "count", row[1]));
        return out;
    }

    @GetMapping("/incidents-by-priority")
    public List<Map<String,Object>> incidentsByPriority() {
        List<Map<String,Object>> out = new ArrayList<>();
        for (Object[] row : incidentRepository.countByPriority())
            out.add(Map.of("name", row[0], "count", row[1]));
        return out;
    }
}
"@

Write-Host ""
Write-Host "All Java files written."
