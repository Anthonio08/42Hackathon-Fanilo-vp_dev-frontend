import { InvalidCredentialsError } from "../domain/auth.errors";
import type { AuthRepository, RegisterData } from "../domain/auth.repository";
import type { AuthResponse, User } from "../domain/user.entity";
import { authStorage } from "@/core/api.client";

const DEMO: User = {
  id: "1",
  email: "journaliste@demo.mg",
  name: "Rakoto Jean",
  role: "journalist",
  is_active: true,
  created_at: new Date().toISOString(),
};

export const authMock: AuthRepository = {
  async login({ email, password }) {
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (email.toLowerCase() !== DEMO.email || password !== "demo1234") {
      throw new InvalidCredentialsError();
    }

    const response: AuthResponse = {
      access_token: "mock-jwt-token-demo",
      token_type: "bearer",
      user: DEMO,
    };

    authStorage.setToken(response.access_token);
    authStorage.setUser(response.user);

    return response;
  },

  async register(data: RegisterData) {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newUser: User = {
      id: String(Date.now()),
      email: data.email,
      name: data.name || "Nouvel utilisateur",
      role: data.role || "journalist",
      is_active: true,
      created_at: new Date().toISOString(),
    };

    authStorage.setToken("mock-jwt-token-registered");
    authStorage.setUser(newUser);

    return newUser;
  },

  async getMe() {
    const user = authStorage.getUser<User>();
    if (user) return user;
    return DEMO;
  },

  logout() {
    authStorage.clearAuth();
  },

  getCurrentUser() {
    return authStorage.getUser<User>();
  },

  getToken() {
    return authStorage.getToken();
  },

  isAuthenticated() {
    return authStorage.isAuthenticated();
  },
};
