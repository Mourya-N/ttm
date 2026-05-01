package com.ttm.controller;

import com.ttm.dto.UserResponse;
import com.ttm.model.User;
import com.ttm.repository.UserRepository;
import com.ttm.service.DashboardService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class DashboardController {

    private final DashboardService dashboardService;
    private final UserRepository userRepository;

    public DashboardController(DashboardService dashboardService, UserRepository userRepository) {
        this.dashboardService = dashboardService;
        this.userRepository = userRepository;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardService.DashboardStats> getDashboard(HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        String role   = (String) request.getAttribute("userRole");
        return ResponseEntity.ok(dashboardService.getDashboardStats(userId, "ADMIN".equals(role)));
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(HttpServletRequest request) {
        String role = (String) request.getAttribute("userRole");
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).body(Map.of("error", "Admin access required"));
        }
        List<UserResponse> users = userRepository.findAll().stream()
                .map(UserResponse::from).collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @GetMapping("/users/me")
    public ResponseEntity<?> getCurrentUser(HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        return userRepository.findById(userId)
                .map(user -> ResponseEntity.ok(UserResponse.from(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/users/{id}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable String id,
                                             @RequestBody Map<String, String> body,
                                             HttpServletRequest request) {
        String role = (String) request.getAttribute("userRole");
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).body(Map.of("error", "Admin access required"));
        }
        return userRepository.findById(id).map(user -> {
            String newRole = body.get("role");
            if (newRole != null) {
                user.setRole(User.Role.valueOf(newRole.toUpperCase()));
                userRepository.save(user);
            }
            return ResponseEntity.ok(UserResponse.from(user));
        }).orElse(ResponseEntity.notFound().build());
    }
}
