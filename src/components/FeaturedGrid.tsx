import ArticleCard from "./ArticleCard";

interface Article {
  title: string;
  slug: string;
  excerpt?: string | null;
  imageUrl?: string | null;
  category: string;
  categorySlug: string;
  publishedAt?: Date | string | null;
}

interface FeaturedGridProps {
  featured: Article;
  secondary: Article[];
}

export default function FeaturedGrid({ featured, secondary }: FeaturedGridProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-1 bg-black">
      {/* Article principal — 7/12 colonnes */}
      <div className="lg:col-span-7">
        <ArticleCard {...featured} size="large" variant="overlay" />
      </div>

      {/* Colonne droite — 5/12 */}
      <div className="lg:col-span-5 grid grid-rows-2 gap-1">
        {/* Top right — 2 articles côte à côte */}
        <div className="grid grid-cols-2 gap-1">
          {secondary.slice(0, 2).map((article) => (
            <ArticleCard key={article.slug} {...article} size="small" variant="overlay" />
          ))}
        </div>

        {/* Bottom right — 2 articles côte à côte */}
        <div className="grid grid-cols-2 gap-1">
          {secondary.slice(2, 4).map((article) => (
            <ArticleCard key={article.slug} {...article} size="small" variant="overlay" />
          ))}
        </div>
      </div>
    </div>
  );
}
