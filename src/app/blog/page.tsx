import { Navbar } from "@/shared/ui/navbar";
import { Footer } from "@/shared/ui/footer";
import { EditorialLayout } from "@/features/editorial/presentation/editorial-layout";

export default function BlogPage() {
  return (
    <>
      <Navbar />
      <EditorialLayout />
      <Footer />
    </>
  );
}
