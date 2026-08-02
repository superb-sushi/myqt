import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { QuietTimeForm } from "./QuietTimeForm";

export default async function QTPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayEntries = await prisma.quietTime.findMany({
    where: { userId, date: { gte: today } },
    orderBy: { date: "desc" },
  });

  const dateStr = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* ── Header ── */}
      <header
        style={{
          borderBottom: "2.5px solid var(--black)",
          background: "var(--black)",
          display: "flex",
          alignItems: "stretch",
        }}
      >
        <div
          style={{
            background: "var(--yellow)",
            padding: "0.875rem 1.5rem",
            borderRight: "2.5px solid var(--black)",
            display: "flex",
            alignItems: "center",
          }}
        >
          <span
            className="serif"
            style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--black)", whiteSpace: "nowrap" }}
          >
            myqt.
          </span>
        </div>
        <div className="hide-mobile" style={{ flex: 1, minWidth: 0, padding: "0.875rem 1.5rem", display: "flex", alignItems: "center", overflow: "hidden" }}>
          <span style={{ fontSize: "0.65rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#aaa" }}>
            {dateStr}
          </span>
        </div>
        <div className="brutal-nav" style={{ display: "flex", alignItems: "stretch", borderLeft: "2.5px solid #333", flexShrink: 0 }}>
          <a
            href="/soft"
            style={{
              padding: "0 1.25rem",
              display: "flex",
              alignItems: "center",
              fontSize: "0.65rem",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#bbb",
              textDecoration: "none",
              borderRight: "1px solid #333",
            }}
            className="hide-mobile hover:bg-[#1a1a1a] transition-colors"
          >
            soft ↗
          </a>
          <a
            href="/calendar"
            style={{ padding: "0 1.25rem", display: "flex", alignItems: "center", fontSize: "0.65rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#bbb", textDecoration: "none", borderRight: "1px solid #333" }}
            className="hover:bg-[#1a1a1a] transition-colors"
          >
            calendar
          </a>
          <a
            href="/archive"
            style={{
              padding: "0 1.25rem",
              display: "flex",
              alignItems: "center",
              fontSize: "0.65rem",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#bbb",
              textDecoration: "none",
              borderRight: "1px solid #333",
            }}
            className="hide-mobile hover:bg-[#1a1a1a] transition-colors"
          >
            archive
          </a>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
            style={{ display: "flex" }}
          >
            <button
              type="submit"
              style={{
                padding: "0 1.25rem",
                fontSize: "0.65rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#bbb",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
              }}
              className="hover:bg-[#1a1a1a] transition-colors"
            >
              sign out
            </button>
          </form>
        </div>
      </header>

      {/* ── Body ── */}
      <main
        style={{ flex: 1, maxWidth: "720px", width: "100%", margin: "0 auto", padding: "3rem 1.5rem 5rem" }}
      >
        <QuietTimeForm />

        {/* Today's earlier entries */}
        {todayEntries.length > 0 && (
          <div style={{ marginTop: "4rem" }}>
            <div
              style={{
                borderTop: "2.5px solid var(--black)",
                paddingTop: "1.5rem",
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <p className="b-label" style={{ marginBottom: 0 }}>
                from today — {todayEntries.length} {todayEntries.length === 1 ? "session" : "sessions"}
              </p>
              <a
                href="/archive"
                style={{
                  fontSize: "0.65rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  color: "var(--black)",
                  borderBottom: "1.5px solid var(--black)",
                }}
              >
                view all →
              </a>
            </div>

            <div style={{ display: "grid", gap: "1rem" }}>
              {todayEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="b-box"
                  style={{ padding: "1rem 1.25rem", background: "var(--bg)" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      justifyContent: "space-between",
                      marginBottom: entry.verse || entry.details || entry.reflection ? "0.75rem" : 0,
                    }}
                  >
                    <span
                      className="serif"
                      style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--black)" }}
                    >
                      {entry.reference}
                    </span>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      {entry.tag && <span className="b-tag">{entry.tag}</span>}
                      <span
                        style={{
                          fontSize: "0.6rem",
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          color: "#888",
                        }}
                      >
                        {new Date(entry.date).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                  {entry.details && (
                    <p
                      style={{
                        fontSize: "0.8rem",
                        lineHeight: 1.6,
                        color: "#4a3f33",
                        fontStyle: "italic",
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
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
