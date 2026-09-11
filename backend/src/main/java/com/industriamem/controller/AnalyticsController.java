package com.industriamem.controller;

import com.industriamem.entity.Incident;
import com.industriamem.entity.KnowledgeEntry;
import com.industriamem.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final IncidentRepository incidentRepository;
    private final KnowledgeRepository knowledgeRepository;
    private final MachineRepository machineRepository;
    private final UserRepository userRepository;

    // ============ SUMMARY ============

    @GetMapping("/summary")
    public Map<String,Object> summary(@RequestParam(required = false) String range) {
        LocalDateTime from = parseRange(range);

        Map<String,Object> m = new LinkedHashMap<>();
        m.put("totalMachines", machineRepository.count());
        m.put("totalUsers", userRepository.count());

        List<Incident> allIncidents = incidentRepository.findAll();
        List<KnowledgeEntry> allKnowledge = knowledgeRepository.findAll();

        if (from != null) {
            allIncidents = allIncidents.stream()
                    .filter(i -> i.getIncidentDate() != null && i.getIncidentDate().isAfter(from))
                    .toList();
            allKnowledge = allKnowledge.stream()
                    .filter(k -> k.getCreatedAt() != null && k.getCreatedAt().isAfter(from))
                    .toList();
        }

        m.put("totalIncidents", (long) allIncidents.size());
        m.put("totalKnowledge", (long) allKnowledge.size());
        m.put("verifiedKnowledge", allKnowledge.stream().filter(k -> "EXPERT_VERIFIED".equals(k.getStatus())).count());
        m.put("pendingVerification", allKnowledge.stream().filter(k -> "PENDING_VERIFICATION".equals(k.getStatus())).count());
        m.put("activeIncidents", allIncidents.stream()
                .filter(i -> "OPEN".equals(i.getStatus()) || "INVESTIGATING".equals(i.getStatus()))
                .count());
        return m;
    }

    // ============ CHART DATA ============

    @GetMapping("/incidents-by-machine")
    public List<Map<String,Object>> incidentsByMachine() {
        List<Map<String,Object>> out = new ArrayList<>();
        for (Object[] row : incidentRepository.countByMachine())
            out.add(Map.of("name", row[0], "count", row[1]));
        return out;
    }

    @GetMapping("/incidents-by-priority")
    public List<Map<String,Object>> incidentsByPriority() {
        List<Map<String,Object>> out = new ArrayList<>();
        for (Object[] row : incidentRepository.countByPriority())
            out.add(Map.of("name", row[0], "count", row[1]));
        return out;
    }

    @GetMapping("/incidents-by-status")
    public List<Map<String,Object>> incidentsByStatus() {
        List<Map<String,Object>> out = new ArrayList<>();
        for (Object[] row : incidentRepository.countByStatus())
            out.add(Map.of("name", row[0], "count", row[1]));
        return out;
    }

    @GetMapping("/monthly-growth")
    public List<Map<String,Object>> monthlyGrowth() {
        // last 12 months, verify count per month
        LocalDateTime since = LocalDateTime.now().minusMonths(12).withDayOfMonth(1).withHour(0).withMinute(0);
        List<KnowledgeEntry> list = knowledgeRepository.findByCreatedAtAfterOrderByCreatedAtAsc(since);

        Map<String, Long> byMonth = new TreeMap<>();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM");
        for (KnowledgeEntry k : list) {
            if (k.getCreatedAt() == null) continue;
            String key = k.getCreatedAt().format(fmt);
            byMonth.put(key, byMonth.getOrDefault(key, 0L) + 1);
        }

        List<Map<String,Object>> out = new ArrayList<>();
        YearMonth now = YearMonth.now();
        for (int i = 11; i >= 0; i--) {
            YearMonth ym = now.minusMonths(i);
            String key = ym.format(fmt);
            long count = byMonth.getOrDefault(key, 0L);
            out.add(Map.of("month", key, "count", count));
        }
        return out;
    }

    @GetMapping("/expert-contributions")
    public List<Map<String,Object>> expertContributions() {
        List<Map<String,Object>> out = new ArrayList<>();
        for (Object[] row : knowledgeRepository.countByExpert())
            out.add(Map.of("name", row[0], "count", row[1]));
        return out;
    }

    @GetMapping("/top-recurring")
    public List<Map<String,Object>> topRecurring() {
        List<Map<String,Object>> out = new ArrayList<>();
        for (Object[] row : incidentRepository.countByRootCause())
            out.add(Map.of("name", row[0], "count", row[1]));
        return out;
    }

    // ============ CSV EXPORT ============

    @GetMapping("/export/incidents")
    public ResponseEntity<byte[]> exportIncidents() {
        StringBuilder sb = new StringBuilder();
        sb.append("ID,Title,Machine,Priority,Status,ReportedBy,IncidentDate,RootCause,Solution\n");
        for (Incident i : incidentRepository.findAll()) {
            sb.append(escape(i.getId())).append(",")
              .append(escape(i.getTitle())).append(",")
              .append(escape(i.getMachine() != null ? i.getMachine().getName() : "")).append(",")
              .append(escape(i.getPriority())).append(",")
              .append(escape(i.getStatus())).append(",")
              .append(escape(i.getReportedBy() != null ? i.getReportedBy().getFullName() : "")).append(",")
              .append(escape(i.getIncidentDate() != null ? i.getIncidentDate().toString() : "")).append(",")
              .append(escape(i.getRootCause())).append(",")
              .append(escape(i.getSolution())).append("\n");
        }
        return csvResponse("incidents.csv", sb.toString());
    }

    @GetMapping("/export/knowledge")
    public ResponseEntity<byte[]> exportKnowledge() {
        StringBuilder sb = new StringBuilder();
        sb.append("ID,Title,Machine,Status,RootCause,Solution,VerifiedBy,HelpfulCount,CreatedAt\n");
        for (KnowledgeEntry k : knowledgeRepository.findAll()) {
            sb.append(escape(k.getId())).append(",")
              .append(escape(k.getTitle())).append(",")
              .append(escape(k.getMachine() != null ? k.getMachine().getName() : "")).append(",")
              .append(escape(k.getStatus())).append(",")
              .append(escape(k.getRootCause())).append(",")
              .append(escape(k.getSolution())).append(",")
              .append(escape(k.getVerifiedBy() != null ? k.getVerifiedBy().getFullName() : "")).append(",")
              .append(escape(k.getHelpfulCount())).append(",")
              .append(escape(k.getCreatedAt() != null ? k.getCreatedAt().toString() : "")).append("\n");
        }
        return csvResponse("knowledge.csv", sb.toString());
    }

    // ============ HELPERS ============

    private LocalDateTime parseRange(String range) {
        if (range == null) return null;
        LocalDateTime now = LocalDateTime.now();
        return switch (range) {
            case "30d" -> now.minusDays(30);
            case "90d" -> now.minusDays(90);
            case "1y"  -> now.minusYears(1);
            default    -> null;
        };
    }

    private String escape(Object o) {
        if (o == null) return "";
        String s = o.toString().replace("\"", "\"\"");
        if (s.contains(",") || s.contains("\"") || s.contains("\n")) {
            return "\"" + s + "\"";
        }
        return s;
    }

    private ResponseEntity<byte[]> csvResponse(String filename, String content) {
        byte[] bytes = content.getBytes(StandardCharsets.UTF_8);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", filename);
        return ResponseEntity.ok().headers(headers).body(bytes);
    }
}