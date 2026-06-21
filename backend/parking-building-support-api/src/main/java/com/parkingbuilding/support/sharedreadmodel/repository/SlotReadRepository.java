package com.parkingbuilding.support.sharedreadmodel.repository;

<<<<<<< HEAD
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
=======
import org.springframework.stereotype.Repository;
>>>>>>> origin/dev

import com.parkingbuilding.support.sharedreadmodel.entity.SlotReadEntity;

@Repository
public interface SlotReadRepository extends ReadOnlyRepository<SlotReadEntity, Long> {

    long countByStatus(String status);
    List<SlotReadEntity> findByStatus(String status);
}