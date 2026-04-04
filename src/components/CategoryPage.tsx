import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";
import { db } from "@/lib/db";

interface CategoryPageProps {
  slug: string;
  title: string;
  description: string;
}

export default async function CategoryPage({ slug, title, description }: CategoryPageProps) {
  const articles = await db.article.findMany({
    where: { published: true, category: { slug } },
    orderBy: { publishedAt: "desc" },
    select: {
      title: true,
      slug: true,
      excerpt: true,
      imageUrl: true,
      publishedAt: true,
      category: { select: { name: true, slug: true } },
    },
  });

  return (
    <>
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="border-b-4 border-black pb-3 mb-8">
          <h1 className="text-4xl font-black uppercase">{title}</h1>
          <p className="text-gray-500 mt-1">{description}</p>
        </div>
        {articles.length === 0 ? (
          <p className="text-gray-400 text-center py-16">Aucun article dans cette catégorie.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard
                key={article.slug}
                title={article.title}
                slug={article.slug}
                excerpt={article.excerpt}
                imageUrl={article.imageUrl}
                category={article.category.name}
                categorySlug={article.category.slug}
                publishedAt={article.publishedAt}
              />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
