import type { User, UserRole, AuthResponse } from "./user.entity";

export type RegisterData = {
  role: UserRole;
  name?: string;
  email: string;
  phone?: string;
  organization?: string;
  password: string;
};

export interface AuthRepository {
  login(credentials: { email: string; password: string }): Promise<AuthResponse>;
  register(data: RegisterData): Promise<User>;
  getMe(): Promise<User>;
  logout(): Promise<void> | void;
  getCurrentUser(): User | null;
  getToken(): string | null;
  isAuthenticated(): boolean;
}
