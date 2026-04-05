import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const createArticleSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Le titre doit contenir au moins 3 caractères.")
    .max(200, "Le titre ne peut pas dépasser 200 caractères."),
  content: z
    .string()
    .trim()
    .min(10, "Le contenu doit contenir au moins 10 caractères."),
  excerpt: z
    .string()
    .trim()
    .max(300, "L'extrait ne peut pas dépasser 300 caractères.")
    .optional()
    .nullable(),
  categoryId: z.string().min(1, "La catégorie est requise."),
  imageUrl: z
    .string()
    .url("L'URL de l'image est invalide.")
    .optional()
    .nullable()
    .or(z.literal("")),
  published: z.boolean().optional(),
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Génère un slug unique en ajoutant un compteur incrémental (mon-article-2)
async function generateUniqueSlug(title: string): Promise<string> {
  const baseSlug = slugify(title);
  if (!baseSlug) {
    throw new Error("Le titre ne permet pas de générer un slug valide.");
  }

  // Récupère tous les slugs existants qui commencent par le baseSlug
  const existingSlugs = await db.article.findMany({
    where: { slug: { startsWith: baseSlug } },
    select: { slug: true },
  });

  if (existingSlugs.length === 0) return baseSlug;

  const slugSet = new Set(existingSlugs.map((a) => a.slug));
  if (!slugSet.has(baseSlug)) return baseSlug;

  let counter = 2;
  while (slugSet.has(`${baseSlug}-${counter}`)) {
    counter++;
  }
  return `${baseSlug}-${counter}`;
}

// GET — Liste des articles (admin)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const articles = await db.article.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        published: true,
        publishedAt: true,
        views: true,
        category: { select: { name: true } },
      },
    });

    return NextResponse.json(articles);
  } catch (error) {
    console.error("[ARTICLES_GET]", error);
    return NextResponse.json(
      { error: "Impossible de récupérer les articles." },
      { status: 500 }
    );
  }
}

// POST — Créer un article
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createArticleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Données invalides.",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { title, content, excerpt, categoryId, imageUrl, published } =
      parsed.data;

    // Vérifier que la catégorie existe (évite une erreur 500 sur clé étrangère)
    const category = await db.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return NextResponse.json(
        { error: "La catégorie spécifiée n'existe pas." },
        { status: 400 }
      );
    }

    const slug = await generateUniqueSlug(title);

    const article = await db.article.create({
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || null,
        imageUrl: imageUrl || null,
        categoryId,
        authorId: session.user.id,
        published: published ?? false,
        publishedAt: published ? new Date() : null,
      },
    });

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error("[ARTICLES_POST]", error);
    return NextResponse.json(
      { error: "Impossible de créer l'article." },
      { status: 500 }
    );
  }
}
