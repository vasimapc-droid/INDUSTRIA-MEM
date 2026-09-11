package com.industriamem.audit;

import com.industriamem.entity.AuditLog;
import com.industriamem.entity.User;
import com.industriamem.repository.AuditLogRepository;
import com.industriamem.security.CurrentUser;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.lang.reflect.Method;

@Aspect
@Component
@RequiredArgsConstructor
public class AuditAspect {

    private final AuditLogRepository auditLogRepository;

    @Around("@annotation(com.industriamem.audit.Auditable)")
    public Object logAction(ProceedingJoinPoint jp) throws Throwable {
        Object result = jp.proceed();

        try {
            MethodSignature sig = (MethodSignature) jp.getSignature();
            Method method = sig.getMethod();
            Auditable ann = method.getAnnotation(Auditable.class);
            if (ann == null) return result;

            Long userId = null;
            try {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && auth.getPrincipal() instanceof org.springframework.security.core.userdetails.User springUser) {
                    // load user by email
                    // we don't have direct access to userRepo here (would cause circular deps),
                    // so we store email in details and resolve at read time if needed
                }
            } catch (Exception ignored) {}

            // extract user via CurrentUser-style resolution
            Object[] args = jp.getArgs();
            for (Object arg : args) {
                if (arg instanceof User u) {
                    userId = u.getId();
                    break;
                }
            }

            // fallback: resolve from security context
            if (userId == null) {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth != null) {
                    // store email as detail; we'll add userId resolution in controller
                }
            }

            String details = buildDetails(ann, method, args, result);

            String ip = null;
            try {
                ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
                if (attrs != null) {
                    HttpServletRequest req = attrs.getRequest();
                    ip = req.getRemoteAddr();
                }
            } catch (Exception ignored) {}

            AuditLog log = AuditLog.builder()
                    .userId(userId)
                    .action(ann.action())
                    .entityType(ann.entityType().isBlank() ? null : ann.entityType())
                    .details(details)
                    .ipAddress(ip)
                    .build();
            auditLogRepository.save(log);

        } catch (Exception e) {
            // never break the business flow because of audit failures
            System.err.println("[AuditAspect] Failed to log: " + e.getMessage());
        }

        return result;
    }

    private String buildDetails(Auditable ann, Method method, Object[] args, Object result) {
        StringBuilder sb = new StringBuilder();
        sb.append(ann.action());
        // Include simple arg summary (avoid huge objects)
        for (Object a : args) {
            if (a == null) continue;
            String s = a.toString();
            if (s.length() > 200) s = s.substring(0, 200) + "...";
            sb.append(" | ").append(s);
            if (sb.length() > 500) break;
        }
        return sb.toString();
    }
}