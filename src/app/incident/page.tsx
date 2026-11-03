"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { authStorage } from "@/core/api.client";
import { AuthLayout } from "@/features/auth/presentation/auth-layout";
import { IncidentForm } from "@/features/incident/presentation/formIncident";
import { Navbar } from "@/shared/ui/navbar";
import { TriangleAlert } from "lucide-react";

function subscribeAuth(callback: () => void) {
  window.addEventListener("auth:change", callback);
  window.addEventListener("storage", callback);
  return () => {
	window.removeEventListener("auth:change", callback);
	window.removeEventListener("storage", callback);
  };
}

const getAuthSnapshot = () => authStorage.isAuthenticated();
const getAuthServerSnapshot = () => false;

export default function LoginPage() {
	const router = useRouter();
	const isAuthenticated = useSyncExternalStore(
		subscribeAuth,
		getAuthSnapshot,
		getAuthServerSnapshot
	);

	useEffect(() => {
		if (isAuthenticated) {
		router.replace("/");
		}
	}, [isAuthenticated, router]);

	if (isAuthenticated) {
		return null;
	}

	return (
		<>
			<Navbar />
			<div className="w-full max-w-7xl mx-auto px-4 py-8">
				<div className="flex flex-col items-center">
					<div className="w-full max-w-md">
						<h1 className="relative inline-block pb-1 text-3xl m-1 font-extrabold text-gray-950 dark:text-white after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-16 after:border-b-2 after:border-red-600">
							Signaler un incident
						</h1>
						<p className="text-sm light:text-gray-500 mt-5 mb-5">
							Décrivez le problème rencontré, nous le traitons au plus vite.
						</p>
						<IncidentForm />
					</div>
				</div>
			</div>
			<footer/>
		</>
	);
}
