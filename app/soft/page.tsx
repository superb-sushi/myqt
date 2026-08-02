import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SoftQuietTimeForm } from "./QuietTimeForm";

export default async function SoftQTPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayEntries = await prisma.quietTime.findMany({
    where: { userId, date: { gte: today } },
    orderBy: { date: "desc" },
  });

  const dateStr = today.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header style={{
        borderBottom: "1px solid var(--s-border)",
        background: "var(--s-glass)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        padding: "0 1.5rem",
        height: "56px",
        position: "sticky",
        top: 0,
        zIndex: 40,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flex: 1 }}>
          <span className="serif" style={{ fontSize: "1.05rem", fontWeight: 400, color: "var(--s-text)", letterSpacing: "-0.01em" }}>
            myqt.
          </span>
          <span className="hide-mobile" style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--yellow)", opacity: 0.7, display: "inline-block" }} />
          <span className="hide-mobile" style={{ fontSize: "0.6rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--s-text-3)" }}>
            {dateStr}
          </span>
        </div>
        <nav style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
          <a href="/" className="s-nav-link">classic ↗</a>
          <a href="/soft/archive" className="s-nav-link">archive</a>
          <a href="/soft/calendar" className="s-nav-link">calendar</a>
          <form action={async () => { "use server"; await signOut({ redirectTo: "/soft/login" }); }} style={{ display: "contents" }}>
            <button type="submit" className="s-nav-link" style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-sans)" }}>
              sign out
            </button>
          </form>
        </nav>
      </header>

      {/* Body */}
      <main style={{ flex: 1, maxWidth: "680px", width: "100%", margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
        <SoftQuietTimeForm />

        {todayEntries.length > 0 && (
          <div style={{ marginTop: "4rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <p className="s-label" style={{ margin: 0 }}>
                from today — {todayEntries.length} {todayEntries.length === 1 ? "session" : "sessions"}
              </p>
              <a href="/soft/archive" style={{ fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", textDecoration: "none", color: "var(--s-text-3)", borderBottom: "1px solid var(--s-border-mid)", paddingBottom: "1px" }}>
                view all →
              </a>
            </div>

            <div style={{ display: "grid", gap: "0.875rem" }}>
              {todayEntries.map((entry) => (
                <div key={entry.id} style={{
                  padding: "1.1rem 1.4rem",
                  background: "var(--s-surface-card)",
                  border: "1px solid var(--s-border)",
                  borderRadius: "14px",
                  boxShadow: "var(--s-shadow-card)",
                }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: entry.verse || entry.details ? "0.75rem" : 0 }}>
                    <span className="serif" style={{ fontSize: "1.05rem", fontWeight: 400, color: "var(--s-text)" }}>
                      {entry.reference}
                    </span>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      {entry.tag && <span className="s-tag">{entry.tag}</span>}
                      <span style={{ fontSize: "0.58rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--s-text-4)" }}>
                        {new Date(entry.date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                  {entry.details && (
                    <p style={{ fontSize: "0.8rem", lineHeight: 1.65, color: "var(--s-text-2)", fontStyle: "italic", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", margin: 0 }}>
                      {entry.details}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
