package com.parkingbuilding.support;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class IntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void testApi() {
        System.out.println("TESTING API INTEGRATION...");
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwianRpIjoiZmE0YzdlOWUxZjM1NGEwNWJiMjEwOTVlMmVkYmU4YjQiLCJzaWQiOiI0YzU5MTI2Yy1lYmFhLTQ4ZDgtYjczOS1lNDg1ZmM4ZjNjYmMiLCJ1c2VyX2lkIjoiMiIsInVzZXJuYW1lIjoibWFuYWdlcjAxIiwicm9sZSI6Ik1BTkFHRVIiLCJmdWxsTmFtZSI6IkRlbW8gTWFuYWdlciIsImZ1bGxfbmFtZSI6IkRlbW8gTWFuYWdlciIsInN0YXR1cyI6IkFDVElWRSIsImV4cCI6MTc4NDY0MzExNCwiaXNzIjoiUGFya2luZ0J1aWxkaW5nLkNvcmVBcGkiLCJhdWQiOiJQYXJraW5nQnVpbGRpbmcuRnJvbnRlbmQifQ.2dgDSGmcNjGClyD8QChrloZvEt-A9nTeXAOskwqHJJI");
        HttpEntity<String> entity = new HttpEntity<>(null, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange("/api/support/dashboard", HttpMethod.GET, entity, String.class);
            System.out.println("DASHBOARD STATUS: " + response.getStatusCodeValue());
            System.out.println("DASHBOARD BODY: " + response.getBody());
        } catch (Exception e) {
            e.printStackTrace();
        }

        try {
            ResponseEntity<String> response = restTemplate.exchange("/api/support/audit-logs?page=0&size=5", HttpMethod.GET, entity, String.class);
            System.out.println("AUDIT LOGS STATUS: " + response.getStatusCodeValue());
            System.out.println("AUDIT LOGS BODY: " + response.getBody());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
