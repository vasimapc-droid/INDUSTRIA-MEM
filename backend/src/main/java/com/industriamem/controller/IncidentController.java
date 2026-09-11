package com.industriamem.controller;

import com.industriamem.entity.*;
import com.industriamem.repository.*;
import com.industriamem.exception.ApiException;
import com.industriamem.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.industriamem.audit.Auditable;

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
    @Auditable(action = "INCIDENT_CREATED", entityType = "INCIDENT")
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
    @Auditable(action = "INCIDENT_UPDATED", entityType = "INCIDENT")
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
    @Auditable(action = "INCIDENT_DELETED", entityType = "INCIDENT")
    public void delete(@PathVariable Long id) { incidentRepository.deleteById(id); }
}