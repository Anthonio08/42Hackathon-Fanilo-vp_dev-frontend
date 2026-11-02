import { Navbar } from "@/shared/ui/navbar";
import { Footer } from "@/shared/ui/footer";
import { EditorialDetailPage } from "@/features/editorial/presentation/editorial-detail";

export default async function EditorialDetailPageWrapper({
  params,
}: {
  params: Promise<{ identifier: string }>;
}) {
  const { identifier } = await params;
  return (
    <>
      <Navbar />
      <EditorialDetailPage identifier={identifier} />
      <Footer />
    </>
  );
}

