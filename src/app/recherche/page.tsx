import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { db } from "@/lib/db";

interface Props {
  searchParams: Promise<{ q?: string; page?: string }>;
}

const PAGE_SIZE = 10;

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Résultats pour « ${q} »` : "Recherche",
    description: q
      ? `Articles correspondant à « ${q} » sur Montréal Uncovered.`
      : "Recherchez dans les articles de Montréal Uncovered.",
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q: rawQ, page: rawPage } = await searchParams;
  const q = (rawQ ?? "").trim();
  const page = Math.max(1, parseInt(rawPage ?? "1", 10) || 1);

  let articles: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    imageUrl: string | null;
    publishedAt: Date | null;
    category: { name: string; slug: string };
  }> = [];
  let total = 0;

  if (q.length >= 2) {
    const where = {
      published: true,
      OR: [
        { title: { contains: q, mode: "insensitive" as const } },
        { excerpt: { contains: q, mode: "insensitive" as const } },
        { content: { contains: q, mode: "insensitive" as const } },
      ],
    };

    [articles, total] = await Promise.all([
      db.article.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          imageUrl: true,
          publishedAt: true,
          category: { select: { name: true, slug: true } },
        },
      }),
      db.article.count({ where }),
    ]);
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-10 w-full">
        <h1 className="text-3xl md:text-4xl font-black mb-6">Recherche</h1>

        {/* Formulaire — GET pour garder l'URL partageable */}
        <form action="/recherche" method="get" className="mb-10">
          <div className="flex gap-2">
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Poutine, Plateau, festival..."
              aria-label="Rechercher un article"
              className="flex-1 border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-3 focus:outline-none focus:border-[#FF0033]"
              required
              minLength={2}
            />
            <button
              type="submit"
              className="bg-[#FF0033] text-white font-black uppercase tracking-widest text-xs px-6 hover:bg-black transition-colors"
            >
              Rechercher
            </button>
          </div>
        </form>

        {q.length >= 2 ? (
          <>
            <p className="text-sm text-gray-500 mb-6">
              {total} résultat{total > 1 ? "s" : ""} pour « <strong>{q}</strong> »
            </p>

            {articles.length === 0 ? (
              <p className="text-gray-500">Aucun article trouvé.</p>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-800">
                {articles.map((a) => (
                  <li key={a.id} className="py-6">
                    <Link
                      href={`/article/${a.slug}`}
                      className="group flex gap-4 items-start"
                    >
                      {a.imageUrl && (
                        <div className="relative w-32 h-24 flex-shrink-0 bg-gray-100 overflow-hidden">
                          <Image
                            src={a.imageUrl}
                            alt={a.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                            sizes="128px"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-black uppercase tracking-widest text-[#FF0033]">
                          {a.category.name}
                        </span>
                        <h2 className="text-lg md:text-xl font-black mt-1 group-hover:text-[#FF0033] transition-colors">
                          {a.title}
                        </h2>
                        {a.excerpt && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {a.excerpt}
                          </p>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <nav
                className="flex items-center justify-center gap-2 mt-10"
                aria-label="Pagination"
              >
                {page > 1 && (
                  <Link
                    href={`/recherche?q=${encodeURIComponent(q)}&page=${page - 1}`}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-sm font-bold uppercase tracking-widest hover:bg-[#FF0033] hover:text-white hover:border-[#FF0033] transition-colors"
                  >
                    ← Préc.
                  </Link>
                )}
                <span className="text-sm text-gray-500 px-3">
                  Page {page} / {totalPages}
                </span>
                {page < totalPages && (
                  <Link
                    href={`/recherche?q=${encodeURIComponent(q)}&page=${page + 1}`}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-sm font-bold uppercase tracking-widest hover:bg-[#FF0033] hover:text-white hover:border-[#FF0033] transition-colors"
                  >
                    Suiv. →
                  </Link>
                )}
              </nav>
            )}
          </>
        ) : (
          <p className="text-gray-500">
            Saisis au moins 2 caractères pour lancer une recherche.
          </p>
        )}
      </main>
      <Footer />
    </>
  );
}
