package com.parkingbuilding.support;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.parkingbuilding.support.dto.request.AuditLogSearchRequest;
import com.parkingbuilding.support.service.AuditLogService;

@SpringBootTest
class SupportApplicationTests {

	@Autowired
	private AuditLogService auditLogService;

	@Test
	void testAuditLog() {
		try {
			System.out.println("TESTING AUDIT LOG SERVICE...");
			auditLogService.search(new AuditLogSearchRequest());
			System.out.println("SUCCESS");
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
}
