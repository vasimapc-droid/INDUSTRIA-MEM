package com.industriamem.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "expert_profiles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ExpertProfile {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", unique = true, nullable = false)
    private Long userId;

    @Column(name = "years_experience")
    private Integer yearsExperience;

    @Column(columnDefinition = "TEXT")
    private String specialties;

    @Column(columnDefinition = "TEXT")
    private String skills;

    @Column(columnDefinition = "TEXT")
    private String certifications;

    @Column(columnDefinition = "TEXT")
    private String bio;

    private Boolean available = true;

    @Column(name = "contribution_count")
    private Integer contributionCount = 0;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() { if (createdAt == null) createdAt = LocalDateTime.now(); }
}