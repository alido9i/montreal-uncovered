import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET — Article individuel (complet)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
}

// PUT — Modifier un article
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { title, content, excerpt, categoryId, imageUrl, published } = body;

  const article = await db.article.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(content && { content }),
      excerpt: excerpt ?? undefined,
      imageUrl: imageUrl ?? undefined,
      ...(categoryId && { categoryId }),
      ...(published !== undefined && {
        published,
        publishedAt: published ? new Date() : null,
      }),
    },
  });

  return NextResponse.json(article);
}

// DELETE — Supprimer un article
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
}
