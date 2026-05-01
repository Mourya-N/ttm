package com.ttm.service;

import com.ttm.dto.ProjectDto;
import com.ttm.dto.UserResponse;
import com.ttm.model.Project;
import com.ttm.model.Task;
import com.ttm.model.User;
import com.ttm.repository.ProjectRepository;
import com.ttm.repository.TaskRepository;
import com.ttm.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;

    public ProjectService(ProjectRepository projectRepository, UserRepository userRepository,
                          TaskRepository taskRepository) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
    }

    public ProjectDto.ProjectResponse createProject(String ownerId, ProjectDto.CreateRequest request) {
        Project project = new Project();
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setOwnerId(ownerId);
        project.setMemberIds(new ArrayList<>(List.of(ownerId)));
        return toResponse(projectRepository.save(project));
    }

    public List<ProjectDto.ProjectResponse> getUserProjects(String userId, boolean isAdmin) {
        List<Project> projects = isAdmin
                ? projectRepository.findAll()
                : projectRepository.findByOwnerIdOrMemberIdsContaining(userId, userId);
        return projects.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public ProjectDto.ProjectResponse getProject(String projectId, String userId, boolean isAdmin) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        if (!isAdmin && !project.getMemberIds().contains(userId) && !project.getOwnerId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }
        return toResponse(project);
    }

    public ProjectDto.ProjectResponse updateProject(String projectId, String userId, boolean isAdmin,
                                                     ProjectDto.UpdateRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        if (!isAdmin && !project.getOwnerId().equals(userId)) {
            throw new RuntimeException("Only project owner or admin can update");
        }
        if (request.getName() != null && !request.getName().isBlank()) project.setName(request.getName());
        if (request.getDescription() != null) project.setDescription(request.getDescription());
        if (request.getStatus() != null) project.setStatus(Project.Status.valueOf(request.getStatus()));
        project.setUpdatedAt(LocalDateTime.now());
        return toResponse(projectRepository.save(project));
    }

    public ProjectDto.ProjectResponse addMember(String projectId, String userId, boolean isAdmin,
                                                  ProjectDto.AddMemberRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        if (!isAdmin && !project.getOwnerId().equals(userId)) {
            throw new RuntimeException("Only project owner or admin can add members");
        }
        User member = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found with email: " + request.getEmail()));
        if (!project.getMemberIds().contains(member.getId())) {
            project.getMemberIds().add(member.getId());
            project.setUpdatedAt(LocalDateTime.now());
            projectRepository.save(project);
        }
        return toResponse(project);
    }

    public ProjectDto.ProjectResponse removeMember(String projectId, String memberId,
                                                     String userId, boolean isAdmin) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        if (!isAdmin && !project.getOwnerId().equals(userId)) {
            throw new RuntimeException("Only project owner or admin can remove members");
        }
        if (project.getOwnerId().equals(memberId)) {
            throw new RuntimeException("Cannot remove project owner");
        }
        project.getMemberIds().remove(memberId);
        project.setUpdatedAt(LocalDateTime.now());
        return toResponse(projectRepository.save(project));
    }

    public void deleteProject(String projectId, String userId, boolean isAdmin) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        if (!isAdmin && !project.getOwnerId().equals(userId)) {
            throw new RuntimeException("Only project owner or admin can delete");
        }
        projectRepository.delete(project);
    }

    private ProjectDto.ProjectResponse toResponse(Project project) {
        ProjectDto.ProjectResponse res = new ProjectDto.ProjectResponse();
        res.setId(project.getId());
        res.setName(project.getName());
        res.setDescription(project.getDescription());
        res.setOwnerId(project.getOwnerId());
        res.setStatus(project.getStatus().name());
        res.setCreatedAt(project.getCreatedAt());
        res.setUpdatedAt(project.getUpdatedAt());

        userRepository.findById(project.getOwnerId()).ifPresent(u -> res.setOwnerName(u.getName()));

        List<UserResponse> members = project.getMemberIds().stream()
                .map(id -> userRepository.findById(id).map(UserResponse::from).orElse(null))
                .filter(u -> u != null)
                .collect(Collectors.toList());
        res.setMembers(members);

        long total = taskRepository.countByProjectIdAndStatus(project.getId(), Task.Status.TODO)
                + taskRepository.countByProjectIdAndStatus(project.getId(), Task.Status.IN_PROGRESS)
                + taskRepository.countByProjectIdAndStatus(project.getId(), Task.Status.IN_REVIEW)
                + taskRepository.countByProjectIdAndStatus(project.getId(), Task.Status.DONE);
        res.setTotalTasks(total);
        res.setCompletedTasks(taskRepository.countByProjectIdAndStatus(project.getId(), Task.Status.DONE));
        return res;
    }
}
