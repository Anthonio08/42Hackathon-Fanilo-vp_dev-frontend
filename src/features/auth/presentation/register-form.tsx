"use client";

import Link from "next/link";
import { Building2, Loader2, Mail, Phone, User } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { PasswordField, TextField } from "@/shared/ui/field";
import { USER_ROLES } from "../domain/user.entity";
import { ROLE_COPY } from "./register.copy";
import { PASSWORD_RULES } from "./register.schema";
import { useRegisterForm } from "./user-register-form";

const enter =
  "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 fill-mode-backwards duration-500";

export function RegisterForm() {
  const { form, onSubmit, serverError } = useRegisterForm();
  const { register, watch, formState } = form;
  const { errors, isSubmitting } = formState;

  const role = watch("role");
  const password = watch("password") ?? "";
  const copy = ROLE_COPY[role];

  const checks = PASSWORD_RULES.map((rule) => rule.test(password));
  const score = checks.filter(Boolean).length;
  const bars = score <= 2 ? 1 : score === 3 ? 2 : 3;
  const barColor = bars === 1 ? "bg-destructive" : bars === 2 ? "bg-amber-500" : "bg-success";

  return (
		<form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
			<fieldset className={enter}>
				<legend className="mb-2 text-sm font-medium">Je suis</legend>
				<div className="grid grid-cols-2 gap-3">
					{USER_ROLES.map((value) => (
						<label
							key={value}
							className="group border-input hover:border-foreground/40 has-checked:border-red-600 ligth:text-black has-checked:text-red-600  has-focus-visible:border-brand flex cursor-pointer flex-col rounded-2xl border px-4 py-3 transition"
						>
							<input type="radio" value={value} className="sr-only" {...register("role")} />
							<span className="text-sm font-semibold text-center">{ROLE_COPY[value].label}</span>
							{/* <span className="text-muted-foreground group-has-checked:text-primary-foreground/70 text-xs">
								{ROLE_COPY[value].hint}
							</span> */}
						</label>
					))}
				</div>
				<p
					key={role}
					className="text-muted-foreground motion-safe:animate-in motion-safe:fade-in mt-2 text-xs duration-300"
				>
					{copy.intro}
				</p>
			</fieldset>

			<div className="grid gap-4 sm:grid-cols-2">
				<TextField
					label="Nom complet"
					icon={User}
					autoComplete="name"
					placeholder="Rakoto Jean"
					error={errors.name?.message}
					{...register("name")}
				/>
				<TextField
					label="Adresse e-mail"
					type="email"
					icon={Mail}
					autoComplete="email"
					placeholder={copy.emailPlaceholder}
					error={errors.email?.message}
					{...register("email")}
				/>
			</div>

			<PasswordField
				label="Mot de passe"
				autoComplete="new-password"
				placeholder="Créez un mot de passe"
				error={errors.password?.message}
				{...register("password")}
			/>

			{password && (
				<div className="space-y-2">
					<div className="flex h-1.5 gap-1.5" aria-hidden="true">
						{[1, 2, 3].map((i) => (
							<div
								key={i}
								className={`h-full flex-1 rounded-full transition-all duration-300 ${
								i <= bars ? barColor : "bg-muted"
								}`}
							/>
						))}
					</div>
					<ul className="flex flex-wrap gap-1.5">
						{PASSWORD_RULES.map((rule, i) => (
							<li
								key={rule.label}
								className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition ${
								checks[i] ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
								}`}
							>
								{rule.label}
							</li>
						))}
					</ul>
				</div>
			)}

			{/* <PasswordField
				label="Confirmer le mot de passe"
				autoComplete="new-password"
				placeholder="Saisissez-le à nouveau"
				error={errors.confirmPassword?.message}
				{...register("confirmPassword")}
			/> */}

			<div>
				<div className="flex items-start gap-2">
					<input
						id="acceptTerms"
						type="checkbox"
						className="accent-success mt-0.5 size-4 cursor-pointer rounded"
						{...register("acceptTerms")}
					/>
					<label
						htmlFor="acceptTerms"
						className="text-muted-foreground cursor-pointer text-xs leading-relaxed"
					>
						J&apos;accepte les{" "}
						<Link href="#" className="text-foreground font-semibold hover:underline">
							conditions d&apos;utilisation
						</Link>{" "}
						et la{" "}
						<Link href="#" className="text-foreground font-semibold hover:underline">
							politique de confidentialité
						</Link>
						.
					</label>
				</div>
				{errors.acceptTerms && (
					<p role="alert" className="text-destructive mt-1.5 text-sm">
						{errors.acceptTerms.message}
					</p>
				)}
			</div>

			{serverError && (
				<p
					role="alert"
					className="bg-destructive/10 text-destructive motion-safe:animate-shake rounded-2xl px-4 py-2.5 text-sm"
				>
				{serverError}
				</p>
			)}

			<button
				type="submit"
				disabled={isSubmitting}
				className="bg-red-600 h-11 w-full text-white rounded-full text-sm transition-all hover:-translate-y-0.5 active:translate-y-0"
			>
				{isSubmitting && <Loader2 className="animate-spin" />}
				{isSubmitting ? "Création en cours…" : copy.submit}
			</button>

			<p className="text-muted-foreground text-center text-sm">
				Vous avez déjà un compte ?{" "}
				<Link href="/login" className="text-brand font-semibold hover:underline">
					Se connecter
				</Link>
			</p>
		</form>
  );
}