import { authStorage } from "@/core/api.client";
import { AuthDatasource } from "./auth.datasource";
import { authMock } from "./auth.mock";
import type { AuthRepository, RegisterData } from "../domain/auth.repository";
import type { AuthResponse, User } from "../domain/user.entity";
import {
  InvalidCredentialsError,
  EmailAlreadyUsedError,
} from "../domain/auth.errors";

export class ApiAuthRepository implements AuthRepository {
  async login(credentials: {
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    try {
      const response = await AuthDatasource.login(credentials);
      if (response.access_token) {
        authStorage.setToken(response.access_token);
      }
      if (response.user) {
        authStorage.setUser(response.user);
      }
      return response;
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        throw error;
      }
      // Fallback sur le mock si le backend est injoignable (ex: réseau indisponible)
      console.warn(
        "Backend API non joignable pour /auth/login, tentative avec le mock :",
        error
      );
      try {
        return await authMock.login(credentials);
      } catch {
        throw error;
      }
    }
  }

  async register(data: RegisterData): Promise<User> {
    try {
      const user = await AuthDatasource.register(data);
      // Connexion automatique après enregistrement réussi
      try {
        const loginRes = await AuthDatasource.login({
          email: data.email,
          password: data.password,
        });
        if (loginRes.access_token) {
          authStorage.setToken(loginRes.access_token);
          authStorage.setUser(loginRes.user);
        }
      } catch {
        authStorage.setUser(user);
      }
      return user;
    } catch (error) {
      if (error instanceof EmailAlreadyUsedError) {
        throw error;
      }
      console.warn(
        "Backend API non joignable pour /auth/register, tentative avec le mock :",
        error
      );
      try {
        return await authMock.register(data);
      } catch {
        throw error;
      }
    }
  }

  async getMe(): Promise<User> {
    try {
      const user = await AuthDatasource.getMe();
      authStorage.setUser(user);
      return user;
    } catch (error) {
      const cached = authStorage.getUser<User>();
      if (cached) return cached;
      throw error;
    }
  }

  logout(): void {
    authStorage.clearAuth();
  }

  getCurrentUser(): User | null {
    return authStorage.getUser<User>();
  }

  getToken(): string | null {
    return authStorage.getToken();
  }

  isAuthenticated(): boolean {
    return authStorage.isAuthenticated();
  }
}

export const apiAuthRepository: AuthRepository = new ApiAuthRepository();

