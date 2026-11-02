"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { authStorage } from "@/core/api.client";
import { AuthLayout } from "@/features/auth/presentation/auth-layout";
import { RegisterForm } from "@/features/auth/presentation/register-form";

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

export default function RegisterPage() {
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
    <AuthLayout
      imageSrc="/register.jpg"
      caption={{
        title: "Rejoignez la veille contre la désinformation.",
        text: "Créez votre espace en une minute et vérifiez avant de publier ou de partager.",
      }}
    >
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
        Créer un compte
      </h1>
      <p className="text-muted-foreground mt-2 text-sm">
        Choisissez votre profil, le reste s&apos;adapte.
      </p>
      <RegisterForm />
    </AuthLayout>
  );
}
