import { useState, useCallback, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { GoalCategory } from "@prisma/client";
import type { VisionBuilderResponse } from "@/lib/ai";

interface GenerateHierarchyInput {
  idea: string;
  category: GoalCategory;
}

interface GenerateHierarchyResponse {
  success: boolean;
  data: VisionBuilderResponse;
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
  hierarchy: VisionBuilderResponse;
}

interface CreateCascadeResponse {
  success: boolean;
  data: {
    visionId: string;
    visionTitle: string;
    totalCreated: number;
    hierarchy: unknown;
  };
}

export type VisionBuilderStep = "input" | "preview" | "creating" | "success";

// Path to a specific goal in the hierarchy
export type GoalPath =
  | { type: "vision" }
  | { type: "threeYear"; index: number }
  | { type: "oneYear"; threeYearIndex: number; oneYearIndex: number }
  | { type: "monthly"; threeYearIndex: number; oneYearIndex: number }
  | { type: "weekly"; threeYearIndex: number; oneYearIndex: number };

export function useVisionBuilder() {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<VisionBuilderStep>("input");
  const [idea, setIdea] = useState("");
  const [category, setCategory] = useState<GoalCategory | "">("");
  const [hierarchy, setHierarchy] = useState<VisionBuilderResponse | null>(null);
  const [createdVisionId, setCreatedVisionId] = useState<string | null>(null);

  // Refs to store mutation reset functions for stable callbacks
  const generateMutationResetRef = useRef<() => void>(() => {});
  const createMutationResetRef = useRef<() => void>(() => {});

  // Generate hierarchy from AI
  const generateMutation = useMutation({
    mutationFn: async (input: GenerateHierarchyInput): Promise<GenerateHierarchyResponse> => {
      const res = await fetch("/api/ai/vision-builder", {
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
      setCreatedVisionId(response.data.visionId);
      setStep("success");
      // Invalidate all goal-related queries
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["user", "stats"] });
    },
  });

  // Keep refs updated with mutation reset functions (must be in useEffect, not during render)
  useEffect(() => {
    generateMutationResetRef.current = generateMutation.reset;
    createMutationResetRef.current = createMutation.reset;
  }, [generateMutation.reset, createMutation.reset]);

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

        const newHierarchy = JSON.parse(JSON.stringify(prev)) as VisionBuilderResponse;

        switch (path.type) {
          case "vision":
            if (updates.title !== undefined) newHierarchy.vision.title = updates.title;
            if (updates.description !== undefined) newHierarchy.vision.description = updates.description;
            break;

          case "threeYear":
            const threeYear = newHierarchy.threeYearGoals[path.index];
            if (threeYear) {
              if (updates.title !== undefined) threeYear.title = updates.title;
              if (updates.description !== undefined) threeYear.description = updates.description;
            }
            break;

          case "oneYear":
            const oy = newHierarchy.threeYearGoals[path.threeYearIndex]?.oneYearGoals[path.oneYearIndex];
            if (oy) {
              if (updates.title !== undefined) oy.title = updates.title;
              if (updates.description !== undefined) oy.description = updates.description;
            }
            break;

          case "monthly":
            const mg = newHierarchy.threeYearGoals[path.threeYearIndex]?.oneYearGoals[path.oneYearIndex]?.monthlyGoal;
            if (mg) {
              if (updates.title !== undefined) mg.title = updates.title;
              if (updates.description !== undefined) mg.description = updates.description;
            }
            break;

          case "weekly":
            const wg = newHierarchy.threeYearGoals[path.threeYearIndex]?.oneYearGoals[path.oneYearIndex]?.monthlyGoal?.weeklyGoal;
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

  // Remove a 3-year goal branch
  const removeThreeYearGoal = useCallback(
    (index: number) => {
      if (!hierarchy) return;

      setHierarchy((prev) => {
        if (!prev) return prev;
        if (prev.threeYearGoals.length <= 1) return prev; // Keep at least one

        const newHierarchy = JSON.parse(JSON.stringify(prev)) as VisionBuilderResponse;
        newHierarchy.threeYearGoals.splice(index, 1);
        return newHierarchy;
      });
    },
    [hierarchy]
  );

  // Remove a 1-year goal branch
  const removeOneYearGoal = useCallback(
    (threeYearIndex: number, oneYearIndex: number) => {
      if (!hierarchy) return;

      setHierarchy((prev) => {
        if (!prev) return prev;
        const threeYear = prev.threeYearGoals[threeYearIndex];
        if (!threeYear || threeYear.oneYearGoals.length <= 1) return prev; // Keep at least one

        const newHierarchy = JSON.parse(JSON.stringify(prev)) as VisionBuilderResponse;
        newHierarchy.threeYearGoals[threeYearIndex].oneYearGoals.splice(oneYearIndex, 1);
        return newHierarchy;
      });
    },
    [hierarchy]
  );

  // Reset to start over (uses refs to avoid unstable dependencies)
  const reset = useCallback(() => {
    setStep("input");
    setIdea("");
    setCategory("");
    setHierarchy(null);
    setCreatedVisionId(null);
    generateMutationResetRef.current();
    createMutationResetRef.current();
  }, []);

  // Go back to input step
  const goBackToInput = useCallback(() => {
    setStep("input");
  }, []);

  // Calculate total goals in current hierarchy
  const getTotalGoals = useCallback(() => {
    if (!hierarchy) return 0;
    let total = 1; // Vision
    hierarchy.threeYearGoals.forEach((ty) => {
      total += 1; // 3-year
      ty.oneYearGoals.forEach(() => {
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
    createdVisionId,

    // Actions
    generateHierarchy,
    createAllGoals,
    updateGoal,
    removeThreeYearGoal,
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

// Backward compatibility aliases
export type DreamBuilderStep = VisionBuilderStep;
export const useDreamBuilder = useVisionBuilder;
