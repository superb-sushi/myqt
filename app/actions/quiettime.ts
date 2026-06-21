"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function saveQuietTime(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const reference = formData.get("reference") as string;
  if (!reference?.trim()) throw new Error("Scripture reference is required");

  await prisma.quietTime.create({
    data: {
      userId: session.user.id,
      reference: reference.trim(),
      verse: (formData.get("verse") as string)?.trim() || null,
      details: (formData.get("details") as string)?.trim() || null,
      reflection: (formData.get("reflection") as string)?.trim() || null,
      tag: (formData.get("tag") as string)?.trim() || null,
      positionX: Math.random() * 60 + 10,
      positionY: Math.random() * 60 + 10,
      rotation: (Math.random() - 0.5) * 10,
    },
  });

  revalidatePath("/archive");
  redirect("/archive");
}

export async function updateStickerPosition(
  id: string,
  positionX: number,
  positionY: number
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.quietTime.updateMany({
    where: { id, userId: session.user.id },
    data: { positionX, positionY },
  });
}
