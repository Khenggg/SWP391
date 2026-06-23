package com.parkingbuilding.support.sharedreadmodel.repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.parkingbuilding.support.sharedreadmodel.entity.UserReadEntity;

@Repository
public interface UserReadRepository extends ReadOnlyRepository<UserReadEntity, Long> {

    @Query("SELECT u FROM UserReadEntity u WHERE u.username = :username")
    UserReadEntity findByUsername(@Param("username") String username);
}