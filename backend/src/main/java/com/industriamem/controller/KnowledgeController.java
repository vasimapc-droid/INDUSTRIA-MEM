package com.industriamem.controller;

import com.industriamem.entity.*;
import com.industriamem.exception.ApiException;
import com.industriamem.repository.*;
import com.industriamem.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.industriamem.audit.Auditable;

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
    @Auditable(action = "KNOWLEDGE_APPROVED", entityType = "KNOWLEDGE")
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
    @Auditable(action = "KNOWLEDGE_REJECTED", entityType = "KNOWLEDGE")
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

    // Public endpoint for AI service to fetch corpus (no auth needed)
    @GetMapping("/public/verified")
    public List<KnowledgeEntry> publicVerified() {
        return knowledgeRepository.findByStatusOrderByCreatedAtDesc("EXPERT_VERIFIED");
    }
}