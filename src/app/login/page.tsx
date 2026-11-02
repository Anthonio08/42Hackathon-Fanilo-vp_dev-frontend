"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { authStorage } from "@/core/api.client";
import { AuthLayout } from "@/features/auth/presentation/auth-layout";
import { LoginForm } from "@/features/auth/presentation/login-form";

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
    <AuthLayout
      imageSrc="/log.jpg"
      caption={{
        title: "Dans le doute, vérifiez.",
        text: "Sources, images, rumeurs : gardez une longueur d'avance sur la désinformation.",
      }}
    >
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
        Content de vous revoir
      </h1>
      <p className="text-muted-foreground mt-2 text-sm">
        Connectez-vous pour accéder à votre espace de vérification.
      </p>
      <LoginForm />
    </AuthLayout>
  );
}
