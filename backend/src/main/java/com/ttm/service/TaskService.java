package com.ttm.service;

import com.ttm.dto.TaskDto;
import com.ttm.model.Project;
import com.ttm.model.Task;
import com.ttm.repository.ProjectRepository;
import com.ttm.repository.TaskRepository;
import com.ttm.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public TaskService(TaskRepository taskRepository, ProjectRepository projectRepository,
                       UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    public TaskDto.TaskResponse createTask(String creatorId, TaskDto.CreateRequest request) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));
        if (!project.getMemberIds().contains(creatorId) && !project.getOwnerId().equals(creatorId)) {
            throw new RuntimeException("You are not a member of this project");
        }
        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setProjectId(request.getProjectId());
        task.setCreatedById(creatorId);
        task.setAssigneeId(request.getAssigneeId());
        task.setPriority(Task.Priority.valueOf(request.getPriority() != null ? request.getPriority() : "MEDIUM"));
        task.setDueDate(request.getDueDate());
        return toResponse(taskRepository.save(task));
    }

    public List<TaskDto.TaskResponse> getProjectTasks(String projectId, String userId, boolean isAdmin) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        if (!isAdmin && !project.getMemberIds().contains(userId)) {
            throw new RuntimeException("Access denied");
        }
        return taskRepository.findByProjectId(projectId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public List<TaskDto.TaskResponse> getMyTasks(String userId) {
        return taskRepository.findByAssigneeId(userId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public TaskDto.TaskResponse updateTask(String taskId, String userId, boolean isAdmin,
                                           TaskDto.UpdateRequest request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        Project project = projectRepository.findById(task.getProjectId()).orElse(null);

        boolean hasAccess = isAdmin
                || task.getCreatedById().equals(userId)
                || (task.getAssigneeId() != null && task.getAssigneeId().equals(userId))
                || (project != null && project.getOwnerId().equals(userId));
        if (!hasAccess) throw new RuntimeException("Access denied");

        if (request.getTitle() != null && !request.getTitle().isBlank()) task.setTitle(request.getTitle());
        if (request.getDescription() != null) task.setDescription(request.getDescription());
        if (request.getAssigneeId() != null) {
            task.setAssigneeId(request.getAssigneeId().isBlank() ? null : request.getAssigneeId());
        }
        if (request.getPriority() != null) task.setPriority(Task.Priority.valueOf(request.getPriority()));
        if (request.getStatus() != null) task.setStatus(Task.Status.valueOf(request.getStatus()));
        if (request.getDueDate() != null) task.setDueDate(request.getDueDate());
        task.setUpdatedAt(LocalDateTime.now());
        return toResponse(taskRepository.save(task));
    }

    public void deleteTask(String taskId, String userId, boolean isAdmin) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        Project project = projectRepository.findById(task.getProjectId()).orElse(null);
        boolean canDelete = isAdmin
                || task.getCreatedById().equals(userId)
                || (project != null && project.getOwnerId().equals(userId));
        if (!canDelete) throw new RuntimeException("Only task creator, project owner, or admin can delete");
        taskRepository.delete(task);
    }

    public TaskDto.TaskResponse getTask(String taskId) {
        return toResponse(taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found")));
    }

    private TaskDto.TaskResponse toResponse(Task task) {
        TaskDto.TaskResponse res = new TaskDto.TaskResponse();
        res.setId(task.getId());
        res.setTitle(task.getTitle());
        res.setDescription(task.getDescription());
        res.setProjectId(task.getProjectId());
        res.setAssigneeId(task.getAssigneeId());
        res.setCreatedById(task.getCreatedById());
        res.setPriority(task.getPriority().name());
        res.setStatus(task.getStatus().name());
        res.setDueDate(task.getDueDate());
        res.setCreatedAt(task.getCreatedAt());
        res.setUpdatedAt(task.getUpdatedAt());

        projectRepository.findById(task.getProjectId()).ifPresent(p -> res.setProjectName(p.getName()));

        if (task.getAssigneeId() != null) {
            userRepository.findById(task.getAssigneeId()).ifPresent(u -> {
                res.setAssigneeName(u.getName());
                res.setAssigneeAvatarColor(u.getAvatarColor());
            });
        }
        userRepository.findById(task.getCreatedById()).ifPresent(u -> res.setCreatedByName(u.getName()));

        if (task.getDueDate() != null && task.getStatus() != Task.Status.DONE) {
            res.setOverdue(task.getDueDate().isBefore(LocalDate.now()));
        }
        return res;
    }
}
