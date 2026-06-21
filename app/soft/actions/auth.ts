"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/auth";

export async function softRegister(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) redirect("/soft/register?error=missing");

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) redirect("/soft/register?error=exists");

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({ data: { email, passwordHash } });

  redirect("/soft/login?registered=1");
}

export async function softLogin(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    await signIn("credentials", { email, password, redirectTo: "/soft" });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("NEXT_REDIRECT")) throw e;
    redirect("/soft/login?error=invalid");
  }
}
