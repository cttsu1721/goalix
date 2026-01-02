"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle, CalendarRange, Star, Target, TrendingUp, Settings } from "lucide-react";

interface MobileNavProps {
  className?: string;
}

const navItems = [
  {
    href: "/dashboard",
    label: "Today",
    icon: CheckCircle,
  },
  {
    href: "/month",
    label: "Month",
    icon: CalendarRange,
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
    label: "Progress",
    icon: TrendingUp,
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

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-night/95 backdrop-blur-lg border-t border-night-mist",
        // Safe area padding for devices with home indicators
        "pb-[env(safe-area-inset-bottom,0px)]",
        className
      )}
    >
      <div className="flex justify-around items-center px-1 py-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                // Minimum 44px touch target - slightly smaller for 5 items
                "flex flex-col items-center justify-center",
                "min-w-[56px] min-h-[52px] py-2 px-2",
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
      </div>
    </nav>
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
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.href}
              className="flex flex-col items-center justify-center min-w-[56px] min-h-[52px] py-2 px-2 text-moon-faint"
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
