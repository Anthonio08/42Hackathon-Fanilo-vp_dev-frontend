import type { UserRole } from "../domain/user.entity";

export const ROLE_COPY: Record<
	UserRole,
	{
		label: string;
		hint: string;
		intro: string;
		emailPlaceholder: string;
		submit: string;
		organization: { label: string; placeholder: string } | null;
	}
	> = {
	journalist: {
		label: "Journaliste",
		hint: "Vérifiez et recoupez vos sources",
		intro: "Accédez aux outils de vérification pensés pour les rédactions.",
		emailPlaceholder: "prenom.nom@media.mg",
		submit: "Créer mon espace journaliste",
		organization: { label: "Média ou rédaction", placeholder: "Nom de votre média" },
	},
	citizen: {
		label: "Utilisateur",
		hint: "Vérifiez avant de partager",
		intro: "Contrôlez une information avant qu'elle ne circule autour de vous.",
		emailPlaceholder: "vous@exemple.mg",
		submit: "Créer mon compte",
		organization: null,
	},
};