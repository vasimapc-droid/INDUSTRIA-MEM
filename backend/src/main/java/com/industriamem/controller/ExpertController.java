package com.industriamem.controller;

import com.industriamem.entity.User;
import com.industriamem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/experts")
@RequiredArgsConstructor
public class ExpertController {

    private final UserRepository userRepository;

    @GetMapping
    public List<Map<String,Object>> list() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() != null && "EXPERT".equals(u.getRole().getName()))
                .map(u -> {
                    Map<String,Object> m = new LinkedHashMap<>();
                    m.put("id", u.getId());
                    m.put("fullName", u.getFullName());
                    m.put("email", u.getEmail());
                    m.put("department", u.getDepartment() != null ? u.getDepartment().getName() : "");
                    return m;
                }).collect(Collectors.toList());
    }

    @GetMapping("/find")
    public List<Map<String,Object>> find(@RequestParam(required = false) String skill,
                                         @RequestParam(required = false) String department) {
        String skillLower = skill != null ? skill.toLowerCase() : null;
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() != null && "EXPERT".equals(u.getRole().getName()))
                .filter(u -> department == null || (u.getDepartment() != null &&
                        department.equalsIgnoreCase(u.getDepartment().getName())))
                .map(u -> {
                    Map<String,Object> m = new LinkedHashMap<>();
                    m.put("id", u.getId());
                    m.put("fullName", u.getFullName());
                    m.put("email", u.getEmail());
                    m.put("department", u.getDepartment() != null ? u.getDepartment().getName() : "");
                    m.put("matchScore", skillLower != null && (u.getFullName().toLowerCase().contains(skillLower)
                            || (u.getDepartment() != null && u.getDepartment().getName().toLowerCase().contains(skillLower))) ? 95 : 70);
                    return m;
                }).sorted((a,b) -> Integer.compare((int)b.get("matchScore"), (int)a.get("matchScore")))
                .collect(Collectors.toList());
    }
}