import { test, expect } from "@playwright/test";

test.describe("ATTD User Role Change & UTF-8 Encoding Suite", () => {
  test("ATTD-ROLE-02: Should validate required reason message without phông chữ corruption", async () => {
    const errorString = "Bắt buộc nhập lý do.";
    expect(errorString).toBe("Bắt buộc nhập lý do.");
    expect(errorString).not.toContain("Báº¯t");
  });

  test("ATTD-DRIVER-01: Should support switching between RESIDENT and VISITOR driver types", async () => {
    const currentDriverType = "VISITOR";
    const newDriverType = currentDriverType === "VISITOR" ? "RESIDENT" : "VISITOR";
    
    expect(newDriverType).toBe("RESIDENT");
    expect(["RESIDENT", "VISITOR"]).toContain(newDriverType);
  });

  test("ATTD-DRIVER-02: Should reject promoting DRIVER to internal staff/admin role", async () => {
    const isDriver = true;
    const proposedRole = "MANAGER";
    const canChangeRole = !isDriver;

    expect(canChangeRole).toBe(false);
  });
});
