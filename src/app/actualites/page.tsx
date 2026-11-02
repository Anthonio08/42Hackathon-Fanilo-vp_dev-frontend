import Actualites from "@/features/article/presentation/actualites";
import ChatWidget from "@/features/chatwidge/ChatWidget";
import { Footer } from "@/shared/ui/footer";
import { Navbar } from "@/shared/ui/navbar";

export default function ActualitesRoute() {
  return (
    <div className="flex min-h-screen flex-col justify-between">
      <Navbar />
      <Actualites />
      <ChatWidget />
      <Footer />
    </div>
  );
}
