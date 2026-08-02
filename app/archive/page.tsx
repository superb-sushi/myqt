import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { StickerBoard } from "./StickerBoard";

export default async function ArchivePage() {
  const session = await auth();
  const entries = await prisma.quietTime.findMany({
    where: { userId: session!.user!.id! },
    orderBy: { date: "desc" },
  });

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{ borderBottom: "2.5px solid var(--black)", background: "var(--black)", display: "flex", alignItems: "stretch" }}>
        <a
          href="/"
          style={{ padding: "0.875rem 1.5rem", display: "flex", alignItems: "center", fontSize: "0.65rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#bbb", textDecoration: "none", borderRight: "1px solid #333" }}
          className="hover:bg-[#1a1a1a] transition-colors"
        >
          ← add note
        </a>
        <div style={{ background: "var(--yellow)", padding: "0.875rem 1.5rem", borderRight: "2.5px solid var(--black)", display: "flex", alignItems: "center" }}>
          <span className="serif" style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--black)" }}>
            archive
          </span>
        </div>
        <div className="hide-mobile" style={{ padding: "0.875rem 1.5rem", display: "flex", alignItems: "center", flex: 1 }}>
          <span style={{ fontSize: "0.65rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#777" }}>
            {entries.length} {entries.length === 1 ? "session" : "sessions"}
          </span>
        </div>
        <a
          href="/calendar"
          style={{ padding: "0.875rem 1.5rem", display: "flex", alignItems: "center", fontSize: "0.65rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#bbb", textDecoration: "none", borderLeft: "1px solid #333" }}
          className="hover:bg-[#1a1a1a] transition-colors"
        >
          calendar
        </a>
        <a
          href="/soft/archive"
          style={{ padding: "0.875rem 1.5rem", display: "flex", alignItems: "center", fontSize: "0.65rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#bbb", textDecoration: "none", borderLeft: "1px solid #333" }}
          className="hover:bg-[#1a1a1a] transition-colors"
        >
          soft ↗
        </a>
        <form action={async () => { "use server"; await signOut({ redirectTo: "/login" }); }} style={{ display: "flex" }}>
          <button
            type="submit"
            style={{ padding: "0 1.25rem", fontSize: "0.65rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#bbb", background: "none", border: "none", borderLeft: "1px solid #333", cursor: "pointer", fontFamily: "var(--font-sans)" }}
            className="hover:bg-[#1a1a1a] transition-colors"
          >
            sign out
          </button>
        </form>
      </header>

      {entries.length === 0 ? (
        <div className="flex-1 flex items-center justify-center board">
          <div className="b-box" style={{ background: "var(--bg)", padding: "1.5rem 2rem", textAlign: "center" }}>
            <p style={{ fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              no sessions yet
            </p>
            <a href="/" className="b-btn b-btn-dark" style={{ display: "inline-block", marginTop: "1rem", fontSize: "0.7rem" }}>
              add a session →
            </a>
          </div>
        </div>
      ) : (
        <div className="flex-1 board">
          <StickerBoard
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
