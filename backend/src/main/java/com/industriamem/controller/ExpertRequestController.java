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
import java.util.Map;

@RestController
@RequestMapping("/api/expert-requests")
@RequiredArgsConstructor
public class ExpertRequestController {

    private final ExpertRequestRepository expertRequestRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final AuditLogRepository auditLogRepository;

    @PostMapping
    @Auditable(action = "EXPERT_REQUEST_CREATED", entityType = "EXPERT_REQUEST")
    public ExpertRequest create(@RequestBody Map<String,Object> body, @CurrentUser User me) {
        Object expertIdObj = body.get("expertId");
        if (expertIdObj == null) throw new ApiException("expertId is required");

        Long expertId = Long.valueOf(expertIdObj.toString());
        User expert = userRepository.findById(expertId)
                .orElseThrow(() -> new ApiException("Expert not found"));

        String subject = (String) body.getOrDefault("subject", "");
        String question = (String) body.getOrDefault("question", "");
        if (subject.isBlank() || question.isBlank()) {
            throw new ApiException("Subject and question are required");
        }

        Long machineId = body.get("machineId") != null && !body.get("machineId").toString().isBlank()
                ? Long.valueOf(body.get("machineId").toString()) : null;
        Long incidentId = body.get("incidentId") != null && !body.get("incidentId").toString().isBlank()
                ? Long.valueOf(body.get("incidentId").toString()) : null;

        ExpertRequest req = ExpertRequest.builder()
                .requester(me)
                .expert(expert)
                .subject(subject)
                .question(question)
                .machineId(machineId)
                .incidentId(incidentId)
                .status("OPEN")
                .build();
        expertRequestRepository.save(req);

        // Notify expert
        notificationRepository.save(Notification.builder()
                .userId(expert.getId())
                .title("New expert request")
                .message(me.getFullName() + " asked: " + subject)
                .type("EXPERT_REQUEST")
                .referenceId(req.getId())
                .build());

        auditLogRepository.save(AuditLog.builder()
                .userId(me.getId())
                .action("EXPERT_REQUEST_CREATED")
                .entityType("EXPERT_REQUEST")
                .entityId(req.getId())
                .details("To: " + expert.getEmail() + " â€” " + subject)
                .build());

        return req;
    }

    @GetMapping("/mine")
    public List<ExpertRequest> myRequests(@CurrentUser User me) {
        return expertRequestRepository.findByRequesterIdOrderByCreatedAtDesc(me.getId());
    }

    @GetMapping("/inbox")
    @PreAuthorize("hasAnyRole('EXPERT','ADMIN')")
    public List<ExpertRequest> inbox(@CurrentUser User me) {
        return expertRequestRepository.findByExpertIdOrderByCreatedAtDesc(me.getId());
    }

    @GetMapping("/inbox/open-count")
    @PreAuthorize("hasAnyRole('EXPERT','ADMIN')")
    public long openCount(@CurrentUser User me) {
        return expertRequestRepository.countByExpertIdAndStatus(me.getId(), "OPEN");
    }

    @GetMapping("/{id}")
    public ExpertRequest get(@PathVariable Long id, @CurrentUser User me) {
        ExpertRequest r = expertRequestRepository.findById(id)
                .orElseThrow(() -> new ApiException("Request not found"));
        boolean allowed = r.getRequester().getId().equals(me.getId())
                || (r.getExpert() != null && r.getExpert().getId().equals(me.getId()))
                || "ADMIN".equals(me.getRole().getName());
        if (!allowed) throw new ApiException("Not allowed");
        return r;
    }

    @PostMapping("/{id}/respond")
    @PreAuthorize("hasAnyRole('EXPERT','ADMIN')")
    @Auditable(action = "EXPERT_REQUEST_ANSWERED", entityType = "EXPERT_REQUEST")
    public ExpertRequest respond(@PathVariable Long id, @RequestBody Map<String,String> body, @CurrentUser User me) {
        ExpertRequest r = expertRequestRepository.findById(id)
                .orElseThrow(() -> new ApiException("Request not found"));

        if (r.getExpert() == null || !r.getExpert().getId().equals(me.getId())) {
            if (!"ADMIN".equals(me.getRole().getName())) {
                throw new ApiException("Only the assigned expert can respond");
            }
        }

        String response = body.get("response");
        if (response == null || response.isBlank()) throw new ApiException("Response is required");

        r.setResponse(response);
        r.setStatus("ANSWERED");
        r.setRespondedAt(LocalDateTime.now());
        expertRequestRepository.save(r);

        // Notify requester
        notificationRepository.save(Notification.builder()
                .userId(r.getRequester().getId())
                .title("Expert replied")
                .message(me.getFullName() + " answered: " + r.getSubject())
                .type("EXPERT_RESPONSE")
                .referenceId(r.getId())
                .build());

        auditLogRepository.save(AuditLog.builder()
                .userId(me.getId())
                .action("EXPERT_REQUEST_ANSWERED")
                .entityType("EXPERT_REQUEST")
                .entityId(r.getId())
                .details(r.getSubject())
                .build());

        return r;
    }

    @PatchMapping("/{id}/close")
    public ExpertRequest close(@PathVariable Long id, @CurrentUser User me) {
        ExpertRequest r = expertRequestRepository.findById(id)
                .orElseThrow(() -> new ApiException("Request not found"));
        if (!r.getRequester().getId().equals(me.getId()) && !"ADMIN".equals(me.getRole().getName())) {
            throw new ApiException("Only requester can close");
        }
        r.setStatus("CLOSED");
        return expertRequestRepository.save(r);
    }
}