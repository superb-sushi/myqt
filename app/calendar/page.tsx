import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { MoodCalendar } from "./MoodCalendar";
import { MoodStatsDialog } from "./MoodStatsDialog";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const session = await auth();
  const userId = session!.user!.id!;

  const params = await searchParams;
  const now = new Date();
  const year = parseInt(params.year ?? String(now.getFullYear()), 10);
  const month = parseInt(params.month ?? String(now.getMonth()), 10);

  const monthStart = new Date(Date.UTC(year, month, 1));
  const monthEnd = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

  const [moodLogs, entries] = await Promise.all([
    prisma.moodLog.findMany({ where: { userId, date: { gte: monthStart, lte: monthEnd } } }),
    prisma.quietTime.findMany({
      where: { userId, date: { gte: monthStart, lte: monthEnd } },
      select: { date: true },
    }),
  ]);

  const ratingByDate = Object.fromEntries(
    moodLogs.map((m) => {
      const d = m.date;
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
      return [key, { rating: m.rating, note: m.note ?? null }];
    })
  );

  const entryDates = new Set(
    entries.map((e) => {
      const d = e.date;
      return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
    })
  );

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`;
    return {
      dateStr,
      rating: ratingByDate[dateStr]?.rating ?? null,
      note: ratingByDate[dateStr]?.note ?? null,
      hasEntry: entryDates.has(dateStr),
    };
  });

  const monthLabel = new Date(year, month, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{ borderBottom: "2.5px solid var(--black)", background: "var(--black)", display: "flex", alignItems: "stretch" }}>
        <a href="/" style={{ padding: "0.875rem 1.5rem", display: "flex", alignItems: "center", fontSize: "0.65rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#bbb", textDecoration: "none", borderRight: "1px solid #333" }} className="hover:bg-[#1a1a1a] transition-colors">
          ← add note
        </a>
        <div style={{ background: "var(--yellow)", padding: "0.875rem 1.5rem", borderRight: "2.5px solid var(--black)", display: "flex", alignItems: "center" }}>
          <span className="serif" style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--black)" }}>calendar</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }} />
        <a href="/archive" style={{ padding: "0.875rem 1.5rem", display: "flex", alignItems: "center", fontSize: "0.65rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#bbb", textDecoration: "none", borderLeft: "1px solid #333" }} className="hover:bg-[#1a1a1a] transition-colors">
          archive
        </a>
        <a href="/soft/calendar" style={{ padding: "0.875rem 1.5rem", display: "flex", alignItems: "center", fontSize: "0.65rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#bbb", textDecoration: "none", borderLeft: "1px solid #333" }} className="hover:bg-[#1a1a1a] transition-colors">
          soft ↗
        </a>
        <form action={async () => { "use server"; await signOut({ redirectTo: "/login" }); }} style={{ display: "flex" }}>
          <button type="submit" style={{ padding: "0 1.25rem", fontSize: "0.65rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#bbb", background: "none", border: "none", borderLeft: "1px solid #333", cursor: "pointer", fontFamily: "var(--font-sans)" }} className="hover:bg-[#1a1a1a] transition-colors">
            sign out
          </button>
        </form>
      </header>

      <main style={{ flex: 1, maxWidth: "680px", width: "100%", margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
          <a href={`/calendar?year=${prevYear}&month=${prevMonth}`} className="b-btn" style={{ padding: "0.4rem 0.875rem", fontSize: "0.65rem" }}>← prev</a>
          <h2 className="serif" style={{ fontSize: "1.5rem", fontWeight: 600, margin: 0 }}>{monthLabel}</h2>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <MoodStatsDialog year={year} month={month} />
            <a href={`/calendar?year=${nextYear}&month=${nextMonth}`} className="b-btn" style={{ padding: "0.4rem 0.875rem", fontSize: "0.65rem" }}>next →</a>
          </div>
        </div>

        <MoodCalendar year={year} month={month} days={days} />
      </main>
    </div>
  );
}
