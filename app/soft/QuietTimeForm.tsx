"use client";

import { useFormStatus } from "react-dom";
import { saveSoftQuietTime } from "@/app/soft/actions/quiettime";

export function SoftQuietTimeForm() {
  return (
    <form action={saveSoftQuietTime}>
      {/* Scripture — hero input */}
      <div style={{
        background: "var(--s-yellow-tint)",
        border: "1px solid var(--s-yellow-border)",
        borderRadius: "16px",
        padding: "1.5rem 1.75rem",
        marginBottom: "2rem",
      }}>
        <label className="s-label" style={{ marginBottom: "0.75rem" }}>
          scripture <span style={{ color: "var(--red)", opacity: 0.7 }}>*</span>
        </label>
        <input
          name="reference"
          required
          autoFocus
          placeholder="e.g. John 15 : 1–11"
          className="scripture-input"
          style={{
            width: "100%",
            background: "transparent",
            border: "none",
            outline: "none",
            fontFamily: "var(--font-serif)",
            fontSize: "2rem",
            fontWeight: 400,
            color: "var(--s-text)",
            letterSpacing: "-0.02em",
            lineHeight: 1.15,
          }}
        />
      </div>

      {/* Body fields */}
      <div style={{ display: "grid", gap: "1.5rem", marginBottom: "2rem" }}>
        <SoftField name="verse" label="the verse" rows={4} placeholder="what is the passage, or the line that caught your eye?" />
        <SoftField name="details" label="what is the verse about?" rows={5} placeholder="anything noteworthy, anything interesting?" />
        <SoftField name="reflection" label="reflection" rows={5} placeholder="what's on your mind" />
      </div>

      {/* Footer */}
      <div className="form-footer" style={{
        display: "flex",
        gap: "1rem",
        alignItems: "flex-end",
        borderTop: "1px solid var(--s-border)",
        paddingTop: "1.5rem",
      }}>
        <div style={{ flex: 1 }}>
          <label className="s-label">tag</label>
          <input name="tag" placeholder="i.e. surrender" className="s-input" style={{ fontSize: "0.85rem" }} />
        </div>
        <div className="form-footer-submit"><SoftSubmitButton /></div>
      </div>
    </form>
  );
}

function SoftField({ name, label, rows, placeholder }: { name: string; label: string; rows: number; placeholder: string }) {
  return (
    <div>
      <label className="s-label">{label}</label>
      <textarea name={name} rows={rows} placeholder={placeholder} className="s-textarea" />
    </div>
  );
}

function SoftSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="s-btn s-btn-dark"
      style={{ whiteSpace: "nowrap", flexShrink: 0, opacity: pending ? 0.6 : 1 }}
    >
      {pending ? "saving..." : "Save →"}
    </button>
  );
}
