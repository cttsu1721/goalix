"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "true";
  const passwordReset = searchParams.get("reset") === "true";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
        setIsLoading(false);
      } else if (result?.ok) {
        router.push("/dashboard");
      }
    } catch {
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
          Sign in to continue your journey
        </p>
      </div>

      {/* Success Messages */}
      {justRegistered && (
        <div className="mb-6 p-3 bg-zen-green/10 border border-zen-green/30 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-zen-green flex-shrink-0" />
          <p className="text-sm text-zen-green">Account created! Please sign in.</p>
        </div>
      )}

      {passwordReset && (
        <div className="mb-6 p-3 bg-zen-green/10 border border-zen-green/30 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-zen-green flex-shrink-0" />
          <p className="text-sm text-zen-green">Password updated! Please sign in.</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-3 bg-zen-red-soft border border-zen-red/30 rounded-xl">
          <p className="text-sm text-zen-red text-center">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
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

        {/* Password */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-[0.6875rem] font-medium uppercase tracking-[0.15em] text-moon-faint block"
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-lantern hover:text-lantern/80 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={isLoading}
              className="h-12 bg-night-soft border-night-mist text-moon placeholder:text-moon-faint rounded-xl pl-11 pr-11 focus:border-lantern focus:ring-lantern/20"
            />
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-moon-faint" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-moon-faint hover:text-moon transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading || !email || !password}
          className="w-full h-12 bg-lantern text-void hover:bg-lantern/90 font-medium rounded-xl transition-all duration-200 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              Sign In
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-night-mist" />
        <span className="text-[0.625rem] uppercase tracking-[0.15em] text-moon-faint">
          or
        </span>
        <div className="flex-1 h-px bg-night-mist" />
      </div>

      {/* Sign up prompt */}
      <p className="text-center text-sm text-moon-dim">
        New to Goalzenix?{" "}
        <Link href="/register" className="text-lantern hover:text-lantern/80 transition-colors">
          Create an account
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="bg-night border border-night-mist rounded-2xl p-8 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-lantern" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
