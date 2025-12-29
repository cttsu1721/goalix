import { Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function VerifyPage() {
  return (
    <div className="bg-night border border-night-mist rounded-2xl p-8 text-center">
      {/* Success Icon */}
      <div className="w-16 h-16 rounded-2xl bg-zen-green-soft flex items-center justify-center mx-auto mb-6">
        <Mail className="w-8 h-8 text-zen-green" />
      </div>

      <h1 className="text-xl font-medium text-moon mb-3">Check your email</h1>

      <p className="text-moon-dim text-sm leading-relaxed mb-6">
        We sent a magic link to your email address.
        <br />
        Click the link to sign in.
      </p>

      <div className="bg-night-soft border border-night-mist rounded-xl p-4 mb-6">
        <p className="text-xs text-moon-faint">
          The link will expire in 24 hours.
          <br />
          Check your spam folder if you don&apos;t see the email.
        </p>
      </div>

      <Link
        href="/login"
        className="inline-flex items-center gap-2 text-sm text-lantern hover:text-lantern/80 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to login
      </Link>
    </div>
  );
}
