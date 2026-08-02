"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { getMoodStats, type MoodStat } from "@/app/actions/mood";
import { ratingToColor } from "@/lib/moods";


function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function meanLabel(mean: number): string {
  if (mean >= 9)   return "You were absolutely glowing.";
  if (mean >= 8)   return "Your energy? Mostly golden.";
  if (mean >= 7)   return "More good days than not. That counts.";
  if (mean >= 6)   return "Solid. Not perfect, but solid.";
  if (mean >= 5)   return "Right in the middle. You held on.";
  if (mean >= 4)   return "A tough stretch. You still showed up.";
  return "This one was heavy. But you made it through.";
}

function medianLabel(median: number): string {
  if (median >= 8) return "More than half your days were genuinely great.";
  if (median >= 6) return "Most days landed on the brighter side.";
  if (median >= 5) return "It was a coin flip kind of month.";
  return "The harder days outnumbered the easier ones — but you're still here.";
}

function coverageLabel(count: number, total: number): string {
  const pct = count / total;
  if (pct >= 0.9) return "You showed up almost every single day.";
  if (pct >= 0.7) return "You were pretty consistent with this.";
  if (pct >= 0.5) return "More than half the days, you checked in.";
  return "You logged when it mattered. That's enough.";
}

export function MoodStatsDialog({ soft, year, month }: { soft?: boolean; year: number; month: number }) {
  const [open, setOpen] = useState(false);
  const today = new Date();
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);
  const [from, setFrom] = useState(toDateStr(monthStart));
  const [to, setTo]     = useState(toDateStr(monthEnd > today ? today : monthEnd));
  const [stats, setStats] = useState<MoodStat | null>(null);
  const [isPending, startTransition] = useTransition();
  const overlayRef = useRef<HTMLDivElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);

  function fetchStats() {
    startTransition(async () => {
      const result = await getMoodStats(from, to);
      setStats(result);
    });
  }

  useEffect(() => { if (open) fetchStats(); }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Animated blob canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !open || !stats || stats.count === 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width  = canvas.offsetWidth  * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;

    // Seeded RNG for stable initial positions
    let s = 0xdeadbeef;
    const rng = () => { s = Math.imul(s ^ (s >>> 16), 0x45d9f3b); s = Math.imul(s ^ (s >>> 16), 0x45d9f3b); s ^= s >>> 16; return (s >>> 0) / 0xffffffff; };

    type Blob = { x: number; y: number; vx: number; vy: number; color: string; r: number };
    const blobs: Blob[] = [];
    for (let n = 1; n <= 10; n++) {
      const count = stats.distribution[n] ?? 0;
      if (!count) continue;
      const color = ratingToColor(n);
      for (let i = 0; i < count; i++) {
        const angle = rng() * Math.PI * 2;
        const spd   = 0.15 + rng() * 0.25;
        blobs.push({ x: rng() * W, y: rng() * H, vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd, color, r: 70 + rng() * 40 });
      }
    }

    const ctx = canvas.getContext("2d")!;
    let raf: number;

    function frame() {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      for (const b of blobs) {
        b.x += b.vx; b.y += b.vy;
        if (b.x < 0) { b.x = 0; b.vx =  Math.abs(b.vx); }
        if (b.x > W) { b.x = W; b.vx = -Math.abs(b.vx); }
        if (b.y < 0) { b.y = 0; b.vy =  Math.abs(b.vy); }
        if (b.y > H) { b.y = H; b.vy = -Math.abs(b.vy); }
        b.vx += (Math.random() - 0.5) * 0.04;
        b.vy += (Math.random() - 0.5) * 0.04;
        const speed = Math.hypot(b.vx, b.vy);
        if (speed > 0.4) { b.vx *= 0.4 / speed; b.vy *= 0.4 / speed; }

        const rgba0 = b.color.replace("rgb(", "rgba(").replace(")", ", 0.9)");
        const rgba1 = b.color.replace("rgb(", "rgba(").replace(")", ", 0)");
        const grad  = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        grad.addColorStop(0, rgba0);
        grad.addColorStop(1, rgba1);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [open, stats]);

  const maxDist = stats ? Math.max(...Object.values(stats.distribution), 1) : 1;

  // Shared input style
  const inputStyle: React.CSSProperties = soft ? {
    border: "1px solid var(--s-border-mid)", borderRadius: "8px",
    background: "var(--s-surface)", color: "var(--s-text)",
    padding: "0.4rem 0.7rem", fontSize: "0.72rem", fontFamily: "var(--font-sans)", outline: "none",
  } : {
    border: "2px solid var(--black)", background: "var(--bg)", color: "var(--black)",
    padding: "0.4rem 0.7rem", fontSize: "0.72rem", fontFamily: "var(--font-sans)", outline: "none",
  };

  const labelStyle: React.CSSProperties = soft ? {
    fontSize: "0.55rem", fontWeight: 500, letterSpacing: "0.16em",
    textTransform: "uppercase" as const, color: "var(--s-text-3)", display: "block", marginBottom: "4px",
  } : {
    fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.2em",
    textTransform: "uppercase" as const, color: "#888", display: "block", marginBottom: "4px",
  };

  const statCard = (content: React.ReactNode) => (
    <div style={soft ? {
      background: "var(--s-surface)", border: "1px solid var(--s-border-mid)",
      borderRadius: "12px", padding: "1rem 1.1rem",
    } : {
      border: "2px solid var(--black)", padding: "0.875rem 1rem", background: "var(--bg)",
    }}>
      {content}
    </div>
  );

  const bigNum = (n: number | string) => (
    <span style={{ fontSize: "2rem", fontWeight: 700, fontFamily: soft ? "var(--font-serif)" : undefined, lineHeight: 1, color: soft ? "var(--s-text)" : "var(--black)" }}>
      {n}
    </span>
  );

  const label = (txt: string) => (
    <span style={{ fontSize: "0.55rem", fontWeight: soft ? 500 : 700, letterSpacing: "0.16em", textTransform: "uppercase" as const, color: soft ? "var(--s-text-3)" : "#888" }}>
      {txt}
    </span>
  );

  const body = (txt: string) => (
    <p style={{ fontSize: "0.72rem", lineHeight: 1.6, color: soft ? "var(--s-text-2)" : "#555", margin: "0.3rem 0 0" }}>
      {txt}
    </p>
  );

  return (
    <>
      {/* Trigger button */}
      {soft ? (
        <button
          onClick={() => setOpen(true)}
          className="s-btn"
          style={{ padding: "0.4rem 0.875rem", fontSize: "0.65rem" }}
        >
          stats ↗
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="b-btn"
          style={{ padding: "0.4rem 0.875rem", fontSize: "0.65rem" }}
        >
          stats ↗
        </button>
      )}

      {/* Overlay */}
      {open && (
        <div
          ref={overlayRef}
          onClick={(e) => e.target === overlayRef.current && setOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(10,8,6,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "1.5rem",
            backdropFilter: soft ? "blur(4px)" : undefined,
          }}
        >
          <div className="stats-dialog-inner" style={soft ? {
            background: "var(--s-surface-card)", border: "1px solid var(--s-border-mid)",
            borderRadius: "20px", boxShadow: "var(--s-shadow-raised)",
            width: "100%", maxWidth: "480px", maxHeight: "85vh", overflowY: "auto",
            padding: "1.75rem",
          } : {
            background: "var(--bg)", border: "2.5px solid var(--black)",
            boxShadow: "6px 6px 0 var(--black)",
            width: "100%", maxWidth: "480px", maxHeight: "85vh", overflowY: "auto",
            padding: "1.75rem",
          }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
              <h2 style={{ margin: 0, fontSize: "1.15rem", fontFamily: soft ? "var(--font-serif)" : undefined, fontWeight: soft ? 400 : 700, color: soft ? "var(--s-text)" : "var(--black)" }}>
                your month in moods
              </h2>
              <button
                onClick={() => setOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1rem", color: soft ? "var(--s-text-3)" : "#888", lineHeight: 1, padding: "0 0 0 1rem" }}
              >
                ✕
              </button>
            </div>

            {/* Date range */}
            <div className="stats-date-row" style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end", marginBottom: "1.25rem" }}>
              <div style={{ flex: 1 }}>
                <span style={labelStyle}>from</span>
                <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} style={{ ...inputStyle, width: "100%" }} />
              </div>
              <div style={{ flex: 1 }}>
                <span style={labelStyle}>to</span>
                <input type="date" value={to} onChange={(e) => setTo(e.target.value)} style={{ ...inputStyle, width: "100%" }} />
              </div>
              <button
                onClick={fetchStats}
                style={soft ? {
                  background: "var(--s-text)", color: "var(--s-bg)", border: "none",
                  borderRadius: "8px", padding: "0.45rem 0.875rem", fontSize: "0.62rem",
                  fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase",
                  fontFamily: "var(--font-sans)", cursor: "pointer", whiteSpace: "nowrap",
                } : {
                  background: "var(--black)", color: "var(--bg)", border: "2px solid var(--black)",
                  padding: "0.45rem 0.875rem", fontSize: "0.62rem",
                  fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
                  fontFamily: "var(--font-sans)", cursor: "pointer", whiteSpace: "nowrap",
                }}
              >
                {isPending ? "…" : "go"}
              </button>
            </div>

            {/* Results */}
            {stats && (
              stats.count === 0 ? (
                <p style={{ fontSize: "0.78rem", color: soft ? "var(--s-text-3)" : "#888", textAlign: "center", padding: "2rem 0" }}>
                  No mood logs in this range.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {/* Coverage */}
                  <div style={{ borderLeft: `3px solid ${soft ? "var(--s-border-mid)" : "var(--black)"}`, paddingLeft: "0.875rem", marginBottom: "0.25rem" }}>
                    <p style={{ fontSize: "0.88rem", fontWeight: 700, color: soft ? "var(--s-text)" : "var(--black)", margin: "0 0 0.2rem" }}>
                      {stats.count} out of {stats.totalDays} days logged.
                    </p>
                    <p style={{ fontSize: "0.72rem", color: soft ? "var(--s-text-2)" : "#666", margin: 0 }}>
                      {coverageLabel(stats.count, stats.totalDays)}
                    </p>
                  </div>

                  {/* Mean + Median row */}
                  <div className="stats-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    {statCard(<>
                      {label("your average")}
                      <div style={{ marginTop: "0.4rem", display: "flex", alignItems: "baseline", gap: "4px" }}>
                        {bigNum(stats.mean)}
                        <span style={{ fontSize: "0.75rem", color: soft ? "var(--s-text-3)" : "#888" }}>/ 10</span>
                      </div>
                      {body(meanLabel(stats.mean))}
                    </>)}
                    {statCard(<>
                      {label("the middle ground")}
                      <div style={{ marginTop: "0.4rem", display: "flex", alignItems: "baseline", gap: "4px" }}>
                        {bigNum(stats.median)}
                        <span style={{ fontSize: "0.75rem", color: soft ? "var(--s-text-3)" : "#888" }}>/ 10</span>
                      </div>
                      {body(medianLabel(stats.median))}
                    </>)}
                  </div>

                  {/* Animated blob canvas — blob count = occurrence count per rating */}
                  {statCard(<>
                    {label("your mood in colour")}
                    <div style={{ position: "relative", height: "88px", marginTop: "0.75rem", borderRadius: soft ? "10px" : "3px", overflow: "hidden", border: soft ? "1px solid var(--s-border-mid)" : "1.5px solid var(--black)" }}>
                      <canvas
                        ref={canvasRef}
                        style={{
                          position: "absolute",
                          left: "-20px", top: "-20px",
                          width: "calc(100% + 40px)",
                          height: "calc(100% + 40px)",
                          filter: "blur(14px)",
                        }}
                      />
                    </div>
                    {body(`Your most frequent rating was ${stats.mode.join(" and ")} — logged ${stats.modeCount} ${stats.modeCount === 1 ? "time" : "times"}.`)}
                  </>)}

                  {/* Distribution */}
                  {statCard(<>
                    {label("where your days landed")}
                    <div style={{ display: "flex", alignItems: "flex-end", gap: "3px", height: "48px", marginTop: "0.75rem" }}>
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
                        const count = stats.distribution[n] ?? 0;
                        const pct = count === 0 ? 0 : Math.max(4, Math.round((count / maxDist) * 100));
                        return (
                          <div key={n} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
                            <div style={{ width: "100%", height: `${pct}%`, background: ratingToColor(n), border: soft ? "1px solid var(--s-border-mid)" : "1.5px solid var(--black)", borderRadius: soft ? "3px 3px 0 0" : undefined, opacity: count === 0 ? 0.15 : 1 }} />
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "3px" }}>
                      <span style={{ fontSize: "0.5rem", color: soft ? "var(--s-text-3)" : "#aaa" }}>1</span>
                      <span style={{ fontSize: "0.5rem", color: soft ? "var(--s-text-3)" : "#aaa" }}>10</span>
                    </div>
                  </>)}

                  {/* Best / worst */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    {stats.highest && statCard(<>
                      {label("your peak")}
                      <div style={{ marginTop: "0.4rem", display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ width: "16px", height: "16px", borderRadius: soft ? "5px" : "3px", background: ratingToColor(stats.highest.rating), border: soft ? "1px solid var(--s-border-mid)" : "1.5px solid var(--black)", display: "inline-block", flexShrink: 0 }} />
                        {bigNum(stats.highest.rating)}
                      </div>
                      {body(stats.highest.date)}
                      {stats.highest.note && <p style={{ fontSize: "0.65rem", fontStyle: "italic", color: soft ? "var(--s-text-3)" : "#999", margin: "0.25rem 0 0" }}>&ldquo;{stats.highest.note}&rdquo;</p>}
                    </>)}
                    {stats.lowest && statCard(<>
                      {label("your hardest day")}
                      <div style={{ marginTop: "0.4rem", display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ width: "16px", height: "16px", borderRadius: soft ? "5px" : "3px", background: ratingToColor(stats.lowest.rating), border: soft ? "1px solid var(--s-border-mid)" : "1.5px solid var(--black)", display: "inline-block", flexShrink: 0 }} />
                        {bigNum(stats.lowest.rating)}
                      </div>
                      {body(stats.lowest.date)}
                      {stats.lowest.note && <p style={{ fontSize: "0.65rem", fontStyle: "italic", color: soft ? "var(--s-text-3)" : "#999", margin: "0.25rem 0 0" }}>&ldquo;{stats.lowest.note}&rdquo;</p>}
                    </>)}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </>
  );
}
