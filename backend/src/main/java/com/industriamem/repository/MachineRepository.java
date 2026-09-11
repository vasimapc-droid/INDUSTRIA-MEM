package com.industriamem.repository;

import com.industriamem.entity.Machine;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface MachineRepository extends JpaRepository<Machine, Long> {
    Optional<Machine> findByMachineCode(String machineCode);
    List<Machine> findByDepartmentId(Long departmentId);
}