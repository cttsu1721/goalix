import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { GoalCategory } from "@prisma/client";
import type { DreamBuilderResponse, DreamBuilderFiveYearGoal, DreamBuilderOneYearGoal } from "@/lib/ai";

interface GenerateHierarchyInput {
  idea: string;
  category: GoalCategory;
}

interface GenerateHierarchyResponse {
  success: boolean;
  data: DreamBuilderResponse;
  meta: {
    totalGoals: number;
    category: GoalCategory;
  };
  usage: {
    remaining: number;
    limit: number;
  };
}

interface CreateCascadeInput {
  category: GoalCategory;
  hierarchy: DreamBuilderResponse;
}

interface CreateCascadeResponse {
  success: boolean;
  data: {
    dreamId: string;
    dreamTitle: string;
    totalCreated: number;
    hierarchy: unknown;
  };
}

export type DreamBuilderStep = "input" | "preview" | "creating" | "success";

// Path to a specific goal in the hierarchy
export type GoalPath =
  | { type: "dream" }
  | { type: "fiveYear"; index: number }
  | { type: "oneYear"; fiveYearIndex: number; oneYearIndex: number }
  | { type: "monthly"; fiveYearIndex: number; oneYearIndex: number }
  | { type: "weekly"; fiveYearIndex: number; oneYearIndex: number };

export function useDreamBuilder() {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<DreamBuilderStep>("input");
  const [idea, setIdea] = useState("");
  const [category, setCategory] = useState<GoalCategory | "">("");
  const [hierarchy, setHierarchy] = useState<DreamBuilderResponse | null>(null);
  const [createdDreamId, setCreatedDreamId] = useState<string | null>(null);

  // Generate hierarchy from AI
  const generateMutation = useMutation({
    mutationFn: async (input: GenerateHierarchyInput): Promise<GenerateHierarchyResponse> => {
      const res = await fetch("/api/ai/dream-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to generate hierarchy");
      }
      return res.json();
    },
    onSuccess: (response) => {
      setHierarchy(response.data);
      setStep("preview");
    },
  });

  // Create all goals in cascade
  const createMutation = useMutation({
    mutationFn: async (input: CreateCascadeInput): Promise<CreateCascadeResponse> => {
      const res = await fetch("/api/goals/cascade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create goals");
      }
      return res.json();
    },
    onSuccess: (response) => {
      setCreatedDreamId(response.data.dreamId);
      setStep("success");
      // Invalidate all goal-related queries
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["user", "stats"] });
    },
  });

  // Generate hierarchy
  const generateHierarchy = useCallback(() => {
    if (!idea.trim() || !category) return;
    generateMutation.mutate({ idea: idea.trim(), category: category as GoalCategory });
  }, [idea, category, generateMutation]);

  // Create all goals
  const createAllGoals = useCallback(() => {
    if (!hierarchy || !category) return;
    setStep("creating");
    createMutation.mutate({ category: category as GoalCategory, hierarchy });
  }, [hierarchy, category, createMutation]);

  // Update a goal in the hierarchy
  const updateGoal = useCallback(
    (path: GoalPath, updates: { title?: string; description?: string }) => {
      if (!hierarchy) return;

      setHierarchy((prev) => {
        if (!prev) return prev;

        const newHierarchy = JSON.parse(JSON.stringify(prev)) as DreamBuilderResponse;

        switch (path.type) {
          case "dream":
            if (updates.title !== undefined) newHierarchy.dream.title = updates.title;
            if (updates.description !== undefined) newHierarchy.dream.description = updates.description;
            break;

          case "fiveYear":
            const fiveYear = newHierarchy.fiveYearGoals[path.index];
            if (fiveYear) {
              if (updates.title !== undefined) fiveYear.title = updates.title;
              if (updates.description !== undefined) fiveYear.description = updates.description;
            }
            break;

          case "oneYear":
            const oy = newHierarchy.fiveYearGoals[path.fiveYearIndex]?.oneYearGoals[path.oneYearIndex];
            if (oy) {
              if (updates.title !== undefined) oy.title = updates.title;
              if (updates.description !== undefined) oy.description = updates.description;
            }
            break;

          case "monthly":
            const mg = newHierarchy.fiveYearGoals[path.fiveYearIndex]?.oneYearGoals[path.oneYearIndex]?.monthlyGoal;
            if (mg) {
              if (updates.title !== undefined) mg.title = updates.title;
              if (updates.description !== undefined) mg.description = updates.description;
            }
            break;

          case "weekly":
            const wg = newHierarchy.fiveYearGoals[path.fiveYearIndex]?.oneYearGoals[path.oneYearIndex]?.monthlyGoal?.weeklyGoal;
            if (wg) {
              if (updates.title !== undefined) wg.title = updates.title;
              if (updates.description !== undefined) wg.description = updates.description;
            }
            break;
        }

        return newHierarchy;
      });
    },
    [hierarchy]
  );

  // Remove a 5-year goal branch
  const removeFiveYearGoal = useCallback(
    (index: number) => {
      if (!hierarchy) return;

      setHierarchy((prev) => {
        if (!prev) return prev;
        if (prev.fiveYearGoals.length <= 1) return prev; // Keep at least one

        const newHierarchy = JSON.parse(JSON.stringify(prev)) as DreamBuilderResponse;
        newHierarchy.fiveYearGoals.splice(index, 1);
        return newHierarchy;
      });
    },
    [hierarchy]
  );

  // Remove a 1-year goal branch
  const removeOneYearGoal = useCallback(
    (fiveYearIndex: number, oneYearIndex: number) => {
      if (!hierarchy) return;

      setHierarchy((prev) => {
        if (!prev) return prev;
        const fiveYear = prev.fiveYearGoals[fiveYearIndex];
        if (!fiveYear || fiveYear.oneYearGoals.length <= 1) return prev; // Keep at least one

        const newHierarchy = JSON.parse(JSON.stringify(prev)) as DreamBuilderResponse;
        newHierarchy.fiveYearGoals[fiveYearIndex].oneYearGoals.splice(oneYearIndex, 1);
        return newHierarchy;
      });
    },
    [hierarchy]
  );

  // Reset to start over
  const reset = useCallback(() => {
    setStep("input");
    setIdea("");
    setCategory("");
    setHierarchy(null);
    setCreatedDreamId(null);
    generateMutation.reset();
    createMutation.reset();
  }, [generateMutation, createMutation]);

  // Go back to input step
  const goBackToInput = useCallback(() => {
    setStep("input");
  }, []);

  // Calculate total goals in current hierarchy
  const getTotalGoals = useCallback(() => {
    if (!hierarchy) return 0;
    let total = 1; // Dream
    hierarchy.fiveYearGoals.forEach((fy) => {
      total += 1; // 5-year
      fy.oneYearGoals.forEach(() => {
        total += 3; // 1-year + monthly + weekly
      });
    });
    return total;
  }, [hierarchy]);

  return {
    // State
    step,
    idea,
    setIdea,
    category,
    setCategory,
    hierarchy,
    createdDreamId,

    // Actions
    generateHierarchy,
    createAllGoals,
    updateGoal,
    removeFiveYearGoal,
    removeOneYearGoal,
    reset,
    goBackToInput,

    // Computed
    getTotalGoals,

    // Mutation states
    isGenerating: generateMutation.isPending,
    isCreating: createMutation.isPending,
    generateError: generateMutation.error?.message,
    createError: createMutation.error?.message,
  };
}
