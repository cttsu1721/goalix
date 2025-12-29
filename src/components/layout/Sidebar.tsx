"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  Calendar,
  Clock,
  Star,
  Target,
  TrendingUp,
} from "lucide-react";
import { AiUsageIndicator } from "@/components/ai";

interface SidebarProps {
  className?: string;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  count?: number;
}

interface NavGroup {
  label?: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    items: [
      {
        href: "/dashboard",
        label: "Today",
        icon: <CheckCircle className="w-5 h-5" />,
        count: 6,
      },
      {
        href: "/week",
        label: "Week",
        icon: <Calendar className="w-5 h-5" />,
      },
      {
        href: "/upcoming",
        label: "Upcoming",
        icon: <Clock className="w-5 h-5" />,
      },
    ],
  },
  {
    label: "Vision",
    items: [
      {
        href: "/goals?view=dreams",
        label: "Dreams",
        icon: <Star className="w-5 h-5" />,
      },
      {
        href: "/goals",
        label: "Goals",
        icon: <Target className="w-5 h-5" />,
      },
    ],
  },
  {
    label: "Reflect",
    items: [
      {
        href: "/progress",
        label: "Progress",
        icon: <TrendingUp className="w-5 h-5" />,
      },
    ],
  },
];

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/";
    }
    return pathname.startsWith(href.split("?")[0]);
  };

  return (
    <aside
      className={cn(
        "bg-night border-r border-night-mist flex-col py-10",
        className
      )}
    >
      {/* Logo */}
      <div className="px-7 pb-10">
        <Link href="/dashboard" className="text-moon text-[1.375rem] font-medium tracking-wider">
          goalix<span className="text-lantern font-light">.</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4">
        {navGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-10">
            {group.label && (
              <div className="px-4 mb-4 text-[0.625rem] font-medium uppercase tracking-[0.2em] text-moon-faint">
                {group.label}
              </div>
            )}
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3.5 px-4 py-3.5 rounded-xl mb-1",
                  "text-sm font-normal transition-all duration-300",
                  isActive(item.href)
                    ? "bg-lantern-soft text-lantern"
                    : "text-moon-dim hover:bg-night-soft hover:text-moon-soft",
                  "[&_svg]:opacity-70",
                  isActive(item.href) && "[&_svg]:opacity-100"
                )}
              >
                {item.icon}
                {item.label}
                {item.count !== undefined && (
                  <span
                    className={cn(
                      "ml-auto text-xs font-medium",
                      isActive(item.href) ? "text-lantern" : "text-moon-faint"
                    )}
                  >
                    {item.count}
                  </span>
                )}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* AI Usage */}
      <div className="px-4 mb-6">
        <AiUsageIndicator />
      </div>

      {/* User Section */}
      <div className="px-7 mt-auto">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3.5 transition-colors",
            pathname === "/settings"
              ? "text-lantern"
              : "text-moon-soft hover:text-moon"
          )}
        >
          <div className="w-11 h-11 bg-night-mist rounded-xl flex items-center justify-center font-medium text-sm text-moon-soft">
            JD
          </div>
          <div>
            <h4 className="text-sm font-medium mb-0.5">John Doe</h4>
            <span className="text-xs text-moon-faint">Level 4</span>
          </div>
        </Link>
      </div>
    </aside>
  );
}
