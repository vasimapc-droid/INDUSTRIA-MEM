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