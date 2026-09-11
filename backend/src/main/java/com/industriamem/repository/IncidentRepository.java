package com.industriamem.repository;

import com.industriamem.entity.Incident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDateTime;
import java.util.List;

public interface IncidentRepository extends JpaRepository<Incident, Long> {
    List<Incident> findByMachineIdOrderByIncidentDateDesc(Long machineId);
    List<Incident> findByReportedByIdOrderByIncidentDateDesc(Long userId);
    List<Incident> findByStatusOrderByIncidentDateDesc(String status);
    List<Incident> findByIncidentDateAfterOrderByIncidentDateDesc(LocalDateTime since);

    @Query("SELECT i.machine.name, COUNT(i) FROM Incident i GROUP BY i.machine.name ORDER BY COUNT(i) DESC")
    List<Object[]> countByMachine();

    @Query("SELECT i.priority, COUNT(i) FROM Incident i GROUP BY i.priority")
    List<Object[]> countByPriority();

    @Query("SELECT i.status, COUNT(i) FROM Incident i GROUP BY i.status")
    List<Object[]> countByStatus();

    @Query("SELECT i.rootCause, COUNT(i) FROM Incident i WHERE i.rootCause IS NOT NULL AND i.rootCause <> '' GROUP BY i.rootCause HAVING COUNT(i) >= 2 ORDER BY COUNT(i) DESC")
    List<Object[]> countByRootCause();
}