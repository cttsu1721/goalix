"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message || "Failed to send reset email");
        setIsLoading(false);
        return;
      }

      setIsSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-night border border-night-mist rounded-2xl p-8">
        {/* Success State */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-zen-green/10 border border-zen-green/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-zen-green" />
          </div>
          <h1 className="text-xl font-medium text-moon mb-2">Check your email</h1>
          <p className="text-moon-dim text-sm mb-6">
            If an account exists for <span className="text-moon">{email}</span>,
            <br />
            we&apos;ve sent password reset instructions.
          </p>
          <p className="text-xs text-moon-faint mb-6">
            The link will expire in 1 hour.
            <br />
            Don&apos;t forget to check your spam folder.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-lantern hover:text-lantern/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-night border border-night-mist rounded-2xl p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-xl font-medium text-moon mb-2">Forgot password?</h1>
        <p className="text-moon-dim text-sm">
          Enter your email and we&apos;ll send you reset instructions
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-3 bg-zen-red-soft border border-zen-red/30 rounded-xl">
          <p className="text-sm text-zen-red text-center">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-[0.6875rem] font-medium uppercase tracking-[0.15em] text-moon-faint block"
          >
            Email address
          </label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={isLoading}
              className="h-12 bg-night-soft border-night-mist text-moon placeholder:text-moon-faint rounded-xl pl-11 focus:border-lantern focus:ring-lantern/20"
            />
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-moon-faint" />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading || !email}
          className="w-full h-12 bg-lantern text-void hover:bg-lantern/90 font-medium rounded-xl transition-all duration-200 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Send Reset Link"
          )}
        </Button>
      </form>

      {/* Back to sign in */}
      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-moon-dim hover:text-moon transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
