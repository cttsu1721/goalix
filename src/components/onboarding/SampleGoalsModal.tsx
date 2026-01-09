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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sparkles,
  Target,
  Heart,
  DollarSign,
  Users,
  Briefcase,
  Brain,
  Sun,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SampleGoalSet {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  goals: {
    vision: string;
    threeYear: string;
    oneYear: string;
    monthly: string;
    weekly: string;
  };
}

const SAMPLE_GOAL_SETS: SampleGoalSet[] = [
  {
    id: "health",
    name: "Health & Fitness",
    description: "Build sustainable fitness habits",
    icon: <Heart className="w-5 h-5" />,
    category: "HEALTH",
    goals: {
      vision: "Maintain excellent physical health and energy into my 70s",
      threeYear: "Complete a half-marathon and maintain 15% body fat",
      oneYear: "Run a 10K race and establish consistent gym routine",
      monthly: "Run 50km total and hit the gym 12+ times",
      weekly: "Run 3x and complete 2 strength training sessions",
    },
  },
  {
    id: "wealth",
    name: "Financial Freedom",
    description: "Build wealth and financial security",
    icon: <DollarSign className="w-5 h-5" />,
    category: "WEALTH",
    goals: {
      vision: "Achieve complete financial independence with $2M net worth",
      threeYear: "Save $200K and have 3 income streams",
      oneYear: "Save $50K emergency fund and start investing monthly",
      monthly: "Save 30% of income and invest in index funds",
      weekly: "Track expenses and review budget every Sunday",
    },
  },
  {
    id: "relationships",
    name: "Meaningful Relationships",
    description: "Deepen connections with loved ones",
    icon: <Users className="w-5 h-5" />,
    category: "RELATIONSHIPS",
    goals: {
      vision: "Have deep, meaningful relationships with family and close friends",
      threeYear: "Host quarterly family gatherings and maintain 5 close friendships",
      oneYear: "Schedule monthly catch-ups with each close friend",
      monthly: "Have 4 meaningful conversations with loved ones",
      weekly: "Call one friend and plan one family activity",
    },
  },
  {
    id: "career",
    name: "Career Growth",
    description: "Advance your professional life",
    icon: <Briefcase className="w-5 h-5" />,
    category: "CAREER",
    goals: {
      vision: "Become a recognized expert in my field with leadership impact",
      threeYear: "Get promoted to senior role and mentor 3 junior colleagues",
      oneYear: "Complete professional certification and lead a major project",
      monthly: "Complete 1 course module and present at team meeting",
      weekly: "Dedicate 5 hours to skill development",
    },
  },
  {
    id: "growth",
    name: "Personal Growth",
    description: "Continuous learning and development",
    icon: <Brain className="w-5 h-5" />,
    category: "PERSONAL_GROWTH",
    goals: {
      vision: "Become a lifelong learner with wisdom to share",
      threeYear: "Read 100 books and learn 2 new skills",
      oneYear: "Read 24 books and start learning a new language",
      monthly: "Finish 2 books and practice language 20 times",
      weekly: "Read 1 hour daily and do 3 language sessions",
    },
  },
  {
    id: "lifestyle",
    name: "Balanced Lifestyle",
    description: "Create work-life harmony",
    icon: <Sun className="w-5 h-5" />,
    category: "LIFESTYLE",
    goals: {
      vision: "Live a balanced, fulfilling life with time for what matters",
      threeYear: "Work 4-day weeks and take 6 weeks vacation annually",
      oneYear: "Establish morning routine and take 4 weeks off",
      monthly: "Maintain 6:30am wake time and take 1 long weekend",
      weekly: "Sleep 7+ hours nightly and have screen-free evenings",
    },
  },
];

interface SampleGoalsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (selectedSets: SampleGoalSet[]) => Promise<void>;
}

export function SampleGoalsModal({
  open,
  onOpenChange,
  onImport,
}: SampleGoalsModalProps) {
  const [selectedSets, setSelectedSets] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  const handleToggle = (id: string) => {
    setSelectedSets((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleImport = async () => {
    if (selectedSets.length === 0) return;

    setIsImporting(true);
    try {
      const setsToImport = SAMPLE_GOAL_SETS.filter((s) =>
        selectedSets.includes(s.id)
      );
      await onImport(setsToImport);
      onOpenChange(false);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-night border-night-mist max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-moon">
            <Sparkles className="w-5 h-5 text-lantern" />
            Try With Sample Goals
          </DialogTitle>
          <DialogDescription className="text-moon-dim">
            Get started quickly with pre-built goal hierarchies. You can
            customize them later.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-2 -mr-2">
          {SAMPLE_GOAL_SETS.map((set) => (
            <div
              key={set.id}
              onClick={() => handleToggle(set.id)}
              className={cn(
                "flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all",
                "border",
                selectedSets.includes(set.id)
                  ? "bg-lantern/10 border-lantern/30"
                  : "bg-night-soft border-night-mist hover:border-night-glow"
              )}
            >
              <Checkbox
                checked={selectedSets.includes(set.id)}
                className="mt-0.5"
              />
              <div
                className={cn(
                  "p-2 rounded-lg",
                  selectedSets.includes(set.id)
                    ? "bg-lantern/20"
                    : "bg-night"
                )}
              >
                {set.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium text-moon">{set.name}</h4>
                </div>
                <p className="text-xs text-moon-dim mb-2">{set.description}</p>
                {/* Preview */}
                <div className="text-xs text-moon-faint space-y-0.5">
                  <p className="truncate">
                    <Target className="w-3 h-3 inline mr-1 text-zen-purple" />
                    <span className="text-moon-dim">Vision:</span>{" "}
                    {set.goals.vision}
                  </p>
                  <p className="truncate">
                    <Target className="w-3 h-3 inline mr-1 text-lantern" />
                    <span className="text-moon-dim">1-Year:</span>{" "}
                    {set.goals.oneYear}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-night-mist">
          <p className="text-xs text-moon-faint">
            {selectedSets.length} of {SAMPLE_GOAL_SETS.length} selected
          </p>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-moon-dim hover:text-moon"
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={selectedSets.length === 0 || isImporting}
              className="bg-lantern text-void hover:bg-lantern/90"
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Import Goals
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { SAMPLE_GOAL_SETS };
export type { SampleGoalSet };
