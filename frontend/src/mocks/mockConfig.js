export const MOCK_FLAGS = {
  PUBLIC_PARKING_INFO: "VITE_MOCK_PUBLIC_PARKING_INFO",
  PUBLIC_PRICING: "VITE_MOCK_PUBLIC_PRICING",
  PUBLIC_AVAILABLE_SLOTS: "VITE_MOCK_PUBLIC_AVAILABLE_SLOTS",
  DRIVER_BOOKINGS: "VITE_MOCK_DRIVER_BOOKINGS",
  DRIVER_HISTORY: "VITE_MOCK_DRIVER_HISTORY",
};

export const API_BASE_URLS = {
  core: import.meta.env.VITE_CORE_API_URL || "http://localhost:5000/api/core",
  public: import.meta.env.VITE_PUBLIC_API_URL || "http://localhost:8080/api/public",
  support: import.meta.env.VITE_SUPPORT_API_URL || "http://localhost:8080/api/support",
};

export function isMockEnabled(flagName) {
  return import.meta.env[flagName] === "true";
}

export function hasEnabledMocks() {
  return Object.entries(import.meta.env).some(
    ([key, value]) => key.startsWith("VITE_MOCK_") && value === "true"
  );
}
