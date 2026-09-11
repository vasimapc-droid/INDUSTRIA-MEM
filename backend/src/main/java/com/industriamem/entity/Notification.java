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