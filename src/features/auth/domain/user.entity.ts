export const USER_ROLES = ["journalist", "citizen"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export type User = { id: string; email: string; name: string; role?: UserRole };