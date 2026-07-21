import axios from "axios";

const SESSION_KEY = "currentUser";
const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

const sessionClient = axios.create({
  baseURL: import.meta.env.VITE_CORE_API_URL || "/api/core",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

let refreshPromise = null;

export function getAccessToken() {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function clearAuthStorage() {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function saveAccessToken(accessToken, refreshToken) {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise;

  const refreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) {
    throw new Error("No refresh token is available.");
  }

  refreshPromise = sessionClient
    .post("/auth/refresh-token", { refreshToken })
    .then((response) => {
      const payload = response.data;
      if (!payload?.success || !payload.data?.accessToken) {
        throw new Error(payload?.message || "Session refresh failed.");
      }

      saveAccessToken(payload.data.accessToken, payload.data.refreshToken);
      return payload.data.accessToken;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

export async function revokeRemoteSession() {
  const accessToken = getAccessToken();
  if (!accessToken) return;

  await sessionClient.post(
    "/auth/logout",
    null,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
}

export { SESSION_KEY, ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY };
