import Link from "next/link";

interface SectionHeaderProps {
  title: string;
  href?: string;
  label?: string;
  accent?: boolean;
}

export default function SectionHeader({
  title,
  href,
  label = "Voir tout",
  accent = false,
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        {accent && (
          <span className="w-1 h-6 bg-red-600 inline-block" />
        )}
        <h2 className="text-xl font-black uppercase tracking-tight">{title}</h2>
      </div>
      {href && (
        <Link
          href={href}
          className="text-xs font-black uppercase tracking-widest text-red-600 hover:text-black transition-colors"
        >
          {label} →
        </Link>
      )}
    </div>
  );
}
