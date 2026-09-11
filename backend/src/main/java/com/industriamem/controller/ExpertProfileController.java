package com.industriamem.controller;

import com.industriamem.entity.*;
import com.industriamem.exception.ApiException;
import com.industriamem.repository.*;
import com.industriamem.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/expert-profile")
@RequiredArgsConstructor
public class ExpertProfileController {

    private final ExpertProfileRepository expertProfileRepository;

    @GetMapping("/me")
    public ExpertProfile getMine(@CurrentUser User me) {
        return expertProfileRepository.findByUserId(me.getId())
                .orElseGet(() -> ExpertProfile.builder()
                        .userId(me.getId())
                        .yearsExperience(0)
                        .available(true)
                        .contributionCount(0)
                        .build());
    }

    @PutMapping("/me")
    public ExpertProfile updateMine(@RequestBody ExpertProfile patch, @CurrentUser User me) {
        ExpertProfile p = expertProfileRepository.findByUserId(me.getId())
                .orElseGet(() -> ExpertProfile.builder().userId(me.getId()).build());

        if (patch.getYearsExperience() != null) p.setYearsExperience(patch.getYearsExperience());
        if (patch.getSpecialties() != null) p.setSpecialties(patch.getSpecialties());
        if (patch.getSkills() != null) p.setSkills(patch.getSkills());
        if (patch.getCertifications() != null) p.setCertifications(patch.getCertifications());
        if (patch.getBio() != null) p.setBio(patch.getBio());
        if (patch.getAvailable() != null) p.setAvailable(patch.getAvailable());

        return expertProfileRepository.save(p);
    }

    @GetMapping("/user/{id}")
    public ExpertProfile getByUser(@PathVariable Long id) {
        return expertProfileRepository.findByUserId(id)
                .orElseThrow(() -> new ApiException("Profile not found"));
    }
}