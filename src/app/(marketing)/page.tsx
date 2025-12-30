import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Target, Trophy, Sparkles, ArrowRight, Layers } from "lucide-react";

// Static generation with ISR - revalidate every hour
export const revalidate = 3600;
export const dynamic = "force-static";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-void text-moon overflow-hidden">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Primary radial glow */}
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(232, 168, 87, 0.15) 0%, transparent 70%)',
          }}
        />
        {/* Secondary accent glow */}
        <div
          className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, rgba(125, 211, 168, 0.2) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-night-mist/50">
        <div className="max-w-6xl mx-auto flex h-20 items-center justify-between px-6 lg:px-8">
          <Link href="/" className="text-[1.375rem] font-medium tracking-wider">
            goalix<span className="text-lantern font-light">.</span>
          </Link>
          <Link href="/login">
            <Button className="bg-lantern text-void hover:bg-lantern/90 font-medium px-6 rounded-xl">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10">
        <section className="max-w-6xl mx-auto px-6 lg:px-8 pt-24 pb-32 lg:pt-32 lg:pb-40">
          {/* Eyebrow */}
          <div className="flex items-center justify-center gap-3 mb-8 animate-fade-in-delay-1">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-lantern/50" />
            <span className="text-[0.6875rem] font-medium uppercase tracking-[0.25em] text-lantern">
              Based on MJ DeMarco&apos;s methodology
            </span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-lantern/50" />
          </div>

          {/* Main Headline */}
          <h1 className="text-center text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-[1.1] mb-8 animate-fade-in-delay-2">
            Transform{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-lantern to-zen-green">
              10-year dreams
            </span>
            <br />
            into daily action
          </h1>

          {/* Subtitle */}
          <p className="text-center text-lg lg:text-xl text-moon-soft font-light max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in-delay-3">
            Cascade your biggest visions down to actionable daily tasks using the
            proven 1/5/10 methodology. Stay motivated with gamification and
            AI-powered guidance.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-delay-4">
            <Link href="/login">
              <Button
                size="lg"
                className="bg-lantern text-void hover:bg-lantern/90 font-medium px-8 h-12 rounded-xl text-base group"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <span className="text-moon-faint text-sm">No credit card required</span>
          </div>
        </section>

        {/* Methodology Visual */}
        <section className="max-w-6xl mx-auto px-6 lg:px-8 pb-24">
          <div className="relative bg-night/80 border border-night-mist rounded-2xl p-8 lg:p-12 animate-fade-in-delay-5">
            {/* Subtle inner glow */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-lantern/[0.02] to-transparent pointer-events-none" />

            <div className="relative">
              <h2 className="text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-moon-faint mb-8 text-center">
                The 1/5/10 Methodology
              </h2>

              {/* Cascade visualization */}
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-4 w-full max-w-md">
                  <div className="w-2 h-2 rounded-full flex-shrink-0 bg-lantern" />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-moon">10-Year Dream</span>
                    <span className="text-moon-faint text-sm ml-2">— Your ultimate vision</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 w-full max-w-md pl-4">
                  <div className="w-2 h-2 rounded-full flex-shrink-0 bg-lantern" />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-moon">5-Year Goal</span>
                    <span className="text-moon-faint text-sm ml-2">— Major milestones</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 w-full max-w-md pl-8">
                  <div className="w-2 h-2 rounded-full flex-shrink-0 bg-moon-soft" />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-moon">1-Year Goal</span>
                    <span className="text-moon-faint text-sm ml-2">— Annual objectives</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 w-full max-w-md pl-12">
                  <div className="w-2 h-2 rounded-full flex-shrink-0 bg-moon-soft" />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-moon">Monthly Goal</span>
                    <span className="text-moon-faint text-sm ml-2">— Monthly targets</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 w-full max-w-md pl-16">
                  <div className="w-2 h-2 rounded-full flex-shrink-0 bg-moon-dim" />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-moon">Weekly Goal</span>
                    <span className="text-moon-faint text-sm ml-2">— Weekly focus</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 w-full max-w-md pl-20">
                  <div className="w-2 h-2 rounded-full flex-shrink-0 bg-zen-green" />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-moon">Daily Task</span>
                    <span className="text-moon-faint text-sm ml-2">— Actionable items</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="border-t border-night-mist/50 bg-night/30 py-24 lg:py-32">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <h2 className="text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-moon-faint mb-4 text-center animate-fade-in-delay-1">
              Features
            </h2>
            <p className="text-2xl lg:text-3xl font-light text-center mb-16 animate-fade-in-delay-2">
              Everything you need to achieve your dreams
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="group relative bg-night border border-night-mist rounded-2xl p-8 transition-all duration-300 hover:border-lantern/30 animate-fade-in-delay-3">
                <div className="absolute inset-0 rounded-2xl bg-lantern/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-night-soft flex items-center justify-center mb-6 group-hover:bg-lantern-soft transition-colors duration-300">
                    <Layers className="w-6 h-6 text-moon-dim group-hover:text-lantern transition-colors duration-300" />
                  </div>
                  <h3 className="text-lg font-medium mb-3">Goal Hierarchy</h3>
                  <p className="text-moon-dim leading-relaxed">
                    Break down your 10-year dreams into 5-year, 1-year, monthly, weekly goals and daily tasks.
                  </p>
                </div>
              </div>

              <div className="group relative bg-night border border-night-mist rounded-2xl p-8 transition-all duration-300 hover:border-lantern/30 animate-fade-in-delay-4">
                <div className="absolute inset-0 rounded-2xl bg-lantern/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-night-soft flex items-center justify-center mb-6 group-hover:bg-lantern-soft transition-colors duration-300">
                    <Trophy className="w-6 h-6 text-moon-dim group-hover:text-lantern transition-colors duration-300" />
                  </div>
                  <h3 className="text-lg font-medium mb-3">Gamification</h3>
                  <p className="text-moon-dim leading-relaxed">
                    Earn points, maintain streaks, unlock badges, and level up as you complete your goals.
                  </p>
                </div>
              </div>

              <div className="group relative bg-night border border-night-mist rounded-2xl p-8 transition-all duration-300 hover:border-lantern/30 animate-fade-in-delay-5">
                <div className="absolute inset-0 rounded-2xl bg-lantern/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-night-soft flex items-center justify-center mb-6 group-hover:bg-lantern-soft transition-colors duration-300">
                    <Sparkles className="w-6 h-6 text-moon-dim group-hover:text-lantern transition-colors duration-300" />
                  </div>
                  <h3 className="text-lg font-medium mb-3">AI Assistance</h3>
                  <p className="text-moon-dim leading-relaxed">
                    Get help sharpening vague goals into SMART format and generating actionable daily tasks.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MIT Section */}
        <section className="py-24 lg:py-32">
          <div className="max-w-6xl mx-auto px-6 lg:px-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-lantern-soft mb-8 animate-fade-in-delay-1">
              <Target className="w-8 h-8 text-lantern" />
            </div>
            <h2 className="text-2xl lg:text-3xl font-light mb-6 animate-fade-in-delay-2">
              Focus on what matters most
            </h2>
            <p className="text-moon-soft text-lg max-w-2xl mx-auto leading-relaxed mb-10 animate-fade-in-delay-3">
              Each day, identify your Most Important Task (MIT) — the single action
              that will have the biggest impact. Complete it first, earn maximum points,
              and build unstoppable momentum.
            </p>
            <Link href="/login" className="animate-fade-in-delay-4 inline-block">
              <Button
                variant="outline"
                size="lg"
                className="border-night-mist bg-night-soft text-moon hover:border-lantern hover:text-lantern hover:bg-lantern-mist rounded-xl px-8"
              >
                Start Your Journey
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-night-mist/50 py-12">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-moon-faint text-sm">
            Based on MJ DeMarco&apos;s 1/5/10 methodology
          </span>
          <Link href="/" className="text-moon-faint text-sm tracking-wider">
            goalix<span className="text-lantern">.</span>
          </Link>
        </div>
      </footer>
    </div>
  );
}
