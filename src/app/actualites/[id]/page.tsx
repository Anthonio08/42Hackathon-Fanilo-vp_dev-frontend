import { Navbar } from "@/shared/ui/navbar";
import { Footer } from "@/shared/ui/footer";
import ArticleDetail from "@/features/article/presentation/articleDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ActualiteDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="flex min-h-screen flex-col justify-between">
      <Navbar />
      <main className="w-full flex-1">
        <ArticleDetail id={id} />
      </main>
      <Footer />
    </div>
  );
}

