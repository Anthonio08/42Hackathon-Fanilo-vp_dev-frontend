import { z } from "zod";
import { USER_ROLES } from "../domain/user.entity";

export const PASSWORD_RULES = [
	{ test: (v: string) => v.length >= 8, label: "8 caractères" },
	{ test: (v: string) => /[A-Z]/.test(v), label: "Majuscule" },
	{ test: (v: string) => /[a-z]/.test(v), label: "Minuscule" },
	{ test: (v: string) => /[0-9]/.test(v), label: "Chiffre" },
];

export const registerSchema = z
	.object({
		role: z.enum(USER_ROLES),
		name: z.string().trim().min(2, "Saisissez votre nom complet."),
		email: z.string().trim().min(1, "Saisissez votre adresse e-mail.").email("Cette adresse e-mail n'est pas valide."),
		organization: z.string().trim().optional(),
		phone: z.string().regex(/^(\d{10})?$/, "Saisissez un numéro à 10 chiffres.").optional(),
		password: z
			.string()
			.min(6, "Le mot de passe doit comporter au moins 6 caractères.")
			.refine((v) => PASSWORD_RULES.every((rule) => rule.test(v)), "Le mot de passe ne respecte pas tous les critères."),
		confirmPassword: z.string().optional(),
		acceptTerms: z.boolean().refine((v) => v === true, "Vous devez accepter les conditions pour continuer."),
	})
	.superRefine((data, ctx) => {
		if (data.confirmPassword && data.password !== data.confirmPassword) {
			ctx.addIssue({ code: "custom", path: ["confirmPassword"], message: "Les mots de passe ne correspondent pas." });
		}
});

export type RegisterInput = z.infer<typeof registerSchema>;