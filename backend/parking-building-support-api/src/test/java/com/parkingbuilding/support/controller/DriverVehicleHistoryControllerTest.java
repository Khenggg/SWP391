package com.parkingbuilding.support.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;

import com.parkingbuilding.support.dto.response.VehicleEntryExitHistoryResponse;
import com.parkingbuilding.support.dto.response.VehicleHistoryPagedResponse;
import com.parkingbuilding.support.service.DriverVehicleHistoryService;

@WebMvcTest(DriverVehicleHistoryController.class)
@AutoConfigureMockMvc(addFilters = false)
public class DriverVehicleHistoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @SuppressWarnings("removal")
    @MockBean
    private DriverVehicleHistoryService driverVehicleHistoryService;

    @Test
    void getHistory_shouldReturn200() throws Exception {
        VehicleEntryExitHistoryResponse item = VehicleEntryExitHistoryResponse.builder()
                .id(101L)
                .driverId(12L)
                .licensePlate("51A12345")
                .vehicleType("CAR")
                .entryTime(OffsetDateTime.now())
                .status("DEPARTED")
                .parkingFee(BigDecimal.valueOf(50000))
                .build();

        VehicleHistoryPagedResponse response = new VehicleHistoryPagedResponse(
                List.of(item), 1, 20, 1L, 1
        );

        when(driverVehicleHistoryService.searchHistory(
                any(), any(), any(), any(), any(Integer.class), any(Integer.class), any(), any()
        )).thenReturn(response);

        Jwt jwt = Jwt.withTokenValue("mock-token")
                .header("alg", "none")
                .claim("user_id", "12")
                .claim("username", "driver01")
                .build();
        Authentication auth = new JwtAuthenticationToken(jwt, List.of(new SimpleGrantedAuthority("ROLE_DRIVER")));

        mockMvc.perform(get("/api/support/driver/vehicles/entry-exit-history")
                .principal(auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.items[0].id").value(101))
                .andExpect(jsonPath("$.data.items[0].licensePlate").value("51A12345"));
    }

    @Test
    void getDetail_shouldReturn200() throws Exception {
        VehicleEntryExitHistoryResponse response = VehicleEntryExitHistoryResponse.builder()
                .id(101L)
                .driverId(12L)
                .licensePlate("51A12345")
                .vehicleType("CAR")
                .entryTime(OffsetDateTime.now())
                .status("DEPARTED")
                .parkingFee(BigDecimal.valueOf(50000))
                .build();

        when(driverVehicleHistoryService.getDetail(101L, 12L, "DRIVER"))
                .thenReturn(response);

        Jwt jwt = Jwt.withTokenValue("mock-token")
                .header("alg", "none")
                .claim("user_id", "12")
                .claim("username", "driver01")
                .build();
        Authentication auth = new JwtAuthenticationToken(jwt, List.of(new SimpleGrantedAuthority("ROLE_DRIVER")));

        mockMvc.perform(get("/api/support/driver/vehicles/entry-exit-history/101")
                .principal(auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(101))
                .andExpect(jsonPath("$.data.licensePlate").value("51A12345"));
    }
}
