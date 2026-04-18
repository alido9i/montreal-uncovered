import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json([]);
  }

  const articles = await db.article.findMany({
    where: {
      published: true,
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { excerpt: { contains: q, mode: "insensitive" } },
      ],
    },
    orderBy: { views: "desc" },
    take: 5,
    select: {
      title: true,
      slug: true,
      excerpt: true,
      imageUrl: true,
      category: { select: { name: true } },
    },
  });

  return NextResponse.json(articles);
}
