import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function SessionPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  const session = await auth();

  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) notFound();

  const start = new Date(parsed);
  start.setHours(0, 0, 0, 0);
  const end = new Date(parsed);
  end.setHours(23, 59, 59, 999);

  const entry = await prisma.quietTime.findFirst({
    where: {
      userId: session!.user!.id!,
      date: { gte: start, lte: end },
    },
  });

  if (!entry) notFound();

  const displayDate = parsed.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="min-h-screen px-4 py-10 max-w-2xl mx-auto">
      <a href="/archive" className="text-xs uppercase tracking-widest hover:opacity-70 transition-opacity block mb-8" style={{ color: "var(--ink-light)" }}>
        ← archive
      </a>

      <p className="text-xs mb-2" style={{ color: "var(--ink-light)" }}>{displayDate}</p>

      <div className="space-y-6">
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}>{entry.reference}</h1>
        {entry.tag && (
          <span className="text-xs px-2 py-0.5 inline-block" style={{ color: "var(--cobalt)", border: "1px solid var(--cobalt)" }}>{entry.tag}</span>
        )}

        <svg viewBox="0 0 400 10" className="w-full opacity-20">
          <path d="M0,5 Q100,1 200,5 Q300,9 400,5" stroke="var(--ink)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        </svg>

        {entry.verse && (
          <section>
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--ink-light)" }}>the verse</p>
            <p className="leading-relaxed italic text-lg" style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}>{entry.verse}</p>
          </section>
        )}
        {entry.details && (
          <section>
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--ink-light)" }}>details</p>
            <p className="leading-relaxed" style={{ color: "var(--ink)" }}>{entry.details}</p>
          </section>
        )}
        {entry.reflection && (
          <section>
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--ink-light)" }}>reflection</p>
            <p className="leading-relaxed" style={{ color: "var(--ink)" }}>{entry.reflection}</p>
          </section>
        )}
      </div>
    </div>
  );
}
