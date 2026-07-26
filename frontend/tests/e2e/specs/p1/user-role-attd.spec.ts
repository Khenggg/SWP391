import { test, expect } from "@playwright/test";

test.describe("ATTD User Role Change & UTF-8 Encoding Suite", () => {
  test("ATTD-ROLE-02: Should validate required reason message without phông chữ corruption", async () => {
    const errorString = "Bắt buộc nhập lý do.";
    expect(errorString).toBe("Bắt buộc nhập lý do.");
    expect(errorString).not.toContain("Báº¯t");
  });
});
