package com.ttm.service;

import com.ttm.dto.TaskDto;
import com.ttm.dto.UserResponse;
import com.ttm.model.Project;
import com.ttm.model.Task;
import com.ttm.repository.ProjectRepository;
import com.ttm.repository.TaskRepository;
import com.ttm.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public DashboardService(ProjectRepository projectRepository, TaskRepository taskRepository,
                            UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    public DashboardStats getDashboardStats(String userId, boolean isAdmin) {
        DashboardStats stats = new DashboardStats();

        List<Project> projects = isAdmin
                ? projectRepository.findAll()
                : projectRepository.findByOwnerIdOrMemberIdsContaining(userId, userId);

        stats.setTotalProjects(projects.size());
        stats.setActiveProjects((int) projects.stream()
                .filter(p -> p.getStatus() == Project.Status.ACTIVE).count());

        if (isAdmin) {
            List<Task> allTasks = taskRepository.findAll();
            stats.setTotalTasks(allTasks.size());
            stats.setCompletedTasks((int) allTasks.stream().filter(t -> t.getStatus() == Task.Status.DONE).count());
            stats.setInProgressTasks((int) allTasks.stream().filter(t -> t.getStatus() == Task.Status.IN_PROGRESS).count());
            stats.setOverdueTasks((int) allTasks.stream()
                    .filter(t -> t.getDueDate() != null && t.getDueDate().isBefore(LocalDate.now())
                            && t.getStatus() != Task.Status.DONE).count());
            stats.setTotalMembers((int) userRepository.count());
            stats.setRecentTasks(allTasks.stream()
                    .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                    .limit(10).map(this::toTaskResponse).collect(Collectors.toList()));
        } else {
            long total = taskRepository.countByAssigneeId(userId);
            long done  = taskRepository.countByAssigneeIdAndStatus(userId, Task.Status.DONE);
            stats.setTotalTasks((int) total);
            stats.setCompletedTasks((int) done);
            List<Task> myTasks = taskRepository.findByAssigneeId(userId);
            stats.setInProgressTasks((int) myTasks.stream().filter(t -> t.getStatus() == Task.Status.IN_PROGRESS).count());
            stats.setOverdueTasks((int) taskRepository
                    .findByAssigneeIdAndDueDateBeforeAndStatusNot(userId, LocalDate.now(), Task.Status.DONE).size());
            stats.setRecentTasks(myTasks.stream()
                    .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                    .limit(10).map(this::toTaskResponse).collect(Collectors.toList()));
        }

        stats.setProjectProgress(projects.stream().limit(5).map(p -> {
            ProjectProgress pp = new ProjectProgress();
            pp.setProjectId(p.getId());
            pp.setProjectName(p.getName());
            long total = taskRepository.countByProjectIdAndStatus(p.getId(), Task.Status.TODO)
                    + taskRepository.countByProjectIdAndStatus(p.getId(), Task.Status.IN_PROGRESS)
                    + taskRepository.countByProjectIdAndStatus(p.getId(), Task.Status.IN_REVIEW)
                    + taskRepository.countByProjectIdAndStatus(p.getId(), Task.Status.DONE);
            long done = taskRepository.countByProjectIdAndStatus(p.getId(), Task.Status.DONE);
            pp.setTotalTasks((int) total);
            pp.setCompletedTasks((int) done);
            pp.setProgress(total == 0 ? 0 : (int) (done * 100 / total));
            return pp;
        }).collect(Collectors.toList()));

        return stats;
    }

    private TaskDto.TaskResponse toTaskResponse(Task task) {
        TaskDto.TaskResponse res = new TaskDto.TaskResponse();
        res.setId(task.getId());
        res.setTitle(task.getTitle());
        res.setProjectId(task.getProjectId());
        res.setPriority(task.getPriority().name());
        res.setStatus(task.getStatus().name());
        res.setDueDate(task.getDueDate());
        res.setCreatedAt(task.getCreatedAt());
        if (task.getDueDate() != null && task.getStatus() != Task.Status.DONE) {
            res.setOverdue(task.getDueDate().isBefore(LocalDate.now()));
        }
        projectRepository.findById(task.getProjectId()).ifPresent(p -> res.setProjectName(p.getName()));
        if (task.getAssigneeId() != null) {
            userRepository.findById(task.getAssigneeId()).ifPresent(u -> {
                res.setAssigneeName(u.getName());
                res.setAssigneeAvatarColor(u.getAvatarColor());
            });
        }
        return res;
    }

    // ---- Inner DTOs (no Lombok) ----

    public static class DashboardStats {
        private int totalProjects;
        private int activeProjects;
        private int totalTasks;
        private int completedTasks;
        private int inProgressTasks;
        private int overdueTasks;
        private int totalMembers;
        private List<TaskDto.TaskResponse> recentTasks;
        private List<ProjectProgress> projectProgress;

        public int getTotalProjects() { return totalProjects; }
        public void setTotalProjects(int v) { this.totalProjects = v; }

        public int getActiveProjects() { return activeProjects; }
        public void setActiveProjects(int v) { this.activeProjects = v; }

        public int getTotalTasks() { return totalTasks; }
        public void setTotalTasks(int v) { this.totalTasks = v; }

        public int getCompletedTasks() { return completedTasks; }
        public void setCompletedTasks(int v) { this.completedTasks = v; }

        public int getInProgressTasks() { return inProgressTasks; }
        public void setInProgressTasks(int v) { this.inProgressTasks = v; }

        public int getOverdueTasks() { return overdueTasks; }
        public void setOverdueTasks(int v) { this.overdueTasks = v; }

        public int getTotalMembers() { return totalMembers; }
        public void setTotalMembers(int v) { this.totalMembers = v; }

        public List<TaskDto.TaskResponse> getRecentTasks() { return recentTasks; }
        public void setRecentTasks(List<TaskDto.TaskResponse> v) { this.recentTasks = v; }

        public List<ProjectProgress> getProjectProgress() { return projectProgress; }
        public void setProjectProgress(List<ProjectProgress> v) { this.projectProgress = v; }
    }

    public static class ProjectProgress {
        private String projectId;
        private String projectName;
        private int totalTasks;
        private int completedTasks;
        private int progress;

        public String getProjectId() { return projectId; }
        public void setProjectId(String v) { this.projectId = v; }

        public String getProjectName() { return projectName; }
        public void setProjectName(String v) { this.projectName = v; }

        public int getTotalTasks() { return totalTasks; }
        public void setTotalTasks(int v) { this.totalTasks = v; }

        public int getCompletedTasks() { return completedTasks; }
        public void setCompletedTasks(int v) { this.completedTasks = v; }

        public int getProgress() { return progress; }
        public void setProgress(int v) { this.progress = v; }
    }
}
