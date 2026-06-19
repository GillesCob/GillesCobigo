import { useState } from "react";
import ArticleCard from "@/components/articles/ArticleCard";
import { useArticles } from "@/hooks/useArticles";
import { Button } from "@/components/ui/button";

export default function Articles() {
  const [page, setPage] = useState(1);
  const { data: articles, isLoading, isError } = useArticles(page, 9);

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 mt-11">
      <h1 className="text-3xl font-bold mb-3">Articles</h1>
      <p className="text-muted-foreground mb-12">
        Notes de parcours, retours d&apos;expérience, explorations techniques.
      </p>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      )}

      {isError && (
        <p className="text-muted-foreground text-center py-20">
          Les articles ne sont pas disponibles pour l&apos;instant.
        </p>
      )}

      {articles && articles.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
          <div className="flex justify-center gap-3 mt-12">
            {page > 1 && (
              <Button variant="outline" onClick={() => setPage((p) => p - 1)}>
                Précédent
              </Button>
            )}
            {articles.length === 9 && (
              <Button variant="outline" onClick={() => setPage((p) => p + 1)}>
                Suivant
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
