import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryNav from "@/components/CategoryNav";
import HeroCarousel from "@/components/HeroCarousel";
import ArticleCard from "@/components/ArticleCard";
import TrendingSection from "@/components/TrendingSection";
import WeekendAgenda from "@/components/WeekendAgenda";
import SectionHeader from "@/components/SectionHeader";
import NewsletterSegmented from "@/components/NewsletterSegmented";
import ScrollReveal from "@/components/animations/ScrollReveal";
import StaggerChildren, { StaggerItem } from "@/components/animations/StaggerChildren";
import { db } from "@/lib/db";
import { calculateReadingTime } from "@/lib/readingTime";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const allArticles = await db.article.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    select: {
      title: true, slug: true, excerpt: true, imageUrl: true,
      publishedAt: true, views: true, content: true,
      category: { select: { name: true, slug: true } },
    },
  });

  const trendingArticles = await db.article.findMany({
    where: { published: true },
    orderBy: { views: "desc" },
    take: 5,
    select: {
      title: true, slug: true, views: true,
      category: { select: { name: true, slug: true } },
    },
  });

  // Hero: top 5 most viewed for cinematic carousel
  const heroArticles = await db.article.findMany({
    where: { published: true, imageUrl: { not: null } },
    orderBy: { views: "desc" },
    take: 5,
    select: {
      title: true, slug: true, excerpt: true, imageUrl: true, content: true,
      category: { select: { name: true, slug: true } },
    },
  });

  const heroSlides = heroArticles.map((a) => ({
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt,
    imageUrl: a.imageUrl,
    category: a.category.name,
    categorySlug: a.category.slug,
    readingTime: calculateReadingTime(a.content),
  }));

  const latest = allArticles.slice(0, 8);
  const localArticles = allArticles.filter((a) => a.category.slug === "montreal-local").slice(0, 3);
  const gastroArticles = allArticles.filter((a) => a.category.slug === "gastronomie").slice(0, 4);

  const categories = await db.category.findMany({
    select: { name: true, slug: true },
    orderBy: { name: "asc" },
  });

  const categoryDescriptions: Record<string, string> = {
    "montreal-local": "Actualités et vie de quartier",
    "culture": "Films, humour et tendances",
    "gastronomie": "Restaurants et recettes",
    "societe": "Débats et reportages",
    "style-de-vie": "Tendances et quotidien",
    "ailleurs": "Le monde vu de MTL",
  };

  return (
    <>
      <Header />
      <CategoryNav />

      <main className="flex-1">

        {/* ── HERO CAROUSEL ────────────────────────────── */}
        <HeroCarousel slides={heroSlides} />

        {/* ── LATEST + TRENDING + AGENDA ───────────────── */}
        <section className="max-w-7xl mx-auto px-4 py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

            {/* Latest articles — 7/12 */}
            <div className="lg:col-span-7">
              <ScrollReveal>
                <SectionHeader title="Derniers articles" accent />
              </ScrollReveal>
              <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8" staggerDelay={0.08}>
                {latest.slice(0, 6).map((a) => (
                  <StaggerItem key={a.slug}>
                    <ArticleCard
                      title={a.title} slug={a.slug} excerpt={a.excerpt}
                      imageUrl={a.imageUrl} category={a.category.name}
                      categorySlug={a.category.slug} publishedAt={a.publishedAt}
                    />
                  </StaggerItem>
                ))}
              </StaggerChildren>
            </div>

            {/* Right sidebar — 5/12 */}
            <div className="lg:col-span-5 space-y-8">
              <ScrollReveal direction="right" delay={0.1}>
                <TrendingSection
                  articles={trendingArticles.map((a) => ({
                    title: a.title, slug: a.slug, category: a.category.name,
                    categorySlug: a.category.slug, views: a.views,
                  }))}
                />
              </ScrollReveal>

              <ScrollReveal direction="right" delay={0.2}>
                <WeekendAgenda />
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ── GASTRONOMIE STRIP ────────────────────────── */}
        {gastroArticles.length > 0 && (
          <section className="bg-[var(--surface-2)] dark:bg-[var(--surface)] py-14">
            <div className="max-w-7xl mx-auto px-4">
              <ScrollReveal>
                <SectionHeader title="Gastronomie" href="/gastronomie" accent />
              </ScrollReveal>
              <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" staggerDelay={0.08}>
                {gastroArticles.map((a) => (
                  <StaggerItem key={a.slug}>
                    <ArticleCard
                      title={a.title} slug={a.slug} excerpt={a.excerpt}
                      imageUrl={a.imageUrl} category={a.category.name}
                      categorySlug={a.category.slug} publishedAt={a.publishedAt}
                      size="small"
                    />
                  </StaggerItem>
                ))}
              </StaggerChildren>
            </div>
          </section>
        )}

        {/* ── MONTRÉAL LOCAL ───────────────────────────── */}
        {localArticles.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 py-14">
            <ScrollReveal>
              <SectionHeader title="Montréal Local" href="/montreal-local" accent />
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ScrollReveal className="md:col-span-1" delay={0.1}>
                <ArticleCard
                  title={localArticles[0].title} slug={localArticles[0].slug}
                  excerpt={localArticles[0].excerpt} imageUrl={localArticles[0].imageUrl}
                  category={localArticles[0].category.name} categorySlug={localArticles[0].category.slug}
                  publishedAt={localArticles[0].publishedAt} size="large"
                />
              </ScrollReveal>
              <ScrollReveal className="md:col-span-2" delay={0.2}>
                <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
                  {localArticles.slice(1).map((a) => (
                    <div key={a.slug} className="py-4 first:pt-0">
                      <ArticleCard
                        title={a.title} slug={a.slug} excerpt={a.excerpt}
                        imageUrl={a.imageUrl} category={a.category.name}
                        categorySlug={a.category.slug} publishedAt={a.publishedAt}
                        variant="horizontal"
                      />
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            </div>
          </section>
        )}

        {/* ── CATEGORIES ───────────────────────────────── */}
        <section className="bg-black text-white py-14">
          <div className="max-w-7xl mx-auto px-4">
            <ScrollReveal>
              <h2 className="text-xl font-black uppercase tracking-widest mb-8 text-center text-gray-500">
                Explorer par section
              </h2>
            </ScrollReveal>
            <StaggerChildren className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3" staggerDelay={0.06}>
              {categories.map((cat) => (
                <StaggerItem key={cat.slug}>
                  <a
                    href={`/${cat.slug}`}
                    className="group border border-gray-800 p-4 hover:border-[#FF0033] transition-all duration-300 rounded-sm block hover:-translate-y-1 hover:shadow-lg hover:shadow-red-900/20"
                  >
                    <h3 className="font-black text-sm mb-1 group-hover:text-[#FF0033] transition-colors">{cat.name}</h3>
                    <p className="text-xs text-gray-600">{categoryDescriptions[cat.slug] ?? ""}</p>
                  </a>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </section>

        {/* ── NEWSLETTER SEGMENTED ─────────────────────── */}
        <section className="relative bg-gradient-to-b from-black via-gray-950 to-black text-white py-20 px-4 overflow-hidden">
          {/* Decorative grid */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: "linear-gradient(var(--accent) 1px, transparent 1px), linear-gradient(90deg, var(--accent) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }} />
          <ScrollReveal>
            <div className="relative max-w-xl mx-auto text-center">
              <p className="text-xs font-black uppercase tracking-[0.3em] mb-4 text-[#FF0033]">Infolettre</p>
              <h2 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
                Montréal dans<br />votre boîte mail
              </h2>
              <p className="text-gray-400 mb-8 text-sm max-w-md mx-auto">
                Choisissez ce qui vous intéresse. On s'occupe du reste.
              </p>
              <NewsletterSegmented />
            </div>
          </ScrollReveal>
        </section>

      </main>
      <Footer />
    </>
  );
}
