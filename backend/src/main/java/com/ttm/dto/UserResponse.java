package com.ttm.dto;

import com.ttm.model.User;

public class UserResponse {
    private String id;
    private String name;
    private String email;
    private String role;
    private String avatarColor;

    public static UserResponse from(User user) {
        UserResponse dto = new UserResponse();
        dto.id = user.getId();
        dto.name = user.getName();
        dto.email = user.getEmail();
        dto.role = user.getRole().name();
        dto.avatarColor = user.getAvatarColor();
        return dto;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getAvatarColor() { return avatarColor; }
    public void setAvatarColor(String avatarColor) { this.avatarColor = avatarColor; }
}
