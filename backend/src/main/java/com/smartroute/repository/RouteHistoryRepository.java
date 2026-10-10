package com.smartroute.repository;

import com.smartroute.model.RouteHistoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RouteHistoryRepository extends JpaRepository<RouteHistoryEntity, UUID> {

    List<RouteHistoryEntity> findAllByOrderByCreatedAtDesc();

    List<RouteHistoryEntity> findTop10ByOrderByCreatedAtDesc();

    Optional<RouteHistoryEntity> findTop1ByOrderByCreatedAtDesc();

    @Query("SELECT r.algorithm, COUNT(r) FROM RouteHistoryEntity r GROUP BY r.algorithm")
    List<Object[]> countUsageByAlgorithm();
}
