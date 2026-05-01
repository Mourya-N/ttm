package com.ttm.controller;

import com.ttm.dto.TaskDto;
import com.ttm.service.TaskService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping
    public ResponseEntity<?> createTask(@Valid @RequestBody TaskDto.CreateRequest request,
                                         HttpServletRequest httpRequest) {
        try {
            String userId = (String) httpRequest.getAttribute("userId");
            return ResponseEntity.ok(taskService.createTask(userId, request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<?> getProjectTasks(@PathVariable String projectId,
                                              HttpServletRequest httpRequest) {
        try {
            String userId = (String) httpRequest.getAttribute("userId");
            String role   = (String) httpRequest.getAttribute("userRole");
            List<TaskDto.TaskResponse> tasks = taskService.getProjectTasks(projectId, userId, "ADMIN".equals(role));
            return ResponseEntity.ok(tasks);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/my")
    public ResponseEntity<List<TaskDto.TaskResponse>> getMyTasks(HttpServletRequest httpRequest) {
        String userId = (String) httpRequest.getAttribute("userId");
        return ResponseEntity.ok(taskService.getMyTasks(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTask(@PathVariable String id) {
        try {
            return ResponseEntity.ok(taskService.getTask(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTask(@PathVariable String id,
                                         @RequestBody TaskDto.UpdateRequest request,
                                         HttpServletRequest httpRequest) {
        try {
            String userId = (String) httpRequest.getAttribute("userId");
            String role   = (String) httpRequest.getAttribute("userRole");
            return ResponseEntity.ok(taskService.updateTask(id, userId, "ADMIN".equals(role), request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(@PathVariable String id, HttpServletRequest httpRequest) {
        try {
            String userId = (String) httpRequest.getAttribute("userId");
            String role   = (String) httpRequest.getAttribute("userRole");
            taskService.deleteTask(id, userId, "ADMIN".equals(role));
            return ResponseEntity.ok(Map.of("message", "Task deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
