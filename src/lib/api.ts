import axios from "axios";

const RAW_API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8080/api";
export const API_BASE = String(RAW_API_BASE).replace(/\/+$/, "");

export const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  try {
    const dbg = import.meta?.env?.VITE_DEBUG_API;
    if (dbg && String(dbg) !== '0') {
      const url = (cfg.baseURL ? cfg.baseURL + (cfg.url?.startsWith('/') ? '' : '/') : '') + (cfg.url || '')
      if (/\/me\b/.test(String(cfg.url))) {
        const tail = t ? t.slice(-12) : 'no-token'
        console.debug(`[api] ${cfg.method?.toUpperCase()} ${url} Authorization: Bearer ...${tail}`)
      }
    }
  } catch {}
  return cfg;
});

// Global response interceptor: on 401 or explicit "invalid token",
// clear auth and force navigation to login page.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    const msg = String(error?.response?.data?.error || "").toLowerCase();
    if (status === 401 || msg.includes("invalid token")) {
      try { localStorage.removeItem("token"); } catch {}
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  }
);
