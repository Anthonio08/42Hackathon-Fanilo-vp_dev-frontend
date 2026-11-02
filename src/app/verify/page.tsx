import { Suspense } from "react";
import { Navbar } from "@/shared/ui/navbar";
import { Footer } from "@/shared/ui/footer";
import { VerifyLayout } from "@/features/verification/presentation/verify-layout";

export default function VerifyPage() {
  return (
    <div className="flex min-h-screen flex-col justify-between">
      <Navbar />
      <Suspense
        fallback={
          <div className="mx-auto flex w-full max-w-7xl items-center justify-center px-6 py-24 text-sm text-gray-500">
            Chargement du module de vérification...
          </div>
        }
      >
        <VerifyLayout />
      </Suspense>
      <Footer />
    </div>
  );
}

