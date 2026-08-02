"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type MoodStat = {
  count: number;
  totalDays: number;
  mean: number;
  median: number;
  mode: number[];
  modeCount: number;
  highest: { rating: number; date: string; note: string | null } | null;
  lowest:  { rating: number; date: string; note: string | null } | null;
  distribution: Record<number, number>; // rating → count
};

export async function getMoodStats(fromStr: string, toStr: string): Promise<MoodStat> {
  const session = await auth();
  const userId = session!.user!.id!;

  const from = new Date(fromStr + "T00:00:00.000Z");
  const to   = new Date(toStr   + "T23:59:59.999Z");

  const logs = await prisma.moodLog.findMany({
    where: { userId, date: { gte: from, lte: to } },
    orderBy: { date: "asc" },
  });

  const totalDays = Math.round((to.getTime() - from.getTime()) / 86_400_000) + 1;

  if (logs.length === 0) {
    return { count: 0, totalDays, mean: 0, median: 0, mode: [], modeCount: 0, highest: null, lowest: null, distribution: {} };
  }

  const ratings = logs.map((l) => l.rating).sort((a, b) => a - b);

  // Mean
  const mean = Math.round((ratings.reduce((s, r) => s + r, 0) / ratings.length) * 10) / 10;

  // Median
  const mid = Math.floor(ratings.length / 2);
  const median = ratings.length % 2 === 0 ? Math.round(((ratings[mid - 1] + ratings[mid]) / 2) * 10) / 10 : ratings[mid];

  // Mode
  const freq: Record<number, number> = {};
  for (const r of ratings) freq[r] = (freq[r] ?? 0) + 1;
  const modeCount = Math.max(...Object.values(freq));
  const mode = Object.entries(freq).filter(([, c]) => c === modeCount).map(([r]) => Number(r));

  // Distribution
  const distribution: Record<number, number> = {};
  for (let i = 1; i <= 10; i++) distribution[i] = freq[i] ?? 0;

  // Highest / lowest
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const highLog = logs.reduce((a, b) => b.rating > a.rating ? b : a);
  const lowLog  = logs.reduce((a, b) => b.rating < a.rating ? b : a);

  return {
    count: logs.length, totalDays, mean, median, mode, modeCount,
    highest: { rating: highLog.rating, date: fmt(highLog.date), note: highLog.note },
    lowest:  { rating: lowLog.rating,  date: fmt(lowLog.date),  note: lowLog.note  },
    distribution,
  };
}

export async function setMood(dateStr: string, rating: number | null, note?: string) {
  const session = await auth();
  const userId = session!.user!.id!;

  const date = new Date(dateStr + "T00:00:00.000Z");

  if (rating === null) {
    await prisma.moodLog.deleteMany({ where: { userId, date } });
  } else {
    const clampedRating = Math.max(1, Math.min(10, Math.round(rating)));
    const trimmedNote = note?.trim() || null;
    await prisma.moodLog.upsert({
      where: { userId_date: { userId, date } },
      create: { userId, date, rating: clampedRating, note: trimmedNote },
      update: { rating: clampedRating, note: trimmedNote },
    });
  }

  revalidatePath("/calendar");
}
