import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SocialShareButtons from "@/components/SocialShareButtons";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { calculateReadingTime } from "@/lib/readingTime";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await db.article.findUnique({
    where: { slug },
    select: { title: true, excerpt: true, imageUrl: true },
  });

  if (!article) return { title: "Article introuvable" };

  return {
    title: article.title,
    description: article.excerpt ?? undefined,
    openGraph: {
      title: article.title,
      description: article.excerpt ?? undefined,
      images: article.imageUrl ? [article.imageUrl] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;

  const article = await db.article.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
      excerpt: true,
      imageUrl: true,
      publishedAt: true,
      views: true,
      category: { select: { name: true, slug: true } },
      author: { select: { name: true } },
    },
  });

  if (!article) notFound();

  // Incrémenter les vues
  await db.article.update({
    where: { slug },
    data: { views: { increment: 1 } },
  });

  // Convertir le markdown simplifié en HTML
  const htmlContent = article.content
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .split('\n\n')
    .map((block: string) => {
      const trimmed = block.trim();
      if (!trimmed || trimmed.startsWith('<h') || trimmed.startsWith('<ul') || trimmed.startsWith('<li')) return trimmed;
      return `<p>${trimmed}</p>`;
    })
    .join('\n');

  return (
    <>
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-10 w-full">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-400 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-black transition-colors">Accueil</Link>
          <span>/</span>
          <Link
            href={`/${article.category.slug}`}
            className="hover:text-black transition-colors"
          >
            {article.category.name}
          </Link>
        </nav>

        {/* Category */}
        <span
          className="text-xs font-black uppercase tracking-widest px-2 py-1 text-white mb-4 inline-block"
          style={{ backgroundColor: "#FF0033" }}
        >
          {article.category.name}
        </span>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-black leading-tight mt-3 mb-4">
          {article.title}
        </h1>

        {/* Meta */}
        <div className="flex items-center gap-3 text-sm text-gray-400 mb-8 pb-6 border-b border-gray-200 dark:border-gray-800">
          <span>{article.author.name}</span>
          <span>·</span>
          {article.publishedAt && (
            <time>
              {new Date(article.publishedAt).toLocaleDateString("fr-CA", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </time>
          )}
          <span>·</span>
          <span>{calculateReadingTime(article.content)} min de lecture</span>
        </div>

        {/* Hero image */}
        {article.imageUrl ? (
          <div className="w-full aspect-video relative mb-8 overflow-hidden bg-gray-100">
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          </div>
        ) : (
          <div className="w-full aspect-video bg-gray-100 mb-8 flex items-center justify-center">
            <span className="text-gray-400 font-black text-3xl">MTL</span>
          </div>
        )}

        {/* Share top */}
        <div className="mb-8 pb-6 border-b border-gray-100">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
            Partager
          </p>
          <SocialShareButtons title={article.title} />
        </div>

        {/* Content */}
        <div
          className="prose prose-lg max-w-none prose-headings:font-black prose-p:text-gray-800 prose-p:leading-relaxed prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-strong:text-black prose-li:text-gray-700"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        {/* Share bottom */}
        <div className="mt-10 pt-6 border-t border-gray-200">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
            Vous avez aimé cet article ? Partagez-le !
          </p>
          <SocialShareButtons title={article.title} />
        </div>
      </main>
      <Footer />
    </>
  );
}
