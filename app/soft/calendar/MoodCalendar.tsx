"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { ratingToColor } from "@/lib/moods";
import { setMood } from "@/app/actions/mood";

type DayData = {
  dateStr: string;
  rating: number | null;
  note: string | null;
  hasEntry: boolean;
};

type Props = { year: number; month: number; days: DayData[] };
type OptimisticDay = { rating: number | null; note: string | null };

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const RATINGS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export function SoftMoodCalendar({ year, month, days }: Props) {
  const [optimistic, setOptimistic] = useState<Record<string, OptimisticDay>>({});
  const [picker, setPicker] = useState<string | null>(null);
  const [pendingRating, setPendingRating] = useState<number | null>(null);
  const [noteInput, setNoteInput] = useState("");
  const [, startTransition] = useTransition();
  const pickerRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const byDate = Object.fromEntries(days.map((d) => [d.dateStr, d]));

  function getDay(dateStr: string): OptimisticDay {
    if (dateStr in optimistic) return optimistic[dateStr];
    const d = byDate[dateStr];
    return { rating: d?.rating ?? null, note: d?.note ?? null };
  }

  function openPicker(dateStr: string) {
    const current = getDay(dateStr);
    setPicker(dateStr);
    setPendingRating(current.rating);
    setNoteInput(current.note ?? "");
  }

  function closePicker() {
    setPicker(null);
    setPendingRating(null);
    setNoteInput("");
  }

  function handleSave() {
    if (!picker || pendingRating === null) return;
    const dateStr = picker;
    const rating = pendingRating;
    const note = noteInput;
    setOptimistic((prev) => ({ ...prev, [dateStr]: { rating, note: note.trim() || null } }));
    closePicker();
    startTransition(() => { setMood(dateStr, rating, note); });
  }

  function handleClear() {
    if (!picker) return;
    const dateStr = picker;
    setOptimistic((prev) => ({ ...prev, [dateStr]: { rating: null, note: null } }));
    closePicker();
    startTransition(() => { setMood(dateStr, null); });
  }

  useEffect(() => {
    if (!picker) return;
    function handleClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) closePicker();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [picker]);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) =>
      `${year}-${String(month + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`
    ),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div style={{ maxWidth: "600px", width: "100%", margin: "0 auto" }}>
      {/* Weekday headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: "6px" }}>
        {WEEKDAYS.map((d) => (
          <div key={d} style={{ textAlign: "center", fontSize: "0.55rem", fontWeight: 500, letterSpacing: "0.16em", textTransform: "uppercase", padding: "0.4rem 0", color: "var(--s-text-3)" }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
        {cells.map((dateStr, i) => {
          if (!dateStr) return <div key={i} />;

          const { rating, note } = getDay(dateStr);
          const bg = rating !== null ? ratingToColor(rating) : "var(--s-surface-card)";
          const isToday = dateStr === todayStr;
          const isPast = dateStr <= todayStr;
          const isOpen = picker === dateStr;
          const dayNum = parseInt(dateStr.split("-")[2], 10);
          const hasEntry = byDate[dateStr]?.hasEntry ?? false;

          return (
            <div key={dateStr} style={{ position: "relative" }}>
              <button
                onClick={() => isPast && (isOpen ? closePicker() : openPicker(dateStr))}
                title={note ?? undefined}
                style={{
                  width: "100%", aspectRatio: "1",
                  border: isToday ? "1.5px solid var(--s-text)" : "1px solid var(--s-border-mid)",
                  borderRadius: "10px",
                  background: bg,
                  cursor: isPast ? "pointer" : "default",
                  opacity: isPast ? 1 : 0.3,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "3px",
                  padding: "2px",
                  transition: "transform 0.15s ease, box-shadow 0.15s ease",
                  boxShadow: rating !== null ? "var(--s-shadow-card)" : "none",
                }}
                onMouseEnter={(e) => isPast && ((e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.transform = "none")}
              >
                <span style={{ fontSize: "0.58rem", fontWeight: isToday ? 600 : 400, color: rating !== null ? "#0A0806" : "var(--s-text-2)", lineHeight: 1 }}>
                  {dayNum}
                </span>
                {rating !== null && (
                  <span style={{ fontSize: "0.62rem", fontWeight: 700, color: "#0A0806", lineHeight: 1 }}>
                    {rating}
                  </span>
                )}
                {hasEntry && (
                  <div style={{ width: "3px", height: "3px", borderRadius: "50%", background: rating !== null ? "rgba(0,0,0,0.3)" : "var(--s-text-3)" }} />
                )}
              </button>

              {isOpen && (
                <div
                  ref={pickerRef}
                  style={{
                    position: "absolute", top: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)",
                    zIndex: 100,
                    background: "var(--s-surface-card)",
                    border: "1px solid var(--s-border-mid)",
                    borderRadius: "16px",
                    boxShadow: "var(--s-shadow-raised)",
                    padding: "14px",
                    minWidth: "230px",
                    display: "flex", flexDirection: "column", gap: "10px",
                  }}
                >
                  <p style={{ fontSize: "0.55rem", fontWeight: 500, letterSpacing: "0.16em", textTransform: "uppercase", margin: 0, color: "var(--s-text-3)" }}>
                    how was your day?
                  </p>

                  {/* Rating buttons */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: "3px" }}>
                    {RATINGS.map((n) => (
                      <button
                        key={n}
                        onClick={() => setPendingRating(pendingRating === n ? null : n)}
                        style={{
                          aspectRatio: "1",
                          border: pendingRating === n ? "2px solid var(--s-text)" : "1px solid var(--s-border-mid)",
                          borderRadius: "6px",
                          background: ratingToColor(n),
                          cursor: "pointer",
                          fontSize: "0.55rem", fontWeight: 700,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#0A0806",
                          transform: pendingRating === n ? "translateY(-2px)" : "none",
                          boxShadow: pendingRating === n ? "var(--s-shadow)" : "none",
                          transition: "transform 0.12s ease, box-shadow 0.12s ease",
                        }}
                      >
                        {n}
                      </button>
                    ))}
                  </div>

                  {/* Note */}
                  <textarea
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder="add a note… (optional)"
                    rows={2}
                    style={{
                      width: "100%",
                      border: "1px solid var(--s-border-mid)",
                      borderRadius: "8px",
                      background: "var(--s-surface)",
                      padding: "7px 10px",
                      fontSize: "0.68rem",
                      fontFamily: "var(--font-sans)",
                      lineHeight: 1.5,
                      resize: "none",
                      outline: "none",
                      color: "var(--s-text)",
                    }}
                  />

                  {/* Actions */}
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      onClick={handleSave}
                      disabled={pendingRating === null}
                      className="s-btn s-btn-dark"
                      style={{ flex: 1, padding: "0.4rem", fontSize: "0.58rem", opacity: pendingRating !== null ? 1 : 0.4, cursor: pendingRating !== null ? "pointer" : "default" }}
                    >
                      save
                    </button>
                    {getDay(dateStr).rating !== null && (
                      <button
                        onClick={handleClear}
                        style={{ background: "none", border: "1px solid var(--s-border-mid)", borderRadius: "8px", padding: "0.4rem 0.75rem", fontSize: "0.58rem", cursor: "pointer", fontFamily: "var(--font-sans)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--s-text-2)" }}
                      >
                        clear
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Gradient legend */}
      <div style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--s-border-mid)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "0.52rem", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--s-text-3)", whiteSpace: "nowrap" }}>1 — low</span>
          <div style={{
            flex: 1, height: "10px", borderRadius: "99px",
            border: "1px solid var(--s-border-mid)",
            background: `linear-gradient(to right, #1E3A6E 0%, #EDE4D0 44.4%, #F0C040 77.8%, #C4601A 100%)`,
          }} />
          <span style={{ fontSize: "0.52rem", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--s-text-3)", whiteSpace: "nowrap" }}>10 — high</span>
        </div>
      </div>
    </div>
  );
}
