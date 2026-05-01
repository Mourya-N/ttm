package com.ttm.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class TaskDto {

    public static class CreateRequest {
        @NotBlank(message = "Task title is required")
        @Size(min = 2, max = 200)
        private String title;

        @Size(max = 1000)
        private String description;

        @NotBlank(message = "Project ID is required")
        private String projectId;

        private String assigneeId;
        private String priority = "MEDIUM";
        private LocalDate dueDate;

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getProjectId() { return projectId; }
        public void setProjectId(String projectId) { this.projectId = projectId; }

        public String getAssigneeId() { return assigneeId; }
        public void setAssigneeId(String assigneeId) { this.assigneeId = assigneeId; }

        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }

        public LocalDate getDueDate() { return dueDate; }
        public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    }

    public static class UpdateRequest {
        private String title;
        private String description;
        private String assigneeId;
        private String priority;
        private String status;
        private LocalDate dueDate;

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getAssigneeId() { return assigneeId; }
        public void setAssigneeId(String assigneeId) { this.assigneeId = assigneeId; }

        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public LocalDate getDueDate() { return dueDate; }
        public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    }

    public static class TaskResponse {
        private String id;
        private String title;
        private String description;
        private String projectId;
        private String projectName;
        private String assigneeId;
        private String assigneeName;
        private String assigneeAvatarColor;
        private String createdById;
        private String createdByName;
        private String priority;
        private String status;
        private LocalDate dueDate;
        private boolean overdue;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getProjectId() { return projectId; }
        public void setProjectId(String projectId) { this.projectId = projectId; }

        public String getProjectName() { return projectName; }
        public void setProjectName(String projectName) { this.projectName = projectName; }

        public String getAssigneeId() { return assigneeId; }
        public void setAssigneeId(String assigneeId) { this.assigneeId = assigneeId; }

        public String getAssigneeName() { return assigneeName; }
        public void setAssigneeName(String assigneeName) { this.assigneeName = assigneeName; }

        public String getAssigneeAvatarColor() { return assigneeAvatarColor; }
        public void setAssigneeAvatarColor(String assigneeAvatarColor) { this.assigneeAvatarColor = assigneeAvatarColor; }

        public String getCreatedById() { return createdById; }
        public void setCreatedById(String createdById) { this.createdById = createdById; }

        public String getCreatedByName() { return createdByName; }
        public void setCreatedByName(String createdByName) { this.createdByName = createdByName; }

        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public LocalDate getDueDate() { return dueDate; }
        public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

        public boolean isOverdue() { return overdue; }
        public void setOverdue(boolean overdue) { this.overdue = overdue; }

        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

        public LocalDateTime getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    }
}
