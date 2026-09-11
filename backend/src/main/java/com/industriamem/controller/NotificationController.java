package com.industriamem.controller;

import com.industriamem.entity.*;
import com.industriamem.repository.*;
import com.industriamem.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;

    @GetMapping
    public List<Notification> mine(@CurrentUser User user) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    @GetMapping("/unread-count")
    public long unread(@CurrentUser User user) {
        return notificationRepository.countByUserIdAndIsReadFalse(user.getId());
    }

    @PatchMapping("/{id}/read")
    public Notification markRead(@PathVariable Long id, @CurrentUser User user) {
        Notification n = notificationRepository.findById(id).orElseThrow();
        if (!n.getUserId().equals(user.getId())) throw new RuntimeException("Not allowed");
        n.setIsRead(true);
        return notificationRepository.save(n);
    }
}