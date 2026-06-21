"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { updateStickerPosition } from "@/app/actions/quiettime";
import { pickSticker, pickRotation } from "@/lib/stickers";

type Entry = {
  id: string;
  reference: string;
  date: string;
  tag: string | null;
  verse: string | null;
  details: string | null;
  reflection: string | null;
  positionX: number;
  positionY: number;
  rotation: number;
};

const ACCENT_COLORS = ["#F0C040", "#FAF5E9", "#C8DCF0", "#F0C8B4", "#C8E0C4"];
const DRAG_THRESHOLD = 6;

export function StickerBoard({ entries }: { entries: Entry[] }) {
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>(
    Object.fromEntries(entries.map((e) => [e.id, { x: e.positionX, y: e.positionY }]))
  );
  const [expanded, setExpanded] = useState<string | null>(null);
  const [raised, setRaised] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const boardRef = useRef<HTMLDivElement>(null);
  const livePos = useRef<{ x: number; y: number } | null>(null);

  function onMouseDown(id: string, e: React.MouseEvent) {
    e.preventDefault();
    setRaised(id);

    const startX = e.clientX;
    const startY = e.clientY;
    const origPos = positions[id];
    livePos.current = { x: origPos.x, y: origPos.y };
    let didDrag = false;

    function onMove(me: MouseEvent) {
      if (!boardRef.current) return;
      const totalDx = Math.abs(me.clientX - startX);
      const totalDy = Math.abs(me.clientY - startY);
      if (totalDx > DRAG_THRESHOLD || totalDy > DRAG_THRESHOLD) didDrag = true;

      const board = boardRef.current.getBoundingClientRect();
      const dx = ((me.clientX - startX) / board.width) * 100;
      const dy = ((me.clientY - startY) / board.height) * 100;
      const next = {
        x: Math.max(1, Math.min(80, origPos.x + dx)),
        y: Math.max(1, Math.min(78, origPos.y + dy)),
      };
      livePos.current = next;
      setPositions((p) => ({ ...p, [id]: next }));
    }

    function onUp() {
      if (!didDrag) {
        setExpanded((prev) => (prev === id ? null : id));
      } else if (livePos.current) {
        const { x, y } = livePos.current;
        if (Math.abs(x - origPos.x) > 0.5 || Math.abs(y - origPos.y) > 0.5) {
          updateStickerPosition(id, x, y);
        }
      }
      livePos.current = null;
      setRaised(null);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  const normalizedQuery = query.trim().toLowerCase();

  return (
    <>
      {/* Search bar */}
      <div style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "var(--bg)",
        borderBottom: "2.5px solid var(--black)",
        padding: "0.6rem 1.25rem",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
      }}>
        <span style={{ fontSize: "0.6rem", letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 700, whiteSpace: "nowrap" }}>
          search
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="reference, verse, or tag…"
          style={{
            flex: 1,
            maxWidth: "360px",
            border: "2px solid var(--black)",
            background: "transparent",
            padding: "0.35rem 0.65rem",
            fontSize: "0.78rem",
            fontFamily: "var(--font-sans)",
            outline: "none",
            color: "var(--black)",
          }}
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            style={{ fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", background: "none", border: "none", cursor: "pointer", color: "#888", padding: 0 }}
          >
            clear ×
          </button>
        )}
      </div>

      <div ref={boardRef} className="board-wrap" style={{ position: "relative", minHeight: "calc(100vh - 57px)", width: "100%" }}>
        {entries.map((entry, i) => {
          const pos = positions[entry.id];
          const isExpanded = expanded === entry.id;
          const isRaised = raised === entry.id;
          const accentBg = ACCENT_COLORS[i % ACCENT_COLORS.length];

          const isMatch = normalizedQuery === "" ||
            [entry.reference, entry.verse, entry.tag].some(
              (f) => f?.toLowerCase().includes(normalizedQuery)
            );

          const date = new Date(entry.date).toLocaleDateString("en-US", {
            month: "short", day: "numeric", year: "numeric",
          });

          const sections = [
            { label: "verse", text: entry.verse },
            { label: "details", text: entry.details },
            { label: "reflection", text: entry.reflection },
          ].filter((s) => s.text);

          // framer-motion handles filter only; CSS transition handles the rest
          const shadowFilter = isRaised
            ? "drop-shadow(8px 8px 0 #0A0806)"
            : "drop-shadow(3px 3px 0 #0A0806)";

          return (
            <motion.div
              key={entry.id}
              onMouseDown={(e) => onMouseDown(entry.id, e)}
              animate={{
                filter: isMatch ? shadowFilter : "grayscale(1) opacity(0.25)",
              }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              style={{
                position: "absolute",
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                width: isExpanded ? "280px" : "200px",
                transform: `rotate(${isExpanded ? 0 : entry.rotation * 0.5}deg)`,
                cursor: isRaised ? "grabbing" : "grab",
                userSelect: "none",
                zIndex: isExpanded || isRaised ? 20 : 1,
                transition: "width 0.25s ease, transform 0.25s ease",
                border: "2.5px solid var(--black)",
                background: "var(--bg)",
                overflow: "hidden",
              }}
            >
              {/* Coloured header strip */}
              <div style={{ background: accentBg, borderBottom: "2.5px solid var(--black)", padding: "8px 12px", display: "flex", alignItems: "center", gap: "8px" }}>
                <p style={{ fontFamily: "var(--font-serif)", fontSize: "0.95rem", fontWeight: 600, color: "var(--black)", lineHeight: 1.2, flex: 1, margin: 0 }}>
                  {entry.reference}
                </p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pickSticker(entry.id)}
                  alt=""
                  draggable={false}
                  style={{
                    height: "34px",
                    width: "auto",
                    flexShrink: 0,
                    filter: "drop-shadow(0 2px 0 white) drop-shadow(0 -2px 0 white) drop-shadow(2px 0 0 white) drop-shadow(-2px 0 0 white)",
                    pointerEvents: "none",
                    transform: `rotate(${pickRotation(entry.id)}deg)`,
                  }}
                />
              </div>

              {/* Collapsed body */}
              {!isExpanded && (
                <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: "6px" }}>
                  {entry.tag && (
                    <span style={{ display: "inline-block", fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", border: "1.5px solid var(--black)", padding: "1px 6px" }}>
                      {entry.tag}
                    </span>
                  )}
                  {entry.details && (
                    <p style={{ fontSize: "0.7rem", color: "#4a3f33", lineHeight: 1.55, fontStyle: "italic", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
                      &ldquo;{entry.details}&rdquo;
                    </p>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1.5px solid var(--black)", paddingTop: "6px", marginTop: "2px" }}>
                    <span style={{ fontSize: "0.58rem", letterSpacing: "0.08em", fontWeight: 700, textTransform: "uppercase" }}>{date}</span>
                    <span style={{ fontSize: "0.55rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#888" }}>expand +</span>
                  </div>
                </div>
              )}

              {/* Expanded body */}
              {isExpanded && (
                <div style={{ padding: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    {entry.tag && (
                      <span style={{ display: "inline-block", fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", border: "1.5px solid var(--black)", padding: "1px 6px", background: accentBg }}>
                        {entry.tag}
                      </span>
                    )}
                    <span style={{ fontSize: "0.55rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#888", marginLeft: "auto" }}>collapse −</span>
                  </div>

                  {sections.map((s, j) => (
                    <div
                      key={s.label}
                      style={{
                        borderTop: j === 0 ? "none" : "1.5px solid var(--black)",
                        paddingTop: j === 0 ? 0 : "8px",
                        marginTop: j === 0 ? 0 : "8px",
                      }}
                    >
                      <span style={{ fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", display: "block", marginBottom: "3px" }}>
                        {s.label}
                      </span>
                      <p style={{ fontSize: "0.72rem", lineHeight: 1.6, color: "#2a2420" }}>{s.text}</p>
                    </div>
                  ))}

                  <div style={{ borderTop: "1.5px solid var(--black)", paddingTop: "6px", marginTop: "10px" }}>
                    <span style={{ fontSize: "0.58rem", letterSpacing: "0.08em", fontWeight: 700, textTransform: "uppercase" }}>{date}</span>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </>
  );
}
