import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SocialShareButtons from "@/components/SocialShareButtons";
import AdSlot from "@/components/AdSlot";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import sanitizeHtml from "sanitize-html";
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
      imageCredit: true,
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

  // JSON-LD Schema.org — NewsArticle pour rich snippets Google
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://montrealuncovered.com";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt ?? undefined,
    image: article.imageUrl ? [article.imageUrl] : undefined,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.publishedAt?.toISOString(),
    author: {
      "@type": "Person",
      name: article.author.name ?? "Montréal Uncovered",
    },
    publisher: {
      "@type": "Organization",
      name: "Montréal Uncovered",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/article/${article.slug}`,
    },
    articleSection: article.category.name,
  };

  // TipTap sauvegarde en HTML ; les articles seedés sont en markdown simplifié.
  // On détecte le format au premier caractère non-whitespace.
  const isHtml = /^\s*<(h[1-6]|p|ul|ol|blockquote|figure|img|div|strong|em)/i
    .test(article.content);

  const htmlContent = isHtml
    ? article.content
    : article.content
        .replace(/^## (.+)$/gm, "<h2>$1</h2>")
        .replace(/^### (.+)$/gm, "<h3>$1</h3>")
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>")
        .replace(/^- (.+)$/gm, "<li>$1</li>")
        .replace(/(<li>.*<\/li>\n?)+/g, "<ul>$&</ul>")
        .split("\n\n")
        .map((block: string) => {
          const trimmed = block.trim();
          if (
            !trimmed ||
            trimmed.startsWith("<h") ||
            trimmed.startsWith("<ul") ||
            trimmed.startsWith("<li")
          )
            return trimmed;
          return `<p>${trimmed}</p>`;
        })
        .join("\n");

  // Scinder le contenu en deux pour insérer une pub au milieu (in-article).
  // On coupe sur une fermeture </p> la plus proche du milieu pour ne pas couper un paragraphe.
  const closingPTags: number[] = [];
  const regex = /<\/p>/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(htmlContent)) !== null) {
    closingPTags.push(match.index + match[0].length);
  }

  let htmlFirstHalf = htmlContent;
  let htmlSecondHalf = "";
  if (closingPTags.length >= 4) {
    const midIndex = closingPTags[Math.floor(closingPTags.length / 2)];
    htmlFirstHalf = htmlContent.slice(0, midIndex);
    htmlSecondHalf = htmlContent.slice(midIndex);
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
          <span className="inline-flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-3.5 h-3.5"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {calculateReadingTime(article.content)} min de lecture
          </span>
        </div>

        {/* Hero image */}
        {article.imageUrl ? (
          <figure className="mb-8">
            <div className="w-full aspect-video relative overflow-hidden bg-gray-100">
              <Image
                src={article.imageUrl}
                alt={article.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
                priority
              />
            </div>
            {article.imageCredit && (
              <figcaption
                className="text-xs text-gray-400 mt-2 italic [&_a]:underline [&_a]:hover:text-[#FF0033] [&_a]:transition-colors"
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(article.imageCredit, {
                    allowedTags: ["a", "em", "strong", "span"],
                    allowedAttributes: {
                      a: ["href", "rel", "target", "title", "class"],
                      em: ["class"],
                      strong: ["class"],
                      span: ["class"],
                    },
                  }),
                }}
              />
            )}
          </figure>
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

        {/* Content — première moitié */}
        <article
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: htmlFirstHalf }}
        />

        {/* Ad middle — in-article */}
        {htmlSecondHalf && (
          <AdSlot
            slot="1111111111"
            format="fluid"
            layout="in-article"
            className="my-10"
          />
        )}

        {/* Content — seconde moitié */}
        {htmlSecondHalf && (
          <article
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: htmlSecondHalf }}
          />
        )}

        {/* Ad bottom — après l'article */}
        <AdSlot slot="0000000000" format="auto" className="mt-10" />

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
