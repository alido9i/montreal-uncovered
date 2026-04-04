import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// PUT — Modifier le rôle d'un utilisateur
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
  const { role, name } = body;

  // Empêcher de se retirer soi-même le rôle admin
  if (id === session.user.id && role !== "ADMIN") {
    return NextResponse.json(
      { error: "Vous ne pouvez pas retirer votre propre rôle admin." },
      { status: 400 }
    );
  }

  const user = await db.user.update({
    where: { id },
    data: {
      ...(role && { role }),
      ...(name !== undefined && { name }),
    },
    select: { id: true, name: true, email: true, role: true },
  });

  return NextResponse.json(user);
}

// DELETE — Supprimer un utilisateur
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;

  if (id === session.user.id) {
    return NextResponse.json(
      { error: "Vous ne pouvez pas supprimer votre propre compte." },
      { status: 400 }
    );
  }

  await db.comment.deleteMany({ where: { userId: id } });
  await db.like.deleteMany({ where: { userId: id } });
  await db.savedArticle.deleteMany({ where: { userId: id } });
  await db.session.deleteMany({ where: { userId: id } });
  await db.account.deleteMany({ where: { userId: id } });
  await db.user.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
