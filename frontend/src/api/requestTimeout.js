const configuredTimeout = Number.parseInt(import.meta.env.VITE_API_TIMEOUT_MS || "90000", 10);

export const apiRequestTimeout = Number.isFinite(configuredTimeout) && configuredTimeout > 0
  ? configuredTimeout
  : 90000;

