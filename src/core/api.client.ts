import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import Config from "./config";

export const TOKEN_STORAGE_KEY = "access_token";
export const USER_STORAGE_KEY = "auth_user";

// Gestion sécurisée du stockage des tokens (côté navigateur)
export const authStorage = {
  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  },
  setToken(token: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  },
  removeToken(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  },
  getUser<T = unknown>(): T | null {
    if (typeof window === "undefined") return null;
    const data = localStorage.getItem(USER_STORAGE_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data) as T;
    } catch {
      return null;
    }
  },
  setUser<T = unknown>(user: T): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  },
  removeUser(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(USER_STORAGE_KEY);
  },
  clearAuth(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
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

// Intercepteur de réponse : intercepte les 401 et nettoie la session
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      authStorage.clearAuth();
      if (typeof window !== "undefined") {
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
