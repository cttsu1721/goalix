import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Central glow behind card */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(232, 168, 87, 0.08) 0%, transparent 60%)',
          }}
        />
        {/* Subtle corner accent */}
        <div
          className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full opacity-50"
          style={{
            background: 'radial-gradient(circle, rgba(125, 211, 168, 0.05) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Logo */}
      <Link
        href="/"
        className="relative z-10 mb-12 text-[1.75rem] font-medium tracking-wider text-moon animate-fade-in-delay-1"
      >
        goalzenix<span className="text-lantern font-light">.</span>
      </Link>

      {/* Card Container */}
      <div className="relative z-10 w-full max-w-[400px] animate-fade-in-delay-2">
        {children}
      </div>

      {/* Back to home link */}
      <Link
        href="/"
        className="relative z-10 mt-8 text-sm text-moon-faint hover:text-moon-soft transition-colors animate-fade-in-delay-3"
      >
        ← Back to home
      </Link>
    </div>
  );
}
