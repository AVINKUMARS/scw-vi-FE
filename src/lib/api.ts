import axios from "axios";

// Lightweight language detection for Indic scripts
function detectLangCodeFromText(text: string): string {
  if (!text) return 'en';
  const s = text;
  // Devanagari (Hindi)
  if (/\p{Script=Devanagari}/u.test(s)) return 'hi';
  // Tamil
  if (/\p{Script=Tamil}/u.test(s)) return 'ta';
  // Telugu
  if (/\p{Script=Telugu}/u.test(s)) return 'te';
  // Bengali
  if (/\p{Script=Bengali}/u.test(s)) return 'bn';
  // Default Latin → English
  return 'en';
}

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
  (res) => {
    try {
      const url = String(res?.config?.url || '');
      if (/\/chat\/send(\b|$)/.test(url) || /\/chat\/send-gemini(\b|$)/.test(url)) {
        const reply = String((res?.data as any)?.reply || '');
        if (reply) {
          const lang = detectLangCodeFromText(reply);
          try { localStorage.setItem('ui_lang', lang); } catch {}
          try { window.dispatchEvent(new CustomEvent('ui_lang_changed', { detail: { lang } })); } catch {}
        }
      }
    } catch {}
    return res;
  },
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
