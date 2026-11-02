import { AuthLayout } from "@/features/auth/presentation/auth-layout";
import { LoginForm } from "@/features/auth/presentation/login-form";

export default function LoginPage() {
	return (
		<AuthLayout
			imageSrc="/log.jpg"
			caption={{
				title: "Dans le doute, vérifiez.",
				text: "Sources, images, rumeurs : gardez une longueur d'avance sur la désinformation.",
			}}
		>
			<h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Content de vous revoir</h1>
			<p className="text-muted-foreground mt-2 text-sm">
				Connectez-vous pour accéder à votre espace de vérification.
			</p>
			<LoginForm />
		</AuthLayout>
	);
}