"use client";

import Link from "next/link";
import { useMemo, useCallback, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeTypes,
  ConnectionLineType,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useQuery } from "@tanstack/react-query";
import { GoalTreeNode, type GoalNodeData } from "./GoalTreeNode";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Maximize2,
  Minimize2,
  TreePine,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Node types registration
const nodeTypes: NodeTypes = {
  goalNode: GoalTreeNode,
};

// Layout constants
const LEVEL_Y_POSITIONS = {
  sevenYear: 0,
  threeYear: 180,
  oneYear: 360,
  monthly: 540,
  weekly: 720,
};

const NODE_WIDTH = {
  sevenYear: 224,
  threeYear: 208,
  oneYear: 192,
  monthly: 176,
  weekly: 160,
};

const HORIZONTAL_GAP = 40;

interface TreeNodeData {
  id: string;
  title: string;
  level: string;
  category: string;
  status: string;
  progress: number;
  parentId: string | null;
  childCount: number;
}

interface HierarchyResponse {
  success: boolean;
  nodes: TreeNodeData[];
  stats: {
    total: number;
    byLevel: Record<string, number>;
    byStatus: Record<string, number>;
  };
}

// Calculate tree layout with proper spacing
function calculateLayout(treeNodes: TreeNodeData[]): {
  nodes: Node<GoalNodeData>[];
  edges: Edge[];
} {
  const nodes: Node<GoalNodeData>[] = [];
  const edges: Edge[] = [];

  // Build parent-child map
  const childrenMap = new Map<string | null, TreeNodeData[]>();
  treeNodes.forEach((node) => {
    const parentId = node.parentId;
    if (!childrenMap.has(parentId)) {
      childrenMap.set(parentId, []);
    }
    childrenMap.get(parentId)!.push(node);
  });

  // Calculate subtree widths for proper spacing
  const subtreeWidths = new Map<string, number>();

  function calculateSubtreeWidth(nodeId: string, level: string): number {
    const children = childrenMap.get(nodeId) || [];
    const nodeWidth = NODE_WIDTH[level as keyof typeof NODE_WIDTH] || 160;

    if (children.length === 0) {
      subtreeWidths.set(nodeId, nodeWidth);
      return nodeWidth;
    }

    let totalChildWidth = 0;
    children.forEach((child) => {
      totalChildWidth += calculateSubtreeWidth(child.id, child.level);
    });
    totalChildWidth += (children.length - 1) * HORIZONTAL_GAP;

    const width = Math.max(nodeWidth, totalChildWidth);
    subtreeWidths.set(nodeId, width);
    return width;
  }

  // Calculate widths for all root nodes (visions)
  const roots = childrenMap.get(null) || [];
  roots.forEach((root) => calculateSubtreeWidth(root.id, root.level));

  // Position nodes recursively
  let currentRootX = 0;

  function positionNode(
    node: TreeNodeData,
    centerX: number
  ): void {
    const nodeWidth = NODE_WIDTH[node.level as keyof typeof NODE_WIDTH] || 160;
    const y = LEVEL_Y_POSITIONS[node.level as keyof typeof LEVEL_Y_POSITIONS] || 0;

    nodes.push({
      id: node.id,
      type: "goalNode",
      position: { x: centerX - nodeWidth / 2, y },
      data: {
        id: node.id,
        title: node.title,
        level: node.level as GoalNodeData["level"],
        category: node.category,
        status: node.status,
        progress: node.progress,
        childCount: node.childCount,
      },
    });

    // Add edge from parent
    if (node.parentId) {
      edges.push({
        id: `${node.parentId}-${node.id}`,
        source: node.parentId,
        target: node.id,
        type: "smoothstep",
        animated: node.status === "ACTIVE",
        style: {
          stroke: node.status === "COMPLETED" ? "#22c55e" : "#94a3b8",
          strokeWidth: 2,
        },
      });
    }

    // Position children
    const children = childrenMap.get(node.id) || [];
    if (children.length > 0) {
      // Calculate total width of children
      let totalChildWidth = 0;
      children.forEach((child) => {
        totalChildWidth += subtreeWidths.get(child.id) || 160;
      });
      totalChildWidth += (children.length - 1) * HORIZONTAL_GAP;

      // Start positioning from left
      let childX = centerX - totalChildWidth / 2;

      children.forEach((child) => {
        const childWidth = subtreeWidths.get(child.id) || 160;
        const childCenterX = childX + childWidth / 2;
        positionNode(child, childCenterX);
        childX += childWidth + HORIZONTAL_GAP;
      });
    }
  }

  // Position all root nodes
  roots.forEach((root) => {
    const rootWidth = subtreeWidths.get(root.id) || 224;
    positionNode(root, currentRootX + rootWidth / 2);
    currentRootX += rootWidth + HORIZONTAL_GAP * 2;
  });

  return { nodes, edges };
}

