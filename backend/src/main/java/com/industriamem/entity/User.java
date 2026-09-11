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