"use client";

import Link from "next/link";
import { Loader2, Mail } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { TextField, PasswordField } from "@/shared/ui/field";
import { useLoginForm } from "./use-login-form";

const enter =
  	"motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 fill-mode-backwards duration-500";

export function LoginForm() {
	const { form, onSubmit, serverError } = useLoginForm();
  	const { register, formState } = form;
  	const { errors, isSubmitting } = formState;

	return (
		<form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
			<div className={enter} style={{ animationDelay: "100ms" }}>
				<TextField
					label="E-mail"
					type="email"
					icon={Mail}
					autoComplete="email"
					placeholder="prenom.nom@media.mg"
					error={errors.email?.message}
					{...register("email")}
				/>
			</div>

			<div className={enter} style={{ animationDelay: "200ms" }}>
				<PasswordField
					label="Mot de passe"
					autoComplete="current-password"
					placeholder="Saisissez votre mot de passe"
					error={errors.password?.message}
					{...register("password")}
				/>
			</div>

			<div className={`${enter} flex justify-end`} style={{ animationDelay: "300ms" }}>
				<Link href="#" className="text-brand text-sm font-medium hover:underline">
					Mot de passe oublié ?
				</Link>
			</div>

			{serverError && (
				<p
					role="alert"
					className="bg-destructive/10 text-destructive motion-safe:animate-shake rounded-2xl px-4 py-2.5 text-sm"
				>
					{serverError}
				</p>
			)}

			<div className={enter} style={{ animationDelay: "400ms" }}>
				<button
					type="submit"
					disabled={isSubmitting}
					className="group bg-red-600 text-success-foreground  h-11 w-full rounded-full text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:scale-[0.98]"
				>
				{isSubmitting ? (
					<Loader2 className="animate-spin" />
				) : null}
					{isSubmitting ? "Connexion en cours…" : "Se connecter"}
				</button>
			</div>

			<p className={`${enter} text-muted-foreground pt-1 text-center text-sm`} style={{ animationDelay: "500ms" }}>
				Vous n'avez pas encore un compte ?{" "}
				<Link href="/register" className="text-red-400 font-semibold hover:underline">
					S'inscire
				</Link>
			</p>
		</form>
	);
}