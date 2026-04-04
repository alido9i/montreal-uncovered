import Link from "next/link";

interface VideoCardProps {
  title: string;
  slug: string;
  thumbnailUrl?: string | null;
  category: string;
  duration?: string;
}

export default function VideoCard({
  title,
  slug,
  thumbnailUrl,
  category,
  duration,
}: VideoCardProps) {
  return (
    <Link href={`/article/${slug}`} className="group block">
      <div className="relative aspect-[9/16] bg-gray-900 overflow-hidden rounded-sm">
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-gray-800 to-black">
            <span className="text-white font-black text-2xl opacity-20">MTL</span>
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all"
            style={{ backgroundColor: "#FF0033" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Duration */}
        {duration && (
          <span className="absolute top-2 right-2 text-xs font-bold bg-black/60 text-white px-2 py-0.5 rounded">
            {duration}
          </span>
        )}

        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <span
            className="text-xs font-black uppercase tracking-widest block mb-1"
            style={{ color: "#FF0033" }}
          >
            {category}
          </span>
          <h3 className="text-white text-sm font-black leading-snug line-clamp-2 group-hover:text-red-400 transition-colors">
            {title}
          </h3>
        </div>
      </div>
    </Link>
  );
}
