import { AxiosError } from "axios";
import { apiClient } from "@/core/api.client";
import {
  InvalidCredentialsError,
  EmailAlreadyUsedError,
  UnauthorizedError,
} from "../domain/auth.errors";
import type { AuthResponse, User } from "../domain/user.entity";
import type { RegisterData } from "../domain/auth.repository";

function resolveEndpoint(path: string): string {
  const base = apiClient.defaults.baseURL || "";
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (base.endsWith("/api/v1") || base.includes("/api/v1")) {
    return cleanPath;
  }
  return `/api/v1${cleanPath}`;
}

function extractDetailMessage(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const d = (data as { detail?: unknown }).detail;
  if (typeof d === "string") return d;
  if (Array.isArray(d)) {
    return d
      .map((item) => {
        if (typeof item === "object" && item && "msg" in item) {
          return String((item as { msg: unknown }).msg);
        }
        return String(item);
      })
      .join(", ");
  }
  return null;
}

export class AuthDatasource {
  static async login(credentials: {
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        resolveEndpoint("/auth/login"),
        credentials
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const detail = extractDetailMessage(error.response.data);
        if (
          error.response.status === 400 ||
          error.response.status === 401 ||
          error.response.status === 422
        ) {
          throw new InvalidCredentialsError(
            detail || "Email ou mot de passe incorrect."
          );
        }
      }
      throw error;
    }
  }

  static async register(data: RegisterData): Promise<User> {
    try {
      const payload = {
        email: data.email,
        password: data.password,
        role: data.role || "journalist",
      };

      const response = await apiClient.post<User>(
        resolveEndpoint("/auth/register"),
        payload
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const detail = extractDetailMessage(error.response.data);
        if (
          error.response.status === 400 ||
          error.response.status === 409 ||
          (detail && detail.toLowerCase().includes("already"))
        ) {
          throw new EmailAlreadyUsedError(
            detail || "Un compte existe déjà avec cette adresse e-mail."
          );
        }
      }
      throw error;
    }
  }

  static async getMe(): Promise<User> {
    try {
      const response = await apiClient.get<User>(resolveEndpoint("/auth/me"));
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        throw new UnauthorizedError("Session expirée ou non autorisée.");
      }
      throw error;
    }
  }
}

