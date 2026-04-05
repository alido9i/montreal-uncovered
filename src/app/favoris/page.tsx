import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mes favoris",
  robots: { index: false, follow: false },
};

export default async function FavorisPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login?callbackUrl=/favoris");
  }

  const saved = await db.savedArticle.findMany({
    where: { user: { email: session.user.email } },
    orderBy: { savedAt: "desc" },
    include: {
      article: {
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          imageUrl: true,
          publishedAt: true,
          category: { select: { name: true, slug: true } },
        },
      },
    },
  });

  return (
    <>
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-10 w-full">
        <h1 className="text-3xl md:text-4xl font-black mb-2">Mes favoris</h1>
        <p className="text-sm text-gray-500 mb-10">
          {saved.length} article{saved.length > 1 ? "s" : ""} sauvegardé
          {saved.length > 1 ? "s" : ""}
        </p>

        {saved.length === 0 ? (
          <div className="border border-dashed border-gray-300 dark:border-gray-700 p-10 text-center">
            <p className="text-gray-500 mb-4">
              Vous n&apos;avez pas encore de favoris.
            </p>
            <Link
              href="/"
              className="inline-block px-5 py-2.5 bg-[#FF0033] text-white text-xs font-black uppercase tracking-widest hover:bg-black transition-colors"
            >
              Découvrir les articles
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-800">
            {saved.map((s) => (
              <li key={s.id} className="py-6">
                <Link
                  href={`/article/${s.article.slug}`}
                  className="group flex gap-4 items-start"
                >
                  {s.article.imageUrl && (
                    <div className="relative w-32 h-24 flex-shrink-0 bg-gray-100 overflow-hidden">
                      <Image
                        src={s.article.imageUrl}
                        alt={s.article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                        sizes="128px"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-black uppercase tracking-widest text-[#FF0033]">
                      {s.article.category.name}
                    </span>
                    <h2 className="text-lg md:text-xl font-black mt-1 group-hover:text-[#FF0033] transition-colors">
                      {s.article.title}
                    </h2>
                    {s.article.excerpt && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {s.article.excerpt}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      Ajouté le{" "}
                      {new Date(s.savedAt).toLocaleDateString("fr-CA", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
    </>
  );
}
