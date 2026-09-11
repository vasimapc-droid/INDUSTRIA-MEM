package com.industriamem.controller;

import com.industriamem.entity.*;
import com.industriamem.repository.*;
import com.industriamem.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final IncidentRepository incidentRepository;
    private final KnowledgeRepository knowledgeRepository;
    private final MachineRepository machineRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final ExpertRequestRepository expertRequestRepository;
    private final AuditLogRepository auditLogRepository;

    // ============ TECHNICIAN ============

    @GetMapping("/technician")
    public Map<String,Object> technician(@CurrentUser User me) {
        Map<String,Object> out = new LinkedHashMap<>();

        long myOpen = incidentRepository.findByReportedByIdOrderByIncidentDateDesc(me.getId())
                .stream()
                .filter(i -> "OPEN".equals(i.getStatus()) || "INVESTIGATING".equals(i.getStatus()))
                .count();

        LocalDateTime monthAgo = LocalDateTime.now().minusDays(30);
        long myRecentReports = incidentRepository.findByReportedByIdOrderByIncidentDateDesc(me.getId())
                .stream()
                .filter(i -> i.getIncidentDate() != null && i.getIncidentDate().isAfter(monthAgo))
                .count();

        long myPendingRequests = expertRequestRepository.findByRequesterIdOrderByCreatedAtDesc(me.getId())
                .stream()
                .filter(r -> "OPEN".equals(r.getStatus()))
                .count();

        long verifiedKnowledgeCount = knowledgeRepository.countByStatus("EXPERT_VERIFIED");

        out.put("myOpenIncidents", myOpen);
        out.put("myRecentReports", myRecentReports);
        out.put("myPendingRequests", myPendingRequests);
        out.put("verifiedKnowledgeCount", verifiedKnowledgeCount);

        List<Incident> myIncidents = incidentRepository
                .findByReportedByIdOrderByIncidentDateDesc(me.getId())
                .stream().limit(5).collect(Collectors.toList());
        out.put("myRecentIncidents", myIncidents);

        List<ExpertRequest> myRequests = expertRequestRepository
                .findByRequesterIdOrderByCreatedAtDesc(me.getId())
                .stream().limit(3).collect(Collectors.toList());
        out.put("myRecentRequests", myRequests);

        return out;
    }

    // ============ EXPERT ============

    @GetMapping("/expert")
    public Map<String,Object> expert(@CurrentUser User me) {
        Map<String,Object> out = new LinkedHashMap<>();

        long pendingVerification = knowledgeRepository.countByStatus("PENDING_VERIFICATION");
        long myVerifications = knowledgeRepository.findByStatusOrderByCreatedAtDesc("EXPERT_VERIFIED")
                .stream()
                .filter(k -> k.getVerifiedBy() != null && k.getVerifiedBy().getId().equals(me.getId()))
                .count();
        long openRequests = expertRequestRepository.countByExpertIdAndStatus(me.getId(), "OPEN");

        // "Knowledge I verified" total (all time, not just recent)
        long totalIVerified = myVerifications;

        out.put("pendingVerification", pendingVerification);
        out.put("openRequests", openRequests);
        out.put("myVerifications", myVerifications);
        out.put("totalIVerified", totalIVerified);

        // Recent pending knowledge (any machine)
        List<KnowledgeEntry> pending = knowledgeRepository.findByStatusOrderByCreatedAtDesc("PENDING_VERIFICATION")
                .stream().limit(5).collect(Collectors.toList());
        out.put("recentPending", pending);

        // Recent expert requests to me
        List<ExpertRequest> recentRequests = expertRequestRepository
                .findByExpertIdOrderByCreatedAtDesc(me.getId())
                .stream().limit(3).collect(Collectors.toList());
        out.put("recentRequests", recentRequests);

        // My recent verifications
        List<KnowledgeEntry> myVerified = knowledgeRepository.findByStatusOrderByCreatedAtDesc("EXPERT_VERIFIED")
                .stream()
                .filter(k -> k.getVerifiedBy() != null && k.getVerifiedBy().getId().equals(me.getId()))
                .limit(3).collect(Collectors.toList());
        out.put("myRecentVerifications", myVerified);

        return out;
    }

    // ============ ADMIN ============

    @GetMapping("/admin")
    public Map<String,Object> admin(@CurrentUser User me) {
        Map<String,Object> out = new LinkedHashMap<>();

        out.put("totalMachines", machineRepository.count());
        out.put("totalUsers", userRepository.count());
        out.put("pendingVerification", knowledgeRepository.countByStatus("PENDING_VERIFICATION"));
        out.put("activeIncidents",
                incidentRepository.findByStatusOrderByIncidentDateDesc("OPEN").size()
                + incidentRepository.findByStatusOrderByIncidentDateDesc("INVESTIGATING").size());

        // Recent incidents (5)
        List<Incident> recent = incidentRepository.findAll().stream()
                .sorted((a, b) -> {
                    LocalDateTime da = a.getIncidentDate() != null ? a.getIncidentDate() : a.getCreatedAt();
                    LocalDateTime db = b.getIncidentDate() != null ? b.getIncidentDate() : b.getCreatedAt();
                    return db.compareTo(da);
                })
                .limit(6).collect(Collectors.toList());
        out.put("recentIncidents", recent);

        // Recent audit events (5)
        List<Map<String,Object>> recentAudit = auditLogRepository.findTop100ByOrderByCreatedAtDesc()
                .stream().limit(5).map(a -> {
                    Map<String,Object> m = new LinkedHashMap<>();
                    m.put("id", a.getId());
                    m.put("action", a.getAction());
                    m.put("entityType", a.getEntityType());
                    m.put("details", a.getDetails());
                    m.put("createdAt", a.getCreatedAt());
                    if (a.getUserId() != null) {
                        userRepository.findById(a.getUserId())
                                .ifPresent(u -> m.put("userEmail", u.getEmail()));
                    }
                    return m;
                }).collect(Collectors.toList());
        out.put("recentAudit", recentAudit);

        // Recurring problems preview — group incidents by root cause, keep those with count >= 2
        Map<String, Long> recurring = incidentRepository.findAll().stream()
                .filter(i -> i.getRootCause() != null && !i.getRootCause().isBlank())
                .collect(Collectors.groupingBy(Incident::getRootCause, Collectors.counting()));
        List<Map<String,Object>> recurringList = recurring.entrySet().stream()
                .filter(e -> e.getValue() >= 2)
                .sorted(Map.Entry.<String,Long>comparingByValue().reversed())
                .limit(5)
                .map(e -> {
                    Map<String,Object> m = new LinkedHashMap<>();
                    m.put("rootCause", e.getKey());
                    m.put("count", e.getValue());
                    return m;
                }).collect(Collectors.toList());
        out.put("recurringProblems", recurringList);

        // Knowledge gaps — machines with 0 verified knowledge entries
        Set<Long> machinesWithKnowledge = knowledgeRepository.findByStatusOrderByCreatedAtDesc("EXPERT_VERIFIED")
                .stream()
                .filter(k -> k.getMachine() != null)
                .map(k -> k.getMachine().getId())
                .collect(Collectors.toSet());
        List<Map<String,Object>> gaps = machineRepository.findAll().stream()
                .filter(m -> !machinesWithKnowledge.contains(m.getId()))
                .limit(5)
                .map(m -> {
                    Map<String,Object> mm = new LinkedHashMap<>();
                    mm.put("id", m.getId());
                    mm.put("name", m.getName());
                    mm.put("code", m.getMachineCode());
                    return mm;
                }).collect(Collectors.toList());
        out.put("knowledgeGaps", gaps);

        return out;
    }
}