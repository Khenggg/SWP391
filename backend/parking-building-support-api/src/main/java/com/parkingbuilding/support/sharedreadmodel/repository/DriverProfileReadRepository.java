package com.parkingbuilding.support.sharedreadmodel.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.parkingbuilding.support.sharedreadmodel.entity.DriverProfileReadEntity;

@Repository
public interface DriverProfileReadRepository extends ReadOnlyRepository<DriverProfileReadEntity, Long> {

    Optional<DriverProfileReadEntity> findByUserId(Long userId);

    @Query(value = """
            SELECT
                dp.id AS "driverId",
                u.id AS "userId",
                u.username AS "username",
                COALESCE(dp.full_name, u.full_name) AS "fullName",
                COALESCE(dp.phone, u.phone) AS "phone",
                COALESCE(dp.email, u.email) AS "email",
                COALESCE(dp.status, u.status) AS "status",
                dp.driver_type AS "driverType",
                dp.apartment_number AS "apartmentNumber",
                COALESCE(dp.resident_verified, false) AS "residentVerified",
                dp.resident_verified_at AS "residentVerifiedAt",
                COALESCE(dp.created_at, u.created_at) AS "createdAt",
                COALESCE(dp.updated_at, u.updated_at) AS "updatedAt"
            FROM users u
            LEFT JOIN driver_profiles dp ON dp.user_id = u.id
            WHERE (:userId IS NOT NULL AND u.id = :userId)
               OR (:userId IS NULL AND u.username = :username)
            LIMIT 1
            """, nativeQuery = true)
    Optional<DriverProfileRow> findCurrentDriverProfile(
            @Param("userId") Long userId,
            @Param("username") String username);

    interface DriverProfileRow {
        Long getDriverId();
        Long getUserId();
        String getUsername();
        String getFullName();
        String getPhone();
        String getEmail();
        String getStatus();
        String getDriverType();
        String getApartmentNumber();
        Boolean getResidentVerified();
        java.time.Instant getResidentVerifiedAt();
        java.time.Instant getCreatedAt();
        java.time.Instant getUpdatedAt();
    }
}
