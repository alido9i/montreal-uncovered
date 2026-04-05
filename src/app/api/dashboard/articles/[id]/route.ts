import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const updateArticleSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Le titre doit contenir au moins 3 caractères.")
    .max(200, "Le titre ne peut pas dépasser 200 caractères.")
    .optional(),
  content: z
    .string()
    .trim()
    .min(10, "Le contenu doit contenir au moins 10 caractères.")
    .optional(),
  excerpt: z
    .string()
    .trim()
    .max(300, "L'extrait ne peut pas dépasser 300 caractères.")
    .optional()
    .nullable(),
  categoryId: z.string().min(1).optional(),
  imageUrl: z
    .string()
    .url("L'URL de l'image est invalide.")
    .optional()
    .nullable()
    .or(z.literal("")),
  imageCredit: z
    .string()
    .trim()
    .max(500, "Le crédit photo ne peut pas dépasser 500 caractères.")
    .optional()
    .nullable(),
  published: z.boolean().optional(),
});

// GET — Article individuel (complet)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    const article = await db.article.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        excerpt: true,
        imageUrl: true,
        imageCredit: true,
        published: true,
        publishedAt: true,
        views: true,
        createdAt: true,
        categoryId: true,
        category: { select: { name: true } },
        author: { select: { name: true } },
      },
    });

    if (!article) {
      return NextResponse.json({ error: "Article introuvable" }, { status: 404 });
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error("[ARTICLE_GET]", error);
    return NextResponse.json(
      { error: "Impossible de récupérer l'article." },
      { status: 500 }
    );
  }
}

// PUT — Modifier un article
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = updateArticleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Données invalides.",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { title, content, excerpt, categoryId, imageUrl, imageCredit, published } =
      parsed.data;

    // Si la catégorie change, vérifier qu'elle existe
    if (categoryId) {
      const category = await db.category.findUnique({ where: { id: categoryId } });
      if (!category) {
        return NextResponse.json(
          { error: "La catégorie spécifiée n'existe pas." },
          { status: 400 }
        );
      }
    }

    const article = await db.article.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        excerpt: excerpt ?? undefined,
        imageUrl: imageUrl ?? undefined,
        imageCredit: imageCredit ?? undefined,
        ...(categoryId && { categoryId }),
        ...(published !== undefined && {
          published,
          publishedAt: published ? new Date() : null,
        }),
      },
    });

    return NextResponse.json(article);
  } catch (error) {
    console.error("[ARTICLE_PUT]", error);
    return NextResponse.json(
      { error: "Impossible de mettre à jour l'article." },
      { status: 500 }
    );
  }
}

// DELETE — Supprimer un article
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    await db.comment.deleteMany({ where: { articleId: id } });
    await db.like.deleteMany({ where: { articleId: id } });
    await db.savedArticle.deleteMany({ where: { articleId: id } });
    await db.article.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ARTICLE_DELETE]", error);
    return NextResponse.json(
      { error: "Impossible de supprimer l'article." },
      { status: 500 }
    );
  }
}
