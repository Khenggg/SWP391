package com.parkingbuilding.support.common;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class ApiResponseTest {

    @Test
    void okCreatesSuccessfulResponse() {
        ApiResponse<String> response = ApiResponse.ok("ready");

        assertThat(response.success()).isTrue();
        assertThat(response.message()).isEqualTo("OK");
        assertThat(response.data()).isEqualTo("ready");
    }
}
