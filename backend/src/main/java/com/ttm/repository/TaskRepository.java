package com.ttm.repository;

import com.ttm.model.Task;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaskRepository extends MongoRepository<Task, String> {
    List<Task> findByProjectId(String projectId);
    List<Task> findByAssigneeId(String assigneeId);
    List<Task> findByAssigneeIdAndStatus(String assigneeId, Task.Status status);
    List<Task> findByProjectIdIn(List<String> projectIds);
    List<Task> findByAssigneeIdAndDueDateBeforeAndStatusNot(String assigneeId, LocalDate date, Task.Status status);
    long countByProjectIdAndStatus(String projectId, Task.Status status);
    long countByAssigneeId(String assigneeId);
    long countByAssigneeIdAndStatus(String assigneeId, Task.Status status);
}
