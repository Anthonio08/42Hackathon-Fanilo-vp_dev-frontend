import { ThemeToggle } from "@/shared/ui/theme-toggle";

export default function DashboardPage() {
	return (
		<main className="p-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold">Tableau de bord</h1>
				<ThemeToggle />
			</div>
		</main>
	);
}