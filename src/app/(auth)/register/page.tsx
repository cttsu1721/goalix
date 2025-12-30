"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setIsLoading(false);
      return;
    }

    try {
      // Register the user
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message || "Failed to create account");
        setIsLoading(false);
        return;
      }

      // Auto sign in after registration
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        // Registration succeeded but sign in failed, redirect to login
        router.push("/login?registered=true");
      } else {
        // Success - redirect to dashboard
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
        <h1 className="text-xl font-medium text-moon mb-2">Create your account</h1>
        <p className="text-moon-dim text-sm">
          Start your journey to achieving your dreams
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
        {/* Name */}
        <div className="space-y-2">
          <label
            htmlFor="name"
            className="text-[0.6875rem] font-medium uppercase tracking-[0.15em] text-moon-faint block"
          >
            Name <span className="text-moon-faint/50">(optional)</span>
          </label>
          <div className="relative">
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              disabled={isLoading}
              className="h-12 bg-night-soft border-night-mist text-moon placeholder:text-moon-faint rounded-xl pl-11 focus:border-lantern focus:ring-lantern/20"
            />
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-moon-faint" />
          </div>
        </div>

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
          <label
            htmlFor="password"
            className="text-[0.6875rem] font-medium uppercase tracking-[0.15em] text-moon-faint block"
          >
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 characters"
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

        {/* Confirm Password */}
        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="text-[0.6875rem] font-medium uppercase tracking-[0.15em] text-moon-faint block"
          >
            Confirm password
          </label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              required
              disabled={isLoading}
              className="h-12 bg-night-soft border-night-mist text-moon placeholder:text-moon-faint rounded-xl pl-11 focus:border-lantern focus:ring-lantern/20"
            />
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-moon-faint" />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading || !email || !password || !confirmPassword}
          className="w-full h-12 bg-lantern text-void hover:bg-lantern/90 font-medium rounded-xl transition-all duration-200 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              Create Account
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

      {/* Sign in prompt */}
      <p className="text-center text-sm text-moon-dim">
        Already have an account?{" "}
        <Link href="/login" className="text-lantern hover:text-lantern/80 transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}
