"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { InvalidCredentialsError } from "../domain/auth.errors";
import { authRepository } from "../infrastructure";
import { loginSchema, type LoginInput } from "./login.scheam";

export function useLoginForm() {
	const router = useRouter();
	const [serverError, setServerError] = useState<string | null>(null);

	const form = useForm<LoginInput>({
		resolver: zodResolver(loginSchema),
		defaultValues: { email: "", password: "" },
	});

	const onSubmit = form.handleSubmit(async (values) => {
		setServerError(null);
		try {
			await authRepository.login(values);
			router.replace("/dashboard");
		} catch (error) {
			setServerError(
				error instanceof InvalidCredentialsError
				? "Email ou mot de passe incorrect."
				: "Une erreur est survenue. Veuillez réessayer.",
			);
		}
	});

	return { form, onSubmit, serverError };
}