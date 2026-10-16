package com.montrixfortune.controller;

import com.montrixfortune.dto.project.ProjectResponse;
import com.montrixfortune.dto.project.ProjectSummaryResponse;
import com.montrixfortune.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Public "Our Projects" endpoints used by the home page. */
@RestController
@RequestMapping("/api/projects")
@CrossOrigin
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    public List<ProjectSummaryResponse> getActiveProjects() {
        return projectService.getActiveProjects();
    }

    @GetMapping("/{id}")
    public ProjectResponse getActiveProject(@PathVariable Long id) {
        return projectService.getActiveProject(id);
    }
}
