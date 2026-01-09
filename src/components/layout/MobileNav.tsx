"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  Star,
  Target,
  TrendingUp,
  MoreHorizontal,
  Calendar,
  CalendarCheck,
  CalendarDays,
  Settings,
  X,
} from "lucide-react";

interface MobileNavProps {
  className?: string;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

// Main 4 nav items (always visible)
const mainNavItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Today",
    icon: CheckCircle,
  },
  {
    href: "/goals?view=vision",
    label: "Vision",
    icon: Star,
  },
  {
    href: "/goals?view=goals",
    label: "Goals",
    icon: Target,
  },
  {
    href: "/progress",
    label: "Stats",
    icon: TrendingUp,
  },
];

// Overflow items (in More menu)
const moreNavItems: NavItem[] = [
  {
    href: "/week",
    label: "This Week",
    icon: Calendar,
  },
  {
    href: "/review/weekly",
    label: "Weekly Review",
    icon: CalendarCheck,
  },
  {
    href: "/review/monthly",
    label: "Monthly Review",
    icon: CalendarDays,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
  },
];

function MobileNavContent({ className }: MobileNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showMore, setShowMore] = useState(false);

  const isActive = (href: string) => {
    const [hrefPath, hrefQuery] = href.split("?");

    if (href === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/";
    }

    // Special handling for /goals with view param
    if (hrefPath === "/goals" && pathname === "/goals") {
      const hrefParams = new URLSearchParams(hrefQuery || "");
      const hrefView = hrefParams.get("view");
      const currentView = searchParams.get("view");

      // Vision tab active ONLY when view=vision
      if (hrefView === "vision") {
        return currentView === "vision";
      }
      // Goals tab active when view=goals or any other view (default)
      if (hrefView === "goals") {
        return currentView !== "vision";
      }
    }

    return pathname.startsWith(hrefPath);
  };

  // Check if any "more" item is active
  const isMoreActive = moreNavItems.some((item) => isActive(item.href));

  return (
    <>
      {/* More Menu Overlay */}
      {showMore && (
        <div
          className="fixed inset-0 z-40 bg-void/80 backdrop-blur-sm"
          onClick={() => setShowMore(false)}
        />
      )}

      {/* More Menu Panel */}
      <div
        className={cn(
          "fixed bottom-[60px] left-0 right-0 z-50",
          "bg-night border-t border-night-mist",
          "transform transition-transform duration-200 ease-out",
          "pb-[env(safe-area-inset-bottom,0px)]",
          showMore ? "translate-y-0" : "translate-y-full pointer-events-none"
        )}
      >
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-moon-faint uppercase tracking-wider">
              More Options
            </span>
            <button
              onClick={() => setShowMore(false)}
              className="p-1.5 rounded-lg text-moon-faint hover:text-moon hover:bg-night-soft"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {moreNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  onClick={() => setShowMore(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl",
                    "text-sm font-medium transition-all duration-200",
                    active
                      ? "text-lantern bg-lantern/10"
                      : "text-moon-dim hover:text-moon hover:bg-night-soft"
                  )}
                >
                  <Icon
                    className={cn("w-5 h-5", active && "text-lantern")}
                    strokeWidth={active ? 2 : 1.5}
                  />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Bottom Nav */}
      <nav
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50",
          "bg-night/95 backdrop-blur-lg border-t border-night-mist",
          "pb-[env(safe-area-inset-bottom,0px)]",
          className
        )}
      >
        <div className="flex justify-around items-center px-1 py-1">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className={cn(
                  "flex flex-col items-center justify-center",
                  "min-w-[64px] min-h-[52px] py-2 px-2",
                  "rounded-xl",
                  "text-[0.625rem] font-medium tracking-wide",
                  "transition-all duration-200 active:scale-95",
                  active
                    ? "text-lantern bg-lantern/10"
                    : "text-moon-faint active:text-moon active:bg-night-soft"
                )}
              >
                <Icon
                  className={cn(
                    "w-[22px] h-[22px] mb-0.5",
                    active && "drop-shadow-[0_0_8px_rgba(232,168,87,0.4)]"
                  )}
                  strokeWidth={active ? 2 : 1.5}
                />
                <span className={cn(active && "font-semibold")}>{item.label}</span>
              </Link>
            );
          })}

          {/* More Button */}
          <button
            onClick={() => setShowMore(!showMore)}
            className={cn(
              "flex flex-col items-center justify-center",
              "min-w-[64px] min-h-[52px] py-2 px-2",
              "rounded-xl",
              "text-[0.625rem] font-medium tracking-wide",
              "transition-all duration-200 active:scale-95",
              showMore || isMoreActive
                ? "text-lantern bg-lantern/10"
                : "text-moon-faint active:text-moon active:bg-night-soft"
            )}
          >
            <MoreHorizontal
              className={cn(
                "w-[22px] h-[22px] mb-0.5",
                (showMore || isMoreActive) && "drop-shadow-[0_0_8px_rgba(232,168,87,0.4)]"
              )}
              strokeWidth={showMore || isMoreActive ? 2 : 1.5}
            />
            <span className={cn((showMore || isMoreActive) && "font-semibold")}>More</span>
          </button>
        </div>
      </nav>
    </>
  );
}

export function MobileNav({ className }: MobileNavProps) {
  return (
    <Suspense fallback={<MobileNavFallback className={className} />}>
      <MobileNavContent className={className} />
    </Suspense>
  );
}

function MobileNavFallback({ className }: MobileNavProps) {
  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-night/95 backdrop-blur-lg border-t border-night-mist",
        "pb-[env(safe-area-inset-bottom,0px)]",
        className
      )}
    >
      <div className="flex justify-around items-center px-1 py-1">
        {[...mainNavItems, { href: "#more", label: "More", icon: MoreHorizontal }].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.href}
              className="flex flex-col items-center justify-center min-w-[64px] min-h-[52px] py-2 px-2 text-moon-faint"
            >
              <Icon className="w-[22px] h-[22px] mb-0.5" strokeWidth={1.5} />
              <span className="text-[0.625rem] font-medium tracking-wide">{item.label}</span>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
