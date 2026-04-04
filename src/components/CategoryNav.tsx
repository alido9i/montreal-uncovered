"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "Tout", href: "/" },
  { label: "Montréal Local", href: "/montreal-local" },
  { label: "Culture", href: "/culture" },
  { label: "Gastronomie", href: "/gastronomie" },
  { label: "Société", href: "/societe" },
  { label: "Style de vie", href: "/style-de-vie" },
  { label: "Ailleurs", href: "/ailleurs" },
];

export default function CategoryNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-gray-200 dark:border-gray-800 bg-[var(--background)]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-0 overflow-x-auto scrollbar-none">
          {navLinks.map((link) => {
            const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  shrink-0 px-4 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-colors
                  ${isActive
                    ? "border-red-600 text-[var(--foreground)]"
                    : "border-transparent text-gray-500 hover:text-[var(--foreground)] hover:border-gray-300 dark:hover:border-gray-600"
                  }
                `}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
