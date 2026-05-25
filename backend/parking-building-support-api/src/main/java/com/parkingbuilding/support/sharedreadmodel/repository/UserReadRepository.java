package com.parkingbuilding.support.sharedreadmodel.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.parkingbuilding.support.sharedreadmodel.entity.UserReadEntity;

public interface UserReadRepository extends JpaRepository<UserReadEntity, Long> {

    @Query("SELECT u FROM UserReadEntity u WHERE u.username = :username")
    UserReadEntity findByUsername(@Param("username") String username);
}