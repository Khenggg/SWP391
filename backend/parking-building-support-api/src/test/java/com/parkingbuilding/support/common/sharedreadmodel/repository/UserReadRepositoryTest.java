package com.parkingbuilding.support.common.sharedreadmodel.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.parkingbuilding.support.sharedreadmodel.entity.UserReadEntity;
import com.parkingbuilding.support.sharedreadmodel.repository.UserReadRepository;

@SpringBootTest
public class UserReadRepositoryTest {

    @Autowired
    private UserReadRepository UserReadRepository;

    @Test
    void TC_USER_01_findByUsername_success() {
        UserReadEntity user = UserReadRepository.findByUsername("admin01");

        assertNotNull(user);
        assertEquals("admin01", user.getUsername());
    }
}
