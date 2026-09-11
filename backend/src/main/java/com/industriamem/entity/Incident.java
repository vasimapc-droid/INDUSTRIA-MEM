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