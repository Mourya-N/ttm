package com.ttm.controller;

import com.ttm.dto.ProjectDto;
import com.ttm.service.ProjectService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @PostMapping
    public ResponseEntity<?> createProject(@Valid @RequestBody ProjectDto.CreateRequest request,
                                            HttpServletRequest httpRequest) {
        try {
            String userId = (String) httpRequest.getAttribute("userId");
            return ResponseEntity.ok(projectService.createProject(userId, request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<ProjectDto.ProjectResponse>> getProjects(HttpServletRequest httpRequest) {
        String userId = (String) httpRequest.getAttribute("userId");
        String role   = (String) httpRequest.getAttribute("userRole");
        return ResponseEntity.ok(projectService.getUserProjects(userId, "ADMIN".equals(role)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProject(@PathVariable String id, HttpServletRequest httpRequest) {
        try {
            String userId = (String) httpRequest.getAttribute("userId");
            String role   = (String) httpRequest.getAttribute("userRole");
            return ResponseEntity.ok(projectService.getProject(id, userId, "ADMIN".equals(role)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProject(@PathVariable String id,
                                            @RequestBody ProjectDto.UpdateRequest request,
                                            HttpServletRequest httpRequest) {
        try {
            String userId = (String) httpRequest.getAttribute("userId");
            String role   = (String) httpRequest.getAttribute("userRole");
            return ResponseEntity.ok(projectService.updateProject(id, userId, "ADMIN".equals(role), request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<?> addMember(@PathVariable String id,
                                        @Valid @RequestBody ProjectDto.AddMemberRequest request,
                                        HttpServletRequest httpRequest) {
        try {
            String userId = (String) httpRequest.getAttribute("userId");
            String role   = (String) httpRequest.getAttribute("userRole");
            return ResponseEntity.ok(projectService.addMember(id, userId, "ADMIN".equals(role), request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}/members/{memberId}")
    public ResponseEntity<?> removeMember(@PathVariable String id,
                                           @PathVariable String memberId,
                                           HttpServletRequest httpRequest) {
        try {
            String userId = (String) httpRequest.getAttribute("userId");
            String role   = (String) httpRequest.getAttribute("userRole");
            return ResponseEntity.ok(projectService.removeMember(id, memberId, userId, "ADMIN".equals(role)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProject(@PathVariable String id, HttpServletRequest httpRequest) {
        try {
            String userId = (String) httpRequest.getAttribute("userId");
            String role   = (String) httpRequest.getAttribute("userRole");
            projectService.deleteProject(id, userId, "ADMIN".equals(role));
            return ResponseEntity.ok(Map.of("message", "Project deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
