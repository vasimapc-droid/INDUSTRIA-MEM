package com.industriamem.controller;

import com.industriamem.entity.Machine;
import com.industriamem.repository.MachineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.industriamem.audit.Auditable;

import java.util.List;

@RestController
@RequestMapping("/api/machines")
@RequiredArgsConstructor
public class MachineController {

    private final MachineRepository machineRepository;

    @GetMapping
    public List<Machine> list() { return machineRepository.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<Machine> get(@PathVariable Long id) {
        return machineRepository.findById(id).map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Auditable(action = "MACHINE_CREATED", entityType = "MACHINE")
    public Machine create(@RequestBody Machine m) { return machineRepository.save(m); }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Auditable(action = "MACHINE_UPDATED", entityType = "MACHINE")
    public Machine update(@PathVariable Long id, @RequestBody Machine m) {
        m.setId(id);
        return machineRepository.save(m);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Auditable(action = "MACHINE_DELETED", entityType = "MACHINE")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        machineRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}