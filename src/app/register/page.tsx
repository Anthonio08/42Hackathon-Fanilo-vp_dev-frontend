import { AuthLayout } from "@/features/auth/presentation/auth-layout";
import { RegisterForm } from "@/features/auth/presentation/register-form";


export default function RegisterPage() {
	return (
		<AuthLayout
			imageSrc="/register.jpg"
			caption={{
				title: "Rejoignez la veille contre la désinformation.",
				text: "Créez votre espace en une minute et vérifiez avant de publier ou de partager.",
			}}
		>
			<h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Créer un compte</h1>
			<p className="text-muted-foreground mt-2 text-sm">Choisissez votre profil, le reste s'adapte.</p>
			<RegisterForm />
		</AuthLayout>
	);
}