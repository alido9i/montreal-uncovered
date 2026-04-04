import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const [
    totalArticles,
    publishedArticles,
    draftArticles,
    totalUsers,
    totalComments,
    totalViews,
    totalLikes,
    recentArticles,
    topArticles,
    recentComments,
    articlesByCategory,
    recentUsers,
  ] = await Promise.all([
    db.article.count(),
    db.article.count({ where: { published: true } }),
    db.article.count({ where: { published: false } }),
    db.user.count(),
    db.comment.count(),
    db.article.aggregate({ _sum: { views: true } }),
    db.like.count(),
    db.article.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        published: true,
        publishedAt: true,
        createdAt: true,
        views: true,
        category: { select: { name: true } },
        author: { select: { name: true } },
        _count: { select: { comments: true, likes: true } },
      },
    }),
    db.article.findMany({
      where: { published: true },
      orderBy: { views: "desc" },
      take: 10,
      select: {
        id: true,
        title: true,
        slug: true,
        views: true,
        publishedAt: true,
        category: { select: { name: true } },
        _count: { select: { comments: true, likes: true } },
      },
    }),
    db.comment.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        content: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
        article: { select: { title: true, slug: true } },
      },
    }),
    db.category.findMany({
      select: {
        name: true,
        slug: true,
        _count: { select: { articles: true } },
      },
    }),
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
  ]);

  return NextResponse.json({
    counts: {
      articles: totalArticles,
      published: publishedArticles,
      drafts: draftArticles,
      users: totalUsers,
      comments: totalComments,
      views: totalViews._sum.views ?? 0,
      likes: totalLikes,
    },
    recentArticles,
    topArticles,
    recentComments,
    articlesByCategory,
    recentUsers,
  });
}
