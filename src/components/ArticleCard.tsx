"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

interface ArticleCardProps {
  title: string;
  slug: string;
  excerpt?: string | null;
  imageUrl?: string | null;
  category: string;
  categorySlug: string;
  publishedAt?: Date | string | null;
  size?: "default" | "large" | "small";
  variant?: "default" | "overlay" | "horizontal";
}

function formatDate(date: Date | string | null | undefined) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("fr-CA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ArticleCard({
  title,
  slug,
  excerpt,
  imageUrl,
  category,
  publishedAt,
  size = "default",
  variant = "default",
}: ArticleCardProps) {
  const isLarge = size === "large";
  const isSmall = size === "small";

  /* ── OVERLAY variant ── */
  if (variant === "overlay") {
    return (
      <Link href={`/article/${slug}`} className="group block relative h-full">
        <motion.article
          className={`relative overflow-hidden w-full h-full bg-gray-900 ${
            isLarge ? "min-h-[380px] md:min-h-[480px]" : "min-h-[200px]"
          }`}
          whileHover="hover"
        >
          {imageUrl ? (
            <motion.div
              className="absolute inset-0"
              variants={{ hover: { scale: 1.08 } }}
              transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <Image src={imageUrl} alt={title} fill className="object-cover" sizes={isLarge ? "70vw" : "35vw"} />
            </motion.div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-950" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent group-hover:from-black/95 transition-all duration-500" />
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
            <motion.span
              className="text-xs font-black uppercase tracking-widest text-white mb-2 inline-block px-2 py-0.5 bg-[#FF0033]"
              variants={{ hover: { x: 4 } }}
              transition={{ duration: 0.3 }}
            >
              {category}
            </motion.span>
            <h2 className={`font-black text-white leading-tight group-hover:text-[#FF0033] transition-colors duration-300 ${
              isLarge ? "text-xl md:text-3xl" : "text-sm md:text-base"
            }`}>
              {title}
            </h2>
            {excerpt && isLarge && (
              <p className="text-gray-300 text-sm mt-2 line-clamp-2 hidden md:block">{excerpt}</p>
            )}
          </div>
        </motion.article>
      </Link>
    );
  }

  /* ── HORIZONTAL variant ── */
  if (variant === "horizontal") {
    return (
      <Link href={`/article/${slug}`} className="group block">
        <motion.article className="flex gap-4 items-start" whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
          <div className="relative shrink-0 w-28 h-20 bg-gray-200 overflow-hidden rounded">
            {imageUrl ? (
              <Image src={imageUrl} alt={title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" sizes="112px" />
            ) : (
              <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                <span className="text-gray-600 text-xs font-black">MTL</span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-xs font-black uppercase tracking-widest text-[#FF0033]">{category}</span>
            <h3 className="text-sm font-bold leading-snug group-hover:text-[#FF0033] transition-colors duration-200 line-clamp-2">{title}</h3>
            {publishedAt && <time className="text-xs text-gray-400">{formatDate(publishedAt)}</time>}
          </div>
        </motion.article>
      </Link>
    );
  }

  /* ── DEFAULT variant ── */
  return (
    <Link href={`/article/${slug}`} className="group block h-full">
      <motion.article
        className="h-full flex flex-col"
        whileHover="hover"
      >
        <div className={`relative overflow-hidden bg-gray-200 rounded-sm ${
          isLarge ? "aspect-[16/9]" : isSmall ? "aspect-[4/3]" : "aspect-[3/2]"
        }`}>
          {imageUrl ? (
            <motion.div
              className="absolute inset-0"
              variants={{ hover: { scale: 1.06 } }}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <Image src={imageUrl} alt={title} fill className="object-cover" sizes={isLarge ? "100vw" : "(max-width: 768px) 100vw, 50vw"} />
            </motion.div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-3xl font-black">MTL</span>
            </div>
          )}
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-500" />
          <motion.span
            className="absolute top-3 left-3 text-xs font-black uppercase tracking-widest px-2 py-0.5 text-white bg-[#FF0033]"
            variants={{ hover: { scale: 1.05, x: 2 } }}
            transition={{ duration: 0.2 }}
          >
            {category}
          </motion.span>
        </div>
        <div className="flex flex-col flex-1 pt-3 gap-1">
          <h2 className={`font-black leading-tight group-hover:text-[#FF0033] transition-colors duration-200 ${
            isLarge ? "text-2xl md:text-3xl" : isSmall ? "text-sm" : "text-base md:text-lg"
          }`}>
            {title}
          </h2>
          {excerpt && !isSmall && (
            <p className="text-gray-500 text-sm line-clamp-2">{excerpt}</p>
          )}
          {publishedAt && (
            <time className="text-xs text-gray-400 mt-auto pt-2">{formatDate(publishedAt)}</time>
          )}
        </div>
      </motion.article>
    </Link>
  );
}
