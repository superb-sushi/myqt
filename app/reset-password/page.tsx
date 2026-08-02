import { resetPassword } from "@/app/actions/password-reset";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const params = await searchParams;

  const errorMsg =
    params.error === "expired"
      ? "✗ link expired or already used — request a new one"
      : params.error === "invalid"
      ? "✗ password must be at least 8 characters"
      : null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      <div style={{ background: "var(--black)", height: "8px", width: "100%" }} />

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="b-box-lg mb-10" style={{ background: "var(--yellow)", padding: "1.25rem 2.5rem", display: "inline-block" }}>
          <h1 className="serif" style={{ fontSize: "2.5rem", fontWeight: 600, color: "var(--black)", letterSpacing: "-0.02em", lineHeight: 1, margin: 0 }}>
            myqt.
          </h1>
        </div>

        {errorMsg && (
          <div className="b-box mb-6" style={{ background: "var(--red)", color: "var(--white)", padding: "0.5rem 1.25rem", fontSize: "0.72rem", letterSpacing: "0.14em", textTransform: "uppercase", maxWidth: "380px", width: "100%" }}>
            {errorMsg}
          </div>
        )}

        {!params.token ? (
          <div style={{ maxWidth: "380px", width: "100%", textAlign: "center" }}>
            <p style={{ fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#666", marginBottom: "1.5rem" }}>
              invalid reset link
            </p>
            <a href="/forgot-password" className="b-btn b-btn-dark" style={{ display: "inline-block" }}>
              request a new link →
            </a>
          </div>
        ) : (
          <>
            <p style={{ fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#666", marginBottom: "2rem" }}>
              choose a new password
            </p>

            <form className="w-full" style={{ maxWidth: "380px" }}>
              <input type="hidden" name="token" value={params.token} />
              <div className="mb-6">
                <label className="b-label">new password</label>
                <input name="password" type="password" required minLength={8} className="b-input" placeholder="at least 8 characters" />
              </div>

              <button
                type="submit"
                formAction={resetPassword}
                className="b-btn b-btn-dark w-full text-center"
                style={{ display: "block" }}
              >
                set new password →
              </button>
            </form>
          </>
        )}
      </div>

      <div style={{ background: "var(--black)", height: "8px", width: "100%" }} />
    </div>
  );
}
