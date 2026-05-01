package com.ttm.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.List;

public class ProjectDto {

    public static class CreateRequest {
        @NotBlank(message = "Project name is required")
        @Size(min = 2, max = 100)
        private String name;

        @Size(max = 500)
        private String description;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }

    public static class UpdateRequest {
        private String name;
        private String description;
        private String status;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public static class AddMemberRequest {
        @NotBlank(message = "Member email is required")
        private String email;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }

    public static class ProjectResponse {
        private String id;
        private String name;
        private String description;
        private String ownerId;
        private String ownerName;
        private List<UserResponse> members;
        private String status;
        private long totalTasks;
        private long completedTasks;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getOwnerId() { return ownerId; }
        public void setOwnerId(String ownerId) { this.ownerId = ownerId; }

        public String getOwnerName() { return ownerName; }
        public void setOwnerName(String ownerName) { this.ownerName = ownerName; }

        public List<UserResponse> getMembers() { return members; }
        public void setMembers(List<UserResponse> members) { this.members = members; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public long getTotalTasks() { return totalTasks; }
        public void setTotalTasks(long totalTasks) { this.totalTasks = totalTasks; }

        public long getCompletedTasks() { return completedTasks; }
        public void setCompletedTasks(long completedTasks) { this.completedTasks = completedTasks; }

        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

        public LocalDateTime getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    }
}
