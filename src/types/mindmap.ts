import type { GoalCategory, GoalStatus } from "@prisma/client";
import type { Node, Edge } from "reactflow";

export type MindMapLevel =
  | "dream"
  | "fiveYear"
  | "oneYear"
  | "monthly"
  | "weekly"
  | "task";

export interface HierarchyNode {
  id: string;
  title: string;
  level: MindMapLevel;
  category: GoalCategory;
  status: GoalStatus;
  progress: number;
  childrenCount: number;
  completedCount: number;
  parentId: string | null;
  children?: HierarchyNode[];
}

export interface HierarchyResponse {
  dreams: HierarchyNode[];
  stats: {
    totalDreams: number;
    totalGoals: number;
    totalTasks: number;
  };
}

export interface MindMapNodeData extends HierarchyNode {
  isCollapsed: boolean;
  depth: number;
  onToggleCollapse?: () => void;
  onClick?: () => void;
}

export type MindMapNode = Node<MindMapNodeData>;
export type MindMapEdge = Edge;

export interface UseGoalHierarchyOptions {
  dreamId?: string;
  includeTasks?: boolean;
  status?: GoalStatus;
}
