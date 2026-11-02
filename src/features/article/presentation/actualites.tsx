import { Article } from "@/features/home/presentation/article";
export default function Actualites() {
    
    return (
    <>
        <main className="w-full px-4 pb-8 pt-3 sm:px-6">
            <div className="mx-auto w-full max-w-6xl">
                <Article active="Tous" />
            </div>
        </main>
    </>
)
}