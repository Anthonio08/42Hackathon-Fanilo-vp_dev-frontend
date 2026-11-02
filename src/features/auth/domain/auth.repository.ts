import type { User, UserRole } from "./user.entity";

export type RegisterData = {
  role: UserRole;
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  password: string;
};

export interface AuthRepository {
	login(credentials: { email: string; password: string }): Promise<User>;
	register(data: RegisterData): Promise<User>;
}