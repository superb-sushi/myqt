import { register } from "@/app/actions/auth";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      <div style={{ background: "var(--black)", height: "8px", width: "100%" }} />

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="b-box-lg mb-10" style={{ background: "var(--yellow)", padding: "1.25rem 2.5rem", display: "inline-block" }}>
          <h1
            className="serif"
            style={{ fontSize: "2.5rem", fontWeight: 600, color: "var(--black)", letterSpacing: "-0.02em", lineHeight: 1, margin: 0 }}
          >
            begin here
          </h1>
        </div>

        {params.error === "exists" && (
          <div className="b-box mb-6" style={{ background: "var(--red)", color: "var(--white)", padding: "0.5rem 1.25rem", fontSize: "0.72rem", letterSpacing: "0.14em", textTransform: "uppercase" }}>
            ✗ email already registered
          </div>
        )}
        {params.error === "missing" && (
          <div className="b-box mb-6" style={{ background: "var(--red)", color: "var(--white)", padding: "0.5rem 1.25rem", fontSize: "0.72rem", letterSpacing: "0.14em", textTransform: "uppercase" }}>
            ✗ email and password required
          </div>
        )}

        <form className="w-full" style={{ maxWidth: "380px" }}>
          <div className="mb-5">
            <label className="b-label">email</label>
            <input name="email" type="email" required className="b-input" />
          </div>
          <div className="mb-8">
            <label className="b-label">password <span style={{ color: "#8a7a6a", fontWeight: 400 }}>(min. 8 chars)</span></label>
            <input name="password" type="password" required minLength={8} className="b-input" />
          </div>

          <button
            type="submit"
            formAction={register}
            className="b-btn b-btn-dark w-full text-center"
            style={{ display: "block" }}
          >
            create account →
          </button>
        </form>

        <div style={{ marginTop: "1.5rem", borderTop: "2px solid var(--black)", paddingTop: "1.5rem", width: "100%", maxWidth: "380px", textAlign: "center" }}>
          <p style={{ fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            have an account?{" "}
            <a href="/login" className="b-btn" style={{ padding: "0.3rem 0.75rem", fontSize: "0.65rem", display: "inline-block", marginLeft: "0.5rem", background: "var(--bg)" }}>
              sign in
            </a>
          </p>
        </div>
      </div>

      <div style={{ background: "var(--black)", height: "8px", width: "100%" }} />
    </div>
  );
}