export function GoalTreeView() {
  const [showArchived, setShowArchived] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fetch hierarchy data
  const { data, isLoading, error } = useQuery<HierarchyResponse>({
    queryKey: ["goals", "hierarchy", showArchived],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (showArchived) params.set("includeArchived", "true");
      const res = await fetch(`/api/goals/hierarchy?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch hierarchy");
      return res.json();
    },
  });

  // Calculate layout from data
  const { initialNodes, initialEdges } = useMemo(() => {
    if (!data?.nodes) return { initialNodes: [], initialEdges: [] };
    const { nodes, edges } = calculateLayout(data.nodes);
    return { initialNodes: nodes, initialEdges: edges };
  }, [data]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes/edges when data changes
  useMemo(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-[600px] bg-slate-900 rounded-xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-6 w-40" />
        </div>
        <div className="flex justify-center gap-8 pt-20">
          <Skeleton className="h-24 w-56 rounded-xl" />
          <Skeleton className="h-24 w-56 rounded-xl" />
        </div>
        <div className="flex justify-center gap-6 pt-20">
          <Skeleton className="h-20 w-52 rounded-xl" />
          <Skeleton className="h-20 w-52 rounded-xl" />
          <Skeleton className="h-20 w-52 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[600px] bg-slate-900 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <TreePine className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">Failed to load goal tree</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!data?.nodes.length) {
    return (
      <div className="w-full h-[600px] bg-slate-900 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <TreePine className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-300 mb-2">No goals yet</h3>
          <p className="text-slate-500 mb-4">Create a vision to see your goal tree</p>
          <Button asChild>
            <Link href="/goals">Create Vision</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-full rounded-xl overflow-hidden border border-slate-700",
        isFullscreen ? "fixed inset-0 z-50" : "h-[700px]"
      )}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{
          type: "smoothstep",
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#334155" gap={20} size={1} />
        <Controls
          showZoom={false}
          showFitView={false}
          showInteractive={false}
          className="!bg-slate-800 !border-slate-600 !shadow-xl"
        />
        <MiniMap
          nodeColor={(node) => {
            const level = (node.data as GoalNodeData).level;
            const colors: Record<string, string> = {
              sevenYear: "#8b5cf6",
              threeYear: "#3b82f6",
              oneYear: "#10b981",
              monthly: "#f59e0b",
              weekly: "#f43f5e",
            };
            return colors[level] || "#64748b";
          }}
          className="!bg-slate-800/90 !border-slate-600"
          maskColor="rgba(15, 23, 42, 0.7)"
        />

        {/* Stats Panel */}
        <Panel position="top-left" className="!m-4">
          <div className="bg-slate-800/95 backdrop-blur-sm rounded-lg p-4 border border-slate-700 shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <TreePine className="h-5 w-5 text-emerald-400" />
              <h3 className="font-semibold text-white">Goal Tree</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-violet-500/20 text-violet-300">
                {data.stats.byLevel.sevenYear} Visions
              </Badge>
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                {data.stats.byLevel.threeYear} 3-Year
              </Badge>
              <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-300">
                {data.stats.byLevel.oneYear} 1-Year
              </Badge>
              <Badge variant="secondary" className="bg-amber-500/20 text-amber-300">
                {data.stats.byLevel.monthly} Monthly
              </Badge>
              <Badge variant="secondary" className="bg-rose-500/20 text-rose-300">
                {data.stats.byLevel.weekly} Weekly
              </Badge>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-700 flex items-center gap-2 text-sm text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                {data.stats.byStatus.completed} completed
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                {data.stats.byStatus.active} active
              </span>
            </div>
          </div>
        </Panel>

        {/* Controls Panel */}
        <Panel position="top-right" className="!m-4">
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowArchived(!showArchived)}
              className="bg-slate-800/95 border-slate-700 hover:bg-slate-700"
            >
              {showArchived ? (
                <EyeOff className="h-4 w-4 mr-2" />
              ) : (
                <Eye className="h-4 w-4 mr-2" />
              )}
              {showArchived ? "Hide Archived" : "Show Archived"}
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={toggleFullscreen}
              className="bg-slate-800/95 border-slate-700 hover:bg-slate-700"
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </Panel>

        {/* Legend */}
        <Panel position="bottom-left" className="!m-4">
          <div className="bg-slate-800/95 backdrop-blur-sm rounded-lg p-3 border border-slate-700 shadow-xl">
            <p className="text-xs text-slate-400 mb-2">Goal Levels</p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-gradient-to-br from-violet-500 to-purple-600" />
                <span className="text-slate-300">7-Year</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-gradient-to-br from-blue-500 to-indigo-600" />
                <span className="text-slate-300">3-Year</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-gradient-to-br from-emerald-500 to-teal-600" />
                <span className="text-slate-300">1-Year</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-gradient-to-br from-amber-500 to-orange-600" />
                <span className="text-slate-300">Monthly</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-gradient-to-br from-rose-500 to-pink-600" />
                <span className="text-slate-300">Weekly</span>
              </span>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
