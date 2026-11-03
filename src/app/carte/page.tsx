import { Suspense } from "react";
import { CarteLayout } from "@/features/cartes/presentation/CarteLayout"; 
import ChatWidget from "@/features/chatwidge/ChatWidget";
import { Footer } from "@/shared/ui/footer";
import { Navbar } from "@/shared/ui/navbar";

export default function CartPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div className="min-h-screen" />}>
        <CarteLayout />
      </Suspense>
      <ChatWidget />
      <Footer />
    </>
  );
}
