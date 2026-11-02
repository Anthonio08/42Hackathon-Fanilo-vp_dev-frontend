import type { AuthRepository } from "../domain/auth.repository";
import { authMock } from "./auth.mock";

// Rehefa mandeha ny back
export const authRepository: AuthRepository = authMock;