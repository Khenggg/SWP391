package com.parkingbuilding.support.common;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class ApiResponseTest {

    @Test
    void okCreatesSuccessfulResponseWithData() {
        ApiResponse<Integer> response = ApiResponse.ok(123);

        assertThat(response.success()).isTrue();
        assertThat(response.message()).isEqualTo("OK");
        assertThat(response.data()).isEqualTo(123);
    }

    @Test
    void okCreatesSuccessfulResponseWithMessage() {
        ApiResponse<Void> response = ApiResponse.ok("ready");

        assertThat(response.success()).isTrue();
        assertThat(response.message()).isEqualTo("ready");
        assertThat(response.data()).isNull();
    }
}
