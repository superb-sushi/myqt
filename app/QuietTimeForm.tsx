"use client";

import { useFormStatus } from "react-dom";
import { saveQuietTime } from "@/app/actions/quiettime";

export function QuietTimeForm() {
  return (
    <form action={saveQuietTime}>
      {/* Scripture — hero input */}
      <div
        className="b-box"
        style={{ background: "var(--yellow)", padding: "1.25rem 1.5rem", marginBottom: "2rem" }}
      >
        <label className="b-label" style={{ marginBottom: "0.75rem" }}>
          scripture <span style={{ color: "var(--red)" }}>*</span>
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
            fontWeight: 600,
            color: "var(--black)",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}
        />
      </div>

      {/* Body sections */}
      <div style={{ display: "grid", gap: "1.5rem", marginBottom: "2rem" }}>
        <Field
          name="verse"
          label="the verse"
          rows={4}
          placeholder="what is the passage, or the line that caught your eye?"
        />
        <Field
          name="details"
          label="what is the verse about?"
          rows={5}
          placeholder="anything noteworthy, anything interesting?"
        />
        <Field
          name="reflection"
          label="reflection"
          rows={5}
          placeholder="what's on your mind?"
        />
      </div>

      {/* Footer */}
      <div
        className="form-footer"
        style={{
          display: "flex",
          gap: "1rem",
          alignItems: "flex-end",
          borderTop: "2.5px solid var(--black)",
          paddingTop: "1.5rem",
        }}
      >
        <div style={{ flex: 1 }}>
          <label className="b-label">tag</label>
          <input
            name="tag"
            placeholder="i.e. surrender"
            className="b-input"
            style={{ fontSize: "0.85rem" }}
          />
        </div>
        <div className="form-footer-submit"><SubmitButton /></div>
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  rows,
  placeholder,
}: {
  name: string;
  label: string;
  rows: number;
  placeholder: string;
}) {
  return (
    <div>
      <label className="b-label">{label}</label>
      <textarea name={name} rows={rows} placeholder={placeholder} className="b-textarea" />
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="b-btn b-btn-dark"
      style={{ whiteSpace: "nowrap", flexShrink: 0, opacity: pending ? 0.6 : 1 }}
    >
      {pending ? "saving..." : "Save →"}
    </button>
  );
}
