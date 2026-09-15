import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AugmentedSpeech from "@/components/discours/AugmentedSpeech";

export const metadata: Metadata = {
  title: "« C'est terminé » — le discours de Mark Carney, annoté",
  description:
    "66 secondes qui actent la fin de la relation économique Canada–États-Unis. Le discours du 27 mars 2025 augmenté de données, d'archives et de sous-titres bilingues.",
  openGraph: {
    title: "« C'est terminé » — le discours de Mark Carney, annoté",
    description:
      "66 secondes qui actent la fin de la relation économique Canada–États-Unis, augmentées de données et d'archives.",
    type: "article",
    locale: "fr_CA",
    images: ["/images/discours/carney-poster.jpg"],
  },
};

export default function DiscoursCarneyPage() {
  return (
    <>
      <Header />
      <main className="flex-1 w-full">
        <article className="mx-auto w-full max-w-5xl px-4 py-8">
          <header className="border-b-4 border-black pb-4 dark:border-white">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#FF0033]">
              Discours augmenté · Société
            </p>
            <h1 className="mt-2 text-3xl font-black uppercase leading-[0.95] tracking-tight sm:text-5xl">
              « C&apos;est terminé »
            </h1>
            <p className="mt-3 max-w-3xl font-serif text-lg leading-relaxed text-[var(--muted)]">
              En 66 secondes, le 27 mars 2025, Mark Carney a acté la fin de
              quatre-vingts ans de relation économique avec les États-Unis. Nous
              avons annoté le discours : les chiffres qu&apos;il ne cite pas, les
              archives qu&apos;il convoque, et la phrase québécoise sur laquelle
              il le termine.
            </p>
          </header>

          <div className="mt-8">
            <AugmentedSpeech />
          </div>

          <section className="mx-auto mt-12 max-w-2xl">
            <h2 className="border-l-4 border-l-[#FF0033] pl-3 text-xl font-black uppercase tracking-tight">
              Pourquoi ces 66 secondes comptent
            </h2>
            <div className="prose mt-4">
              <p>
                Trois fois en un peu plus de vingt secondes, Mark Carney répète
                la même formule : <em>is over</em>. D&apos;abord pour le système
                commercial mondial ancré sur les États-Unis, puis pour
                l&apos;intégration croissante entre les deux économies, enfin
                pour les quatre-vingts ans durant lesquels Washington a assumé le
                rôle de chef de file économique. La répétition n&apos;est pas un
                effet de style : c&apos;est un premier ministre qui ferme trois
                portes l&apos;une après l&apos;autre.
              </p>
              <p>
                Le discours arrive au lendemain de l&apos;annonce, par
                l&apos;administration américaine, de droits de douane de 25 % sur
                les automobiles canadiennes — entrés en vigueur le 3 avril 2025.
                Or l&apos;automobile est la deuxième exportation canadienne en
                valeur, et 92 % de ces véhicules prennent la route des
                États-Unis. Plus largement, 75,9 % de tout ce que le Canada
                exportait en 2024 partait vers son voisin du sud.
              </p>
              <p>
                Reste la dernière phrase, celle que les incrustations laissent
                volontairement en suspens jusqu&apos;au bout :{" "}
                <em>we are masters in our own home</em>. En français dans le
                texte, cela donne « nous sommes maîtres chez nous » — le slogan
                de Jean Lesage à la campagne de 1962. Un premier ministre du
                Canada qui emprunte, pour parler de souveraineté économique face
                à Washington, la formule de la Révolution tranquille : le choix
                de mots méritait qu&apos;on s&apos;y arrête.
              </p>
            </div>
          </section>
        </article>
      </main>
      <Footer />
    </>
  );
}
