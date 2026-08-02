import { requestReset } from "@/app/actions/password-reset";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      <div style={{ background: "var(--black)", height: "8px", width: "100%" }} />

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="b-box-lg mb-10" style={{ background: "var(--yellow)", padding: "1.25rem 2.5rem", display: "inline-block" }}>
          <h1 className="serif" style={{ fontSize: "2.5rem", fontWeight: 600, color: "var(--black)", letterSpacing: "-0.02em", lineHeight: 1, margin: 0 }}>
            myqt.
          </h1>
        </div>

        {params.sent ? (
          <div style={{ maxWidth: "380px", width: "100%", textAlign: "center" }}>
            <div className="b-box mb-6" style={{ background: "var(--cobalt)", color: "var(--white)", padding: "0.75rem 1.25rem", fontSize: "0.72rem", letterSpacing: "0.14em", textTransform: "uppercase" }}>
              ✓ if that email exists, a reset link is on its way
            </div>
            <a href="/login" style={{ fontSize: "0.65rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--black)", borderBottom: "1.5px solid var(--black)", textDecoration: "none" }}>
              ← back to login
            </a>
          </div>
        ) : (
          <>
            <p style={{ fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#666", marginBottom: "2rem" }}>
              enter your email to receive a reset link
            </p>

            <form className="w-full" style={{ maxWidth: "380px" }}>
              <div className="mb-6">
                <label className="b-label">email</label>
                <input name="email" type="email" required className="b-input" />
              </div>

              <button
                type="submit"
                formAction={requestReset}
                className="b-btn b-btn-dark w-full text-center"
                style={{ display: "block" }}
              >
                send reset link →
              </button>
            </form>

            <div style={{ marginTop: "1.5rem", borderTop: "2px solid var(--black)", paddingTop: "1.5rem", width: "100%", maxWidth: "380px", textAlign: "center" }}>
              <a href="/login" style={{ fontSize: "0.65rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--black)", borderBottom: "1.5px solid var(--black)", textDecoration: "none" }}>
                ← back to login
              </a>
            </div>
          </>
        )}
      </div>

      <div style={{ background: "var(--black)", height: "8px", width: "100%" }} />
    </div>
  );
}
