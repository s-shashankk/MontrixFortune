package com.montrixfortune.service;

import com.montrixfortune.dto.project.ProjectRequest;
import com.montrixfortune.dto.project.ProjectResponse;
import com.montrixfortune.dto.project.ProjectSummaryResponse;

import java.util.List;

public interface ProjectService {

    List<ProjectSummaryResponse> getActiveProjects();

    List<ProjectSummaryResponse> getAllProjects();

    ProjectResponse getActiveProject(Long id);

    ProjectResponse getProject(Long id);

    ProjectResponse createProject(ProjectRequest request);

    ProjectResponse updateProject(Long id, ProjectRequest request);

    void deleteProject(Long id);

    void reorderProjects(List<Long> projectIds);
}
