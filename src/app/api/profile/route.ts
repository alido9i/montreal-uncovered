import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const profileSchema = z
  .object({
    name: z
      .string()
      .trim()
      .max(100, "Le nom ne peut pas dépasser 100 caractères.")
      .optional(),
    currentPassword: z.string().optional(),
    newPassword: z
      .string()
      .min(8, "Le nouveau mot de passe doit contenir au moins 8 caractères.")
      .max(100)
      .optional(),
  })
  .refine(
    (data) => {
      // Si on fournit un newPassword, on doit fournir currentPassword
      if (data.newPassword && !data.currentPassword) return false;
      return true;
    },
    { message: "Le mot de passe actuel est requis.", path: ["currentPassword"] }
  );

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = profileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Données invalides.",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, currentPassword, newPassword } = parsed.data;

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, password: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    // Si changement de mot de passe → vérifier l'actuel
    const dataToUpdate: { name?: string; password?: string } = {};

    if (name !== undefined) {
      dataToUpdate.name = name || null as unknown as string;
    }

    if (newPassword) {
      if (!user.password) {
        return NextResponse.json(
          { error: "Ce compte ne permet pas le changement de mot de passe." },
          { status: 400 }
        );
      }

      const valid = await bcrypt.compare(currentPassword ?? "", user.password);
      if (!valid) {
        return NextResponse.json(
          { error: "Mot de passe actuel incorrect." },
          { status: 400 }
        );
      }

      dataToUpdate.password = await bcrypt.hash(newPassword, 12);
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json({ success: true });
    }

    await db.user.update({
      where: { id: user.id },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PROFILE_PATCH]", error);
    return NextResponse.json(
      { error: "Une erreur est survenue." },
      { status: 500 }
    );
  }
}
