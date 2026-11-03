"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { authRepository } from "../infrastructure";
import { registerSchema, type RegisterInput } from "./register.schema";
import { EmailAlreadyUsedError } from "../domain/auth.errors";

export { EmailAlreadyUsedError };

export function useRegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: {
      role: "journalist",
      name: "",
      email: "",
      organization: "",
      phone: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const onSubmit = form.handleSubmit(
    async ({ confirmPassword, acceptTerms, ...data }) => {
      void confirmPassword;
      void acceptTerms;
      setServerError(null);
      try {
        await authRepository.register(data);
        router.replace("/");
      } catch (error) {
        if (error instanceof EmailAlreadyUsedError) {
          setServerError("Un compte existe déjà avec cette adresse e-mail.");
        } else if (error instanceof Error && error.message) {
          setServerError(error.message);
        } else {
          setServerError("Inscription impossible pour le moment. Veuillez réessayer.");
        }
      }
    }
  );

  return { form, onSubmit, serverError };
}
