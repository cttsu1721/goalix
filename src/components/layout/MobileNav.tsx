"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { CheckCircle, Star, TrendingUp, Settings } from "lucide-react";

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
    href: "/goals?view=dreams",
    label: "Dreams",
    icon: Star,
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

export function MobileNav({ className }: MobileNavProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-night border-t border-night-mist",
        "px-8 py-4",
        className
      )}
    >
      <div className="flex justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1.5",
                "text-[0.625rem] font-normal tracking-wide",
                "transition-colors",
                active ? "text-lantern" : "text-moon-faint"
              )}
            >
              <Icon className="w-[22px] h-[22px]" strokeWidth={1.5} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
