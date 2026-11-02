import ArticleDetail from "@/features/article/presentation/articleDetail";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div>
      <p className="p-4 text-sm text-gray-400">Article n°{id}</p>
      <ArticleDetail />
    </div>
  );
}