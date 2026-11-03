import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import Config from "./config";

export const TOKEN_STORAGE_KEY = "access_token";
export const USER_STORAGE_KEY = "auth_user";

let cachedUserRaw: string | null = null;
let cachedUserParsed: unknown = null;

function notifyAuthChange(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("auth:change"));
  }
}

export function resolveEndpoint(path: string): string {
  const base = apiClient.defaults.baseURL || "";
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (base.endsWith("/api/v1") || base.includes("/api/v1")) {
    return cleanPath;
  }
  return `/api/v1${cleanPath}`;
}

// Gestion sécurisée du stockage des tokens (côté navigateur)
export const authStorage = {
  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  },
  setToken(token: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    notifyAuthChange();
  },
  removeToken(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    notifyAuthChange();
  },
  getUser<T = unknown>(): T | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) {
      cachedUserRaw = null;
      cachedUserParsed = null;
      return null;
    }
    // Si la chaîne brute n'a pas changé, retourner la même référence d'objet (évite les boucles infinies useSyncExternalStore)
    if (raw === cachedUserRaw && cachedUserParsed !== null) {
      return cachedUserParsed as T;
    }
    try {
      cachedUserRaw = raw;
      cachedUserParsed = JSON.parse(raw);
      return cachedUserParsed as T;
    } catch {
      cachedUserRaw = null;
      cachedUserParsed = null;
      return null;
    }
  },
  setUser<T = unknown>(user: T): void {
    if (typeof window === "undefined") return;
    const str = JSON.stringify(user);
    cachedUserRaw = str;
    cachedUserParsed = user;
    localStorage.setItem(USER_STORAGE_KEY, str);
    notifyAuthChange();
  },
  removeUser(): void {
    if (typeof window === "undefined") return;
    cachedUserRaw = null;
    cachedUserParsed = null;
    localStorage.removeItem(USER_STORAGE_KEY);
    notifyAuthChange();
  },
  clearAuth(): void {
    if (typeof window === "undefined") return;
    cachedUserRaw = null;
    cachedUserParsed = null;
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    notifyAuthChange();
  },
  isAuthenticated(): boolean {
    return Boolean(this.getToken());
  },
};

// Instance Axios centrale
export const apiClient = axios.create({
  baseURL: Config.API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Intercepteur de requête : injecte automatiquement le Bearer token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = authStorage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Intercepteur de réponse : intercepte les 401 et nettoie la session si l'utilisateur était authentifié
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const hadToken = Boolean(authStorage.getToken());
      authStorage.clearAuth();
      if (typeof window !== "undefined" && hadToken) {
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
        if (
          !window.location.pathname.startsWith("/login") &&
          !window.location.pathname.startsWith("/register")
        ) {
          window.location.replace("/login");
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
