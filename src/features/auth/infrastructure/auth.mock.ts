import { InvalidCredentialsError } from "../domain/auth.errors";
import type { AuthRepository } from "../domain/auth.repository";

const DEMO = {
	id: "1",
	email: "journaliste@demo.mg",
	password: "demo1234",
	name: "Rakoto Jean",
};

export const authMock: AuthRepository = {
	async login({email, password}) {
		await new Promise((resolve) => setTimeout(resolve, 800));

		if (email.toLowerCase() !== DEMO.email || password !== DEMO.password) {
			throw new InvalidCredentialsError();
		}
		return { id: DEMO.id, email: DEMO.email, name: DEMO.name };
	},
	async register({email, password}) {
		await new Promise((resolve) => setTimeout(resolve, 800));

		if (email.toLowerCase() !== DEMO.email || password !== DEMO.password) {
			throw new InvalidCredentialsError();
		}
		return { id: DEMO.id, email: DEMO.email, name: DEMO.name };
	},
};