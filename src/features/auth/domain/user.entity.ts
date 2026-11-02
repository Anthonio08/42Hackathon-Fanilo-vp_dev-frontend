export const USER_ROLES = ["journalist", "citizen"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export interface User {
  id: string | number;
  email: string;
  name?: string;
  role?: UserRole | string;
  is_active?: boolean;
  created_at?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}
