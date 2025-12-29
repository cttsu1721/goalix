"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("email", {
        email,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (result?.error) {
        setError("Failed to send magic link. Please try again.");
        setIsLoading(false);
      } else if (result?.ok) {
        // Redirect to verify page on success
        window.location.href = "/verify";
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-night border border-night-mist rounded-2xl p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-xl font-medium text-moon mb-2">Welcome back</h1>
        <p className="text-moon-dim text-sm">
          Enter your email to sign in with a magic link
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
              Sending link...
            </>
          ) : (
            <>
              Send Magic Link
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </form>

      {/* Helper text */}
      <p className="mt-6 text-center text-xs text-moon-faint leading-relaxed">
        We&apos;ll email you a magic link for
        <br />
        password-free sign in.
      </p>

      {/* Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-night-mist" />
        <span className="text-[0.625rem] uppercase tracking-[0.15em] text-moon-faint">
          or
        </span>
        <div className="flex-1 h-px bg-night-mist" />
      </div>

      {/* New user prompt */}
      <p className="text-center text-sm text-moon-dim">
        New to Goalix?{" "}
        <span className="text-lantern">
          Just enter your email above
        </span>
        <br />
        <span className="text-moon-faint text-xs">
          We&apos;ll create your account automatically
        </span>
      </p>
    </div>
  );
}
