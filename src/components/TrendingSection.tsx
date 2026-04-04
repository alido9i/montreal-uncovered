import Link from "next/link";
import SectionHeader from "./SectionHeader";

interface TrendingArticle {
  title: string;
  slug: string;
  category: string;
  categorySlug: string;
  views?: number;
}

interface TrendingSectionProps {
  articles: TrendingArticle[];
}

export default function TrendingSection({ articles }: TrendingSectionProps) {
  return (
    <aside>
      <SectionHeader title="Tendances" accent />
      <ol className="space-y-0">
        {articles.map((article, index) => (
          <li key={article.slug}>
            <Link
              href={`/article/${article.slug}`}
              className="group flex items-start gap-4 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors -mx-3 px-3"
            >
              {/* Numéro */}
              <span
                className="text-3xl font-black leading-none shrink-0 tabular-nums"
                style={{ color: index === 0 ? "#FF0033" : "#E5E7EB" }}
              >
                {String(index + 1).padStart(2, "0")}
              </span>

              {/* Content */}
              <div className="flex flex-col gap-1 min-w-0">
                <span
                  className="text-xs font-black uppercase tracking-widest"
                  style={{ color: "#FF0033" }}
                >
                  {article.category}
                </span>
                <span className="text-sm font-bold leading-snug group-hover:text-red-600 transition-colors line-clamp-2">
                  {article.title}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </aside>
  );
}
