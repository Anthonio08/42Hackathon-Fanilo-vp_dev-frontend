"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IncidentFormValues, incidentSchema } from "../domain/incident.schema";

export function useIncidentForm() {
	const [serverError, setServerError] = useState<string | null>(null);

	const form = useForm<IncidentFormValues>({
		resolver: zodResolver(incidentSchema),
		defaultValues: { title: "", description: "", sourceUrl: "", imageUrl: "" },
	});

	const onSubmit = form.handleSubmit(async (values) => {
		setServerError(null);
		try {
			// TODO: brancher le use-case / l'appel API
			// await createIncident(values);
			form.reset();
		} catch {
			setServerError("Impossible d'enregistrer l'incident. Veuillez réessayer.");
		}
	});

	return { form, onSubmit, serverError };
}