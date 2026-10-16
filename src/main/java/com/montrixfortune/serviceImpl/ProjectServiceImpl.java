package com.montrixfortune.serviceImpl;

import com.montrixfortune.dto.project.ProjectRequest;
import com.montrixfortune.dto.project.ProjectResponse;
import com.montrixfortune.dto.project.ProjectSummaryResponse;
import com.montrixfortune.entity.Project;
import com.montrixfortune.exception.ResourceNotFoundException;
import com.montrixfortune.repository.ProjectRepository;
import com.montrixfortune.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ProjectSummaryResponse> getActiveProjects() {
        return projectRepository.findByActiveTrueOrderByDisplayOrderAscIdAsc().stream()
                .map(this::toSummary)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjectSummaryResponse> getAllProjects() {
        return projectRepository.findAllByOrderByDisplayOrderAscIdAsc().stream()
                .map(this::toSummary)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectResponse getActiveProject(Long id) {
        Project project = findProject(id);
        if (!Boolean.TRUE.equals(project.getActive())) {
            throw new ResourceNotFoundException("Project not found");
        }
        return toResponse(project);
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectResponse getProject(Long id) {
        return toResponse(findProject(id));
    }

    @Override
    @Transactional
    public ProjectResponse createProject(ProjectRequest request) {
        Project project = new Project();
        applyRequest(project, request);
        return toResponse(projectRepository.save(project));
    }

    @Override
    @Transactional
    public ProjectResponse updateProject(Long id, ProjectRequest request) {
        Project project = findProject(id);
        applyRequest(project, request);
        return toResponse(projectRepository.save(project));
    }

    @Override
    @Transactional
    public void deleteProject(Long id) {
        projectRepository.delete(findProject(id));
    }

    @Override
    @Transactional
    public void reorderProjects(List<Long> projectIds) {
        if (projectIds == null || projectIds.isEmpty()) {
            return;
        }

        Map<Long, Project> byId = new HashMap<>();
        for (Project project : projectRepository.findAllById(projectIds)) {
            byId.put(project.getId(), project);
        }

        int displayOrder = 1;
        for (Long projectId : projectIds) {
            Project project = byId.get(projectId);
            if (project == null) {
                continue;
            }
            project.setDisplayOrder(displayOrder++);
        }
    }

    private Project findProject(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
    }

    private void applyRequest(Project project, ProjectRequest request) {
        List<String> images = new ArrayList<>();
        for (String image : request.getImages()) {
            String value = image == null ? "" : image.trim();
            if (value.isEmpty()) {
                continue;
            }
            if (!isAllowedImageSource(value)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Project images must be an uploaded image or an http(s) URL");
            }
            images.add(value);
        }

        if (images.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one project image is required");
        }
        if (images.size() > Project.MAX_IMAGES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "A project can have at most " + Project.MAX_IMAGES + " images");
        }

        project.setTitle(request.getTitle().trim());
        project.setDescription(request.getDescription().trim());
        project.getImages().clear();
        project.getImages().addAll(images);
        project.setDisplayOrder(request.getDisplayOrder() == null ? 0 : request.getDisplayOrder());
        project.setActive(request.getActive() == null || request.getActive());
    }

    private boolean isAllowedImageSource(String value) {
        String lower = value.toLowerCase(Locale.ROOT);
        return lower.startsWith("data:image/")
                || lower.startsWith("https://")
                || lower.startsWith("http://")
                || (lower.startsWith("/") && !lower.startsWith("//"));
    }

    private ProjectSummaryResponse toSummary(Project project) {
        List<String> images = project.getImages();
        return new ProjectSummaryResponse(
                project.getId(),
                project.getTitle(),
                project.getDescription(),
                images.isEmpty() ? null : images.get(0),
                images.size(),
                project.getDisplayOrder(),
                project.getActive());
    }

    private ProjectResponse toResponse(Project project) {
        return new ProjectResponse(
                project.getId(),
                project.getTitle(),
                project.getDescription(),
                new ArrayList<>(project.getImages()),
                project.getDisplayOrder(),
                project.getActive());
    }
}
