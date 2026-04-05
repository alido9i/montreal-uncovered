import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import ProfileForm from "./ProfileForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mon profil",
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login?callbackUrl=/profil");
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          comments: true,
          likes: true,
          savedArticles: true,
        },
      },
    },
  });

  if (!user) redirect("/login");

  return (
    <>
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-10 w-full">
        <h1 className="text-3xl md:text-4xl font-black mb-2">Mon profil</h1>
        <p className="text-sm text-gray-500 mb-10">
          Membre depuis{" "}
          {new Date(user.createdAt).toLocaleDateString("fr-CA", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
          {user.role === "ADMIN" && (
            <span className="ml-2 inline-block px-2 py-0.5 bg-[#FF0033] text-white text-xs font-black uppercase tracking-widest">
              Admin
            </span>
          )}
        </p>

        {/* Statistiques */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <StatCard label="Commentaires" value={user._count.comments} />
          <StatCard label="J'aime" value={user._count.likes} />
          <StatCard label="Favoris" value={user._count.savedArticles} />
        </div>

        <ProfileForm
          initialName={user.name ?? ""}
          email={user.email}
        />
      </main>
      <Footer />
    </>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-gray-200 dark:border-gray-800 p-4 text-center">
      <div className="text-2xl font-black">{value}</div>
      <div className="text-xs uppercase tracking-widest text-gray-500 mt-1">
        {label}
      </div>
    </div>
  );
}
