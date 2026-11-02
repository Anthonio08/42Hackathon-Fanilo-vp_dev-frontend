import type { AuthRepository } from "../domain/auth.repository";
import { apiAuthRepository } from "./auth.api.repository";

// Backend branché avec Axios interceptor
export const authRepository: AuthRepository = apiAuthRepository;

export { apiAuthRepository };
export { authMock } from "./auth.mock";
export { AuthDatasource } from "./auth.datasource";
