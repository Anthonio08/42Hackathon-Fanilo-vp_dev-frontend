import { z } from "zod";

const optionalUrl = z
	.string()
	.trim()
	.url("URL invalide")
	.optional()
	.or(z.literal(""));

export const incidentSchema = z.object({
	title: z
		.string()
		.trim()
		.min(3, "Le titre doit contenir au moins 3 caractères")
		.max(120, "Le titre ne doit pas dépasser 120 caractères"),
	description: z
		.string()
		.trim()
		.min(10, "La description doit contenir au moins 10 caractères")
		.max(2000, "La description ne doit pas dépasser 2000 caractères"),
	sourceUrl: optionalUrl,
	imageUrl: optionalUrl,
});

export type IncidentFormValues = z.infer<typeof incidentSchema>;