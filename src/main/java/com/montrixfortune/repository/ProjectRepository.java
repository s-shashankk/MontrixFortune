package com.montrixfortune.repository;

import com.montrixfortune.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByActiveTrueOrderByDisplayOrderAscIdAsc();

    List<Project> findAllByOrderByDisplayOrderAscIdAsc();
}
