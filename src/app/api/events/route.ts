import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Trouver le lundi de la semaine courante
    const now = new Date();
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
    monday.setHours(0, 0, 0, 0);

    // Chercher les événements de cette semaine (lundi à dimanche)
    let events = await db.weekendEvent.findMany({
      where: { weekOf: monday },
      orderBy: { createdAt: "asc" },
      take: 7,
    });

    // Si rien pour cette semaine, chercher la semaine la plus récente
    if (events.length === 0) {
      events = await db.weekendEvent.findMany({
        orderBy: { weekOf: "desc" },
        take: 7,
      });
    }

    return NextResponse.json(events);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
