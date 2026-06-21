import { login } from "@/app/actions/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string; error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      {/* Top stripe */}
      <div style={{ background: "var(--black)", height: "8px", width: "100%" }} />

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        {/* Title block */}
        <div className="b-box-lg mb-10" style={{ background: "var(--yellow)", padding: "1.25rem 2.5rem", display: "inline-block" }}>
          <h1
            className="serif"
            style={{ fontSize: "2.5rem", fontWeight: 600, color: "var(--black)", letterSpacing: "-0.02em", lineHeight: 1, margin: 0 }}
          >
            myqt.
          </h1>
        </div>

        {params.registered && (
          <div className="b-box mb-6" style={{ background: "var(--cobalt)", color: "var(--white)", padding: "0.5rem 1.25rem", fontSize: "0.72rem", letterSpacing: "0.14em", textTransform: "uppercase" }}>
            ✓ account created — welcome
          </div>
        )}
        {params.error && (
          <div className="b-box mb-6" style={{ background: "var(--red)", color: "var(--white)", padding: "0.5rem 1.25rem", fontSize: "0.72rem", letterSpacing: "0.14em", textTransform: "uppercase" }}>
            ✗ invalid email or password
          </div>
        )}

        <form className="w-full" style={{ maxWidth: "380px" }}>
          <div className="mb-5">
            <label className="b-label">email</label>
            <input name="email" type="email" required className="b-input" />
          </div>
          <div className="mb-8">
            <label className="b-label">password</label>
            <input name="password" type="password" required className="b-input" />
          </div>

          <button
            type="submit"
            formAction={login}
            className="b-btn b-btn-dark w-full text-center"
            style={{ display: "block" }}
          >
            enter →
          </button>
        </form>

        <div style={{ marginTop: "1.5rem", borderTop: "2px solid var(--black)", paddingTop: "1.5rem", width: "100%", maxWidth: "380px", textAlign: "center" }}>
          <p style={{ fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--black)" }}>
            new here?{" "}
            <a href="/register" className="b-btn" style={{ padding: "0.3rem 0.75rem", fontSize: "0.65rem", display: "inline-block", marginLeft: "0.5rem", background: "var(--bg)" }}>
              create account
            </a>
          </p>
        </div>
      </div>

      {/* Bottom stripe */}
      <div style={{ background: "var(--black)", height: "8px", width: "100%" }} />
    </div>
  );
}
