"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Heart,
  DollarSign,
  Briefcase,
  Brain,
  Sparkles,
  Dumbbell,
  Loader2,
  Check,
} from "lucide-react";
import {
  KAIZEN_AREAS,
  KAIZEN_AREA_CONFIG,
  type KaizenArea,
  type KaizenCheckinInput,
} from "@/types/kaizen";

interface KaizenCheckinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingCheckin?: KaizenCheckinInput | null;
  onComplete?: (data: { pointsEarned: number; isBalancedDay: boolean }) => void;
}

// Map area names to Lucide icons
const AREA_ICONS: Record<KaizenArea, React.ElementType> = {
  health: Dumbbell,
  relationships: Heart,
  wealth: DollarSign,
  career: Briefcase,
  personalGrowth: Brain,
  lifestyle: Sparkles,
};

// Map area names to colors
const AREA_COLORS: Record<KaizenArea, string> = {
  health: "bg-emerald-500/20 border-emerald-500/30 text-emerald-400",
  relationships: "bg-rose-500/20 border-rose-500/30 text-rose-400",
  wealth: "bg-amber-500/20 border-amber-500/30 text-amber-400",
  career: "bg-blue-500/20 border-blue-500/30 text-blue-400",
  personalGrowth: "bg-violet-500/20 border-violet-500/30 text-violet-400",
  lifestyle: "bg-cyan-500/20 border-cyan-500/30 text-cyan-400",
};

const AREA_COLORS_ACTIVE: Record<KaizenArea, string> = {
  health: "bg-emerald-500 border-emerald-500 text-white",
  relationships: "bg-rose-500 border-rose-500 text-white",
  wealth: "bg-amber-500 border-amber-500 text-white",
  career: "bg-blue-500 border-blue-500 text-white",
  personalGrowth: "bg-violet-500 border-violet-500 text-white",
  lifestyle: "bg-cyan-500 border-cyan-500 text-white",
};

export function KaizenCheckinDialog({
  open,
  onOpenChange,
  existingCheckin,
  onComplete,
}: KaizenCheckinDialogProps) {
  const [checkin, setCheckin] = useState<KaizenCheckinInput>({
    health: existingCheckin?.health ?? false,
    relationships: existingCheckin?.relationships ?? false,
    wealth: existingCheckin?.wealth ?? false,
    career: existingCheckin?.career ?? false,
    personalGrowth: existingCheckin?.personalGrowth ?? false,
    lifestyle: existingCheckin?.lifestyle ?? false,
    notes: existingCheckin?.notes ?? "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkedCount = KAIZEN_AREAS.filter((area) => checkin[area]).length;
  const isBalanced = checkedCount === 6;

  const toggleArea = (area: KaizenArea) => {
    setCheckin((prev) => ({ ...prev, [area]: !prev[area] }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/kaizen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checkin),
      });

      if (!response.ok) {
        throw new Error("Failed to save check-in");
      }

      const data = await response.json();
      onComplete?.(data);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-night border-night-mist max-w-md">
        <DialogHeader>
          <DialogTitle className="text-moon flex items-center gap-2">
            <span className="text-2xl">🌱</span>
            Daily Kaizen
          </DialogTitle>
          <DialogDescription className="text-moon-dim">
            Did you improve today? Reflect on your progress.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Area toggles */}
          <div className="grid grid-cols-2 gap-3">
            {KAIZEN_AREAS.map((area) => {
              const Icon = AREA_ICONS[area];
              const config = KAIZEN_AREA_CONFIG[area];
              const isActive = checkin[area];

              return (
                <button
                  key={area}
                  onClick={() => toggleArea(area)}
                  className={`
                    relative flex items-center gap-3 p-3 rounded-xl border transition-all duration-200
                    ${isActive ? AREA_COLORS_ACTIVE[area] : AREA_COLORS[area]}
                    hover:scale-[1.02] active:scale-[0.98]
                  `}
                >
                  <div
                    className={`
                    w-8 h-8 rounded-lg flex items-center justify-center
                    ${isActive ? "bg-white/20" : "bg-white/10"}
                  `}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-left flex-1">
                    {config.label}
                  </span>
                  {isActive && (
                    <Check className="w-4 h-4 absolute top-2 right-2" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Notes textarea */}
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider text-moon-faint">
              Notes (optional)
            </label>
            <textarea
              value={checkin.notes}
              onChange={(e) =>
                setCheckin((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder="What did you accomplish today?"
              className="w-full h-20 px-3 py-2 bg-night-soft border border-night-mist rounded-xl text-moon placeholder:text-moon-faint text-sm resize-none focus:border-lantern focus:ring-1 focus:ring-lantern/20 outline-none"
            />
          </div>

          {/* Points preview */}
          <div className="flex items-center justify-between p-3 bg-night-soft rounded-xl border border-night-mist">
            <div>
              <p className="text-sm text-moon-dim">Points earned</p>
              <p className="text-lg font-semibold text-lantern">
                +{isBalanced ? 35 : 10} pts
              </p>
            </div>
            {isBalanced && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-lantern/20 rounded-lg">
                <Sparkles className="w-4 h-4 text-lantern" />
                <span className="text-sm font-medium text-lantern">
                  Balanced Day!
                </span>
              </div>
            )}
            {!isBalanced && checkedCount > 0 && (
              <p className="text-sm text-moon-faint">
                {checkedCount}/6 areas improved
              </p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-zen-red-soft border border-zen-red/30 rounded-xl">
              <p className="text-sm text-zen-red">{error}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            variant="outline"
            onClick={handleSkip}
            className="flex-1 border-night-mist bg-night-soft text-moon hover:bg-night-mist rounded-xl"
          >
            Skip
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || checkedCount === 0}
            className="flex-1 bg-lantern text-void hover:bg-lantern/90 rounded-xl disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Reflection"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
