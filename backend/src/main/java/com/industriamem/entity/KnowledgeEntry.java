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