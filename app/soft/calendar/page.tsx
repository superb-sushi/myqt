import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SoftMoodCalendar } from "./MoodCalendar";
import { MoodStatsDialog } from "@/app/calendar/MoodStatsDialog";

export default async function SoftCalendarPage({
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
      <header style={{
        borderBottom: "1px solid var(--s-border)",
        background: "var(--s-glass)",
        backdropFilter: "blur(12px)",
        display: "flex", alignItems: "center",
        padding: "0 1.5rem", height: "56px",
        position: "sticky", top: 0, zIndex: 40,
      }}>
        <a href="/soft" className="s-nav-link" style={{ marginRight: "0.5rem" }}>← add note</a>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <span className="serif" style={{ fontSize: "1.05rem", fontWeight: 400, color: "var(--s-text)", letterSpacing: "-0.01em" }}>calendar</span>
        </div>
        <a href="/soft/archive" className="s-nav-link hide-mobile">archive</a>
        <a href="/calendar" className="s-nav-link hide-mobile">classic ↗</a>
        <form action={async () => { "use server"; await signOut({ redirectTo: "/soft/login" }); }} style={{ display: "contents" }}>
          <button type="submit" className="s-nav-link" style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-sans)" }}>
            sign out
          </button>
        </form>
      </header>

      <main style={{ flex: 1, maxWidth: "680px", width: "100%", margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
        <div className="cal-month-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
          <a href={`/soft/calendar?year=${prevYear}&month=${prevMonth}`} className="s-btn" style={{ padding: "0.4rem 0.875rem", fontSize: "0.65rem" }}>← prev</a>
          <h2 className="serif" style={{ fontSize: "1.5rem", fontWeight: 400, margin: 0, color: "var(--s-text)" }}>{monthLabel}</h2>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <MoodStatsDialog soft year={year} month={month} />
            <a href={`/soft/calendar?year=${nextYear}&month=${nextMonth}`} className="s-btn" style={{ padding: "0.4rem 0.875rem", fontSize: "0.65rem" }}>next →</a>
          </div>
        </div>

        <SoftMoodCalendar year={year} month={month} days={days} />
      </main>
    </div>
  );
}
