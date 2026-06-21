import { softRegister } from "@/app/soft/actions/auth";

export default async function SoftRegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--s-bg)", padding: "2rem" }}>
      <div style={{ marginBottom: "2.5rem", textAlign: "center" }}>
        <div style={{ display: "inline-block", background: "var(--s-yellow-tint)", border: "1px solid var(--s-yellow-border)", borderRadius: "99px", padding: "0.35rem 1.1rem", marginBottom: "1rem" }}>
          <span style={{ fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--s-text-2)", fontWeight: 500 }}>quiet time</span>
        </div>
        <h1 className="serif" style={{ fontSize: "3rem", fontWeight: 400, color: "var(--s-text)", letterSpacing: "-0.03em", lineHeight: 1, margin: 0 }}>
          begin here.
        </h1>
      </div>

      {params.error === "exists" && (
        <div style={{ background: "rgba(196,56,26,0.1)", border: "1px solid rgba(196,56,26,0.25)", borderRadius: "10px", color: "var(--red)", padding: "0.6rem 1.2rem", fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "1.5rem" }}>
          ✗ email already registered
        </div>
      )}
      {params.error === "missing" && (
        <div style={{ background: "rgba(196,56,26,0.1)", border: "1px solid rgba(196,56,26,0.25)", borderRadius: "10px", color: "var(--red)", padding: "0.6rem 1.2rem", fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "1.5rem" }}>
          ✗ email and password required
        </div>
      )}

      <div style={{ width: "100%", maxWidth: "400px", background: "var(--s-surface-card)", border: "1px solid var(--s-border)", borderRadius: "18px", padding: "2rem 2.25rem", boxShadow: "var(--s-shadow-raised)" }}>
        <form>
          <div style={{ marginBottom: "1.25rem" }}>
            <label className="s-label">email</label>
            <input name="email" type="email" required className="s-input" />
          </div>
          <div style={{ marginBottom: "2rem" }}>
            <label className="s-label">
              password <span style={{ color: "var(--s-text-4)", fontWeight: 400 }}>(min. 8 chars)</span>
            </label>
            <input name="password" type="password" required minLength={8} className="s-input" />
          </div>
          <button type="submit" formAction={softRegister} className="s-btn s-btn-dark" style={{ display: "block", width: "100%", textAlign: "center" }}>
            create account →
          </button>
        </form>

        <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid var(--s-border)", textAlign: "center" }}>
          <p style={{ fontSize: "0.72rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--s-text-3)", margin: 0 }}>
            have an account?{" "}
            <a href="/soft/login" style={{ display: "inline-block", marginLeft: "0.5rem", padding: "0.3rem 0.85rem", fontSize: "0.62rem", borderRadius: "8px", background: "var(--s-yellow-tint)", border: "1px solid var(--s-yellow-border)", color: "var(--s-text-2)", textDecoration: "none" }}>
              sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
