import { i18n } from "../../i18n/i18n";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

let refreshPromise: Promise<void> | null = null;

function withLang(path: string, lang: string) {
  if (/^https?:\/\//i.test(path)) return path;
  if (path.includes("lang=")) return `${API_BASE}${path}`;
  const sep = path.includes("?") ? "&" : "?";
  return `${API_BASE}${path}${sep}lang=${lang}`;
}

async function refresh(lang: string) {
  if (!refreshPromise) {
    refreshPromise = fetch(withLang("/api/auth/refresh", lang), {
      method: "POST",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("refresh_failed");
        }
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

async function parseError(res: Response) {
  try {
    const data = await res.clone().json();
    if (data?.error) return data.error as string;
  } catch (_) {
    // ignore
  }
  return res.statusText || `HTTP ${res.status}`;
}

type RequestOpts = {
  raw?: boolean;
  skipRefresh?: boolean;
};

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  opts: RequestOpts = {},
  attempt = 0,
): Promise<T> {
  const lang = i18n.language || "ru";
  const url = withLang(path, lang);
  const headers =
    init.body && !(init.body instanceof FormData)
      ? {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(init.headers || {}),
        }
      : { Accept: "application/json", ...(init.headers || {}) };

  const res = await fetch(url, {
    credentials: "include",
    ...init,
    headers,
  });

  if (res.status === 401 && !opts.skipRefresh && attempt === 0) {
    try {
      await refresh(lang);
      return apiRequest<T>(path, init, opts, attempt + 1);
    } catch (_) {
      // fallthrough to error
    }
  }

  if (!res.ok) {
    throw new Error(await parseError(res));
  }

  if (opts.raw) {
    return res as unknown as T;
  }

  const ct = res.headers.get("content-type");
  if (!ct || ct.indexOf("application/json") === -1) {
    return res as unknown as T;
  }
  return (await res.json()) as T;
}

export function apiGet<T>(path: string) {
  return apiRequest<T>(path, { method: "GET" });
}

export function apiPost<T>(path: string, body?: unknown) {
  return apiRequest<T>(path, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function apiPut<T>(path: string, body?: unknown) {
  return apiRequest<T>(path, {
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function apiPatch<T>(path: string, body?: unknown) {
  return apiRequest<T>(path, {
    method: "PATCH",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function apiDelete<T>(path: string) {
  return apiRequest<T>(path, { method: "DELETE" });
}

export function apiUpload<T>(path: string, form: FormData, method: "POST" | "PUT" = "POST") {
  return apiRequest<T>(path, { method, body: form });
}

export async function apiDownload(path: string, filename: string) {
  const res = await apiRequest<Response>(path, { method: "GET" }, { raw: true });
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
