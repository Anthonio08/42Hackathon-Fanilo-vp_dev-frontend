import { Article } from "@/features/home/presentation/article";
import { ArticleCard } from "@/shared/ui/article_card";
export default function Actualites() {
    
    const getAll = () => {
        
    }


    return (
    <>
        <main className="w-full px-4 pb-8 pt-3 sm:px-6">
            <div className="mx-auto w-full max-w-6xl">
                <h2 className="relative inline-block pb-1 mb-5 text-lg font-bold text-gray-950 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-15 after:border-b-2 after:border-red-600">
                    Dernières actualités
                </h2>
    
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {/* {paginated.map((article, index) => (
                        <ArticleCard article={article} key={index}/>
                    ))} */}
                </div>
            </div>
        </main>
    </>
)
}