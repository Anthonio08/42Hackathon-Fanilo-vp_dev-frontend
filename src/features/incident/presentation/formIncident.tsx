"use client";

import { FileText, Heading, ImageIcon, Link2, Loader2, Send } from "lucide-react";
import { TextField } from "@/shared/ui/field";
import { useIncidentForm } from "./use-incident-form";

const enter =
	"motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 fill-mode-backwards duration-500";

const STEP_DELAY_MS = 100;

export function IncidentForm() {
	const { form, onSubmit, serverError } = useIncidentForm();
	const { register, formState } = form;
	const { errors, isSubmitting } = formState;

	const delay = (step: number) => ({ animationDelay: `${step * STEP_DELAY_MS}ms` });

	return (
		<form onSubmit={onSubmit} noValidate className="mt-7 space-y-5 border-t border-gray-100 pt-6">
			<div className={enter} style={delay(1)}>
				<TextField
					label="Titre"
					type="text"
					className="w-full"
					placeholder="Ex. : Panne de diffusion sur le flux principal"
					error={errors.title?.message}
					{...register("title")}
				/>
			</div>

			<div className={enter} style={delay(2)}>
				<div className="space-y-1.5">
					<label htmlFor="description" className="flex items-center gap-2 text-sm font-medium light:text-gray-900">
						Description
					</label>
					<textarea
						id="description"
						rows={5}
						placeholder="Décrivez l'incident : contexte, impact, heure d'apparition…"
						aria-invalid={!!errors.description}
						aria-describedby={errors.description ? "description-error" : undefined}
						className="w-full resize-y rounded-2xl border light:border-gray-200 light:bg-gray-50/50 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus-visible:border-red-500 light:focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-red-500/10 aria-invalid:border-red-500 aria-invalid:ring-4 aria-invalid:ring-red-500/10"
						{...register("description")}
					/>
					{errors.description && (
						<p id="description-error" className="text-xs text-red-600">
							{errors.description.message}
						</p>
					)}
				</div>
			</div>

			<div className={enter} style={delay(3)}>
				<TextField
					label="URL de la source (optionnel)"
					type="url"
					icon={Link2}
					autoComplete="url"
					placeholder="https://exemple.com/article"
					className="w-full"
					error={errors.sourceUrl?.message}
					{...register("sourceUrl")}
				/>
			</div>

			<div className={enter} style={delay(4)}>
				<TextField
					label="URL de l'image (optionnel)"
					type="url"
					icon={ImageIcon}
					placeholder="https://exemple.com/image.jpg"
					className="w-full"
					error={errors.imageUrl?.message}
					{...register("imageUrl")}
				/>
			</div>

			{serverError && (
				<p
					role="alert"
					className="motion-safe:animate-shake rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700"
				>
					{serverError}
				</p>
			)}

			<div className={enter} style={delay(5)}>
				<button
					type="submit"
					disabled={isSubmitting}
					className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-linear-to-b from-red-500 to-red-600 text-sm font-semibold text-white ring-1 ring-inset ring-white/10 transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/30 active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
				>
					{isSubmitting ? (
						<Loader2 className="size-4 animate-spin" aria-hidden />
					) : (
						<Send className="size-4" aria-hidden />
					)}
					{isSubmitting ? "Envoi en cours…" : "Signaler l'incident"}
				</button>
			</div>
		</form>
	);
}