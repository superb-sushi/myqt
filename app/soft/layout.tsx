export default function SoftLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="soft-dark" style={{ background: "var(--s-bg)", minHeight: "100vh", color: "var(--s-text)" }}>
      {children}
    </div>
  );
}
