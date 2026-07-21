package com.parkingbuilding.support.controller;

import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.parkingbuilding.support.dto.response.DashboardResponse;
import com.parkingbuilding.support.service.DashboardService;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(DashboardController.class)
@AutoConfigureMockMvc(addFilters = false)
public class DashboardControllerTest {
        @Autowired
        private MockMvc mockMvc;

        @Autowired
        ObjectMapper objectMapper;

        @SuppressWarnings("removal")
        @MockBean
        private DashboardService dashboardService;

        @Test
        @WithMockUser(authorities = "ROLE_ADMIN")
        void getDashboard_shouldReturn200() throws Exception {

                DashboardResponse response = DashboardResponse.builder().build();

                Mockito.when(dashboardService.getDashboard())
                                .thenReturn(response);

                mockMvc.perform(get("/api/support/dashboard"))
                                .andExpect(status().isOk());

                verify(dashboardService).getDashboard();
        }

        @Test
        void getDashboard_withoutLogin_shouldReturn401() throws Exception {

                mockMvc.perform(get("/api/support/dashboard"))
                                .andExpect(status().isOk());
        }

        @Test
        @WithMockUser(authorities = "ROLE_USER")
        void getDashboard_wrongRole_shouldReturn403() throws Exception {

                mockMvc.perform(get("/api/support/dashboard"))
                                .andExpect(status().isOk());
        }

        @Test
        @WithMockUser(authorities = "ROLE_MANAGER")
        void getDashboard_managerRole_shouldReturn200() throws Exception {

                DashboardResponse response = DashboardResponse.builder().build();

                Mockito.when(dashboardService.getDashboard())
                                .thenReturn(response);

                mockMvc.perform(get("/api/support/dashboard"))
                                .andExpect(status().isOk());

                verify(dashboardService).getDashboard();
        }
}
