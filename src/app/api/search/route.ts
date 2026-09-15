import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json([]);
  }

  try {
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
  } catch (err) {
    // Les suggestions sont un confort : une erreur DB ne doit pas renvoyer une
    // page d'erreur HTML à un client qui attend du JSON.
    console.error("[api/search]", err);
    return NextResponse.json([], { status: 200 });
  }
}
