import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SoftStickerBoard } from "./StickerBoard";

export default async function SoftArchivePage() {
  const session = await auth();
  const entries = await prisma.quietTime.findMany({
    where: { userId: session!.user!.id! },
    orderBy: { date: "desc" },
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
        <a href="/soft" className="s-nav-link" style={{ marginRight: "0.5rem" }}>← add note</a>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flex: 1 }}>
          <span className="serif" style={{ fontSize: "1.05rem", fontWeight: 400, color: "var(--s-text)", letterSpacing: "-0.01em" }}>archive</span>
          <span className="hide-mobile" style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--yellow)", opacity: 0.7, display: "inline-block" }} />
          <span className="hide-mobile" style={{ fontSize: "0.6rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--s-text-3)" }}>
            {entries.length} {entries.length === 1 ? "session" : "sessions"}
          </span>
        </div>
        <a href="/soft/calendar" className="s-nav-link hide-mobile">calendar</a>
        <a href="/archive" className="s-nav-link hide-mobile">classic ↗</a>
        <form action={async () => { "use server"; await signOut({ redirectTo: "/soft/login" }); }} style={{ display: "contents" }}>
          <button type="submit" className="s-nav-link" style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-sans)" }}>
            sign out
          </button>
        </form>
      </header>

      {entries.length === 0 ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }} className="s-board">
          <div style={{ textAlign: "center", background: "var(--s-surface-card)", border: "1px solid var(--s-border)", borderRadius: "16px", padding: "2rem 2.5rem", boxShadow: "var(--s-shadow)" }}>
            <p className="s-label" style={{ marginBottom: "1rem" }}>no sessions yet</p>
            <a href="/soft" className="s-btn s-btn-dark" style={{ fontSize: "0.7rem" }}>add a session →</a>
          </div>
        </div>
      ) : (
        <div className="flex-1 s-board">
          <SoftStickerBoard
            entries={entries.map((e) => ({
              id: e.id,
              reference: e.reference,
              date: e.date.toISOString(),
              tag: e.tag,
              verse: e.verse,
              details: e.details,
              reflection: e.reflection,
              positionX: e.positionX,
              positionY: e.positionY,
              rotation: e.rotation,
            }))}
          />
        </div>
      )}
    </div>
  );
}
