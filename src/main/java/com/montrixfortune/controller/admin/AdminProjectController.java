package com.montrixfortune.controller.admin;

import com.montrixfortune.dto.ApiResponse;
import com.montrixfortune.dto.project.ProjectRequest;
import com.montrixfortune.dto.project.ProjectResponse;
import com.montrixfortune.dto.project.ProjectSummaryResponse;
import com.montrixfortune.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/projects")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminProjectController {

    private final ProjectService projectService;

    @GetMapping
    public ApiResponse<List<ProjectSummaryResponse>> getProjects() {
        return new ApiResponse<>(true, "Projects fetched", 200, LocalDateTime.now(), projectService.getAllProjects());
    }

    @GetMapping("/{id}")
    public ApiResponse<ProjectResponse> getProject(@PathVariable Long id) {
        return new ApiResponse<>(true, "Project fetched", 200, LocalDateTime.now(), projectService.getProject(id));
    }

    @PostMapping
    public ApiResponse<ProjectResponse> createProject(@Valid @RequestBody ProjectRequest request) {
        return new ApiResponse<>(true, "Project created", 201, LocalDateTime.now(), projectService.createProject(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<ProjectResponse> updateProject(@PathVariable Long id, @Valid @RequestBody ProjectRequest request) {
        return new ApiResponse<>(true, "Project updated", 200, LocalDateTime.now(), projectService.updateProject(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return new ApiResponse<>(true, "Project deleted", 200, LocalDateTime.now(), null);
    }

    @PutMapping("/reorder")
    public ApiResponse<Void> reorderProjects(@RequestBody List<Long> projectIds) {
        projectService.reorderProjects(projectIds);
        return new ApiResponse<>(true, "Projects reordered", 200, LocalDateTime.now(), null);
    }
}
