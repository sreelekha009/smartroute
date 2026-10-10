package com.smartroute.repository;

import com.smartroute.model.RoadEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoadRepository extends JpaRepository<RoadEntity, UUID> {
    List<RoadEntity> findBySourceLocation_Id(UUID sourceId);
    List<RoadEntity> findByDestinationLocation_Id(UUID destinationId);
    List<RoadEntity> findBySourceLocation_IdOrDestinationLocation_Id(UUID sourceId, UUID destinationId);
    Optional<RoadEntity> findBySourceLocation_IdAndDestinationLocation_Id(UUID sourceId, UUID destinationId);
}
