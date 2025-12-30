"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, ArrowLeft, Loader2, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If no token, show error state
  if (!token) {
    return (
      <div className="bg-night border border-night-mist rounded-2xl p-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-zen-red-soft border border-zen-red/30 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-zen-red" />
          </div>
          <h1 className="text-xl font-medium text-moon mb-2">Invalid Reset Link</h1>
          <p className="text-moon-dim text-sm mb-6">
            This password reset link is invalid or has expired.
            <br />
            Please request a new one.
          </p>
          <Link
            href="/forgot-password"
            className="inline-flex items-center gap-2 text-sm text-lantern hover:text-lantern/80 transition-colors"
          >
            Request new reset link
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password length
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message || "Failed to reset password");
        setIsLoading(false);
        return;
      }

      setIsSubmitted(true);

      // Redirect to login after a short delay
      setTimeout(() => {
        router.push("/login?reset=true");
      }, 2000);
    } catch {
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-night border border-night-mist rounded-2xl p-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-zen-green/10 border border-zen-green/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-zen-green" />
          </div>
          <h1 className="text-xl font-medium text-moon mb-2">Password Reset!</h1>
          <p className="text-moon-dim text-sm mb-6">
            Your password has been updated successfully.
            <br />
            Redirecting you to sign in...
          </p>
          <Loader2 className="w-5 h-5 animate-spin text-lantern mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-night border border-night-mist rounded-2xl p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-xl font-medium text-moon mb-2">Reset your password</h1>
        <p className="text-moon-dim text-sm">
          Enter your new password below
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-3 bg-zen-red-soft border border-zen-red/30 rounded-xl">
          <p className="text-sm text-zen-red text-center">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* New Password */}
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-[0.6875rem] font-medium uppercase tracking-[0.15em] text-moon-faint block"
          >
            New Password
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              minLength={8}
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

        {/* Confirm Password */}
        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="text-[0.6875rem] font-medium uppercase tracking-[0.15em] text-moon-faint block"
          >
            Confirm Password
          </label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              required
              minLength={8}
              disabled={isLoading}
              className="h-12 bg-night-soft border-night-mist text-moon placeholder:text-moon-faint rounded-xl pl-11 pr-11 focus:border-lantern focus:ring-lantern/20"
            />
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-moon-faint" />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-moon-faint hover:text-moon transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading || !password || !confirmPassword}
          className="w-full h-12 bg-lantern text-void hover:bg-lantern/90 font-medium rounded-xl transition-all duration-200 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Resetting...
            </>
          ) : (
            "Reset Password"
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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-night border border-night-mist rounded-2xl p-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-lantern" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
