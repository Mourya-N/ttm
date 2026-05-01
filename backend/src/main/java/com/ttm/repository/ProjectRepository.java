package com.ttm.repository;

import com.ttm.model.Project;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProjectRepository extends MongoRepository<Project, String> {
    List<Project> findByOwnerIdOrMemberIdsContaining(String ownerId, String memberId);
    List<Project> findByOwnerId(String ownerId);
}
