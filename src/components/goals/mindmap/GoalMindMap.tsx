"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  type NodeTypes,
  BackgroundVariant,
} from "reactflow";
import "reactflow/dist/style.css";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useGoalHierarchy } from "@/hooks/useGoalHierarchy";
import { MindMapNode } from "./MindMapNode";
import { MindMapEmpty } from "./MindMapEmpty";
import { MindMapControls } from "./MindMapControls";
import {
  transformToReactFlow,
  getInitialCollapsedState,
} from "@/lib/mindmap/transform";
import type { HierarchyNode, MindMapNode as MindMapNodeType } from "@/types/mindmap";
import { Loader2 } from "lucide-react";

const nodeTypes: NodeTypes = {
  mindMapNode: MindMapNode,
};

interface GoalMindMapProps {
  dreamId?: string;
  className?: string;
}

export function GoalMindMap({ dreamId, className }: GoalMindMapProps) {
  const router = useRouter();
  const [includeTasks, setIncludeTasks] = useState(false);
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());
  const [isInitialized, setIsInitialized] = useState(false);

  const { data, isLoading, error } = useGoalHierarchy({
    dreamId,
    includeTasks,
  });

  // Initialize collapsed state when data loads
  useEffect(() => {
    if (data?.dreams && !isInitialized) {
      setCollapsedNodes(getInitialCollapsedState(data.dreams));
      setIsInitialized(true);
    }
  }, [data?.dreams, isInitialized]);

  // Detect mobile
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleToggleCollapse = useCallback((nodeId: string) => {
    setCollapsedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  const handleNodeClick = useCallback(
    (nodeId: string, level: string) => {
      if (level === "task") return;
      router.push(`/goals/${nodeId}`);
    },
    [router]
  );

  // Transform hierarchy data to React Flow format
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    if (!data?.dreams) {
      return { nodes: [], edges: [] };
    }

    // Add callbacks to hierarchy nodes
    const addCallbacks = (node: HierarchyNode): HierarchyNode => ({
      ...node,
      children: node.children?.map(addCallbacks),
    });

    const hierarchyWithCallbacks = data.dreams.map(addCallbacks);

    return transformToReactFlow(hierarchyWithCallbacks, {
      collapsedNodes,
      direction: isMobile ? "vertical" : "horizontal",
      includeTasks,
    });
  }, [data?.dreams, collapsedNodes, isMobile, includeTasks]);

  // Add callbacks to node data
  const nodesWithCallbacks = useMemo(() => {
    return initialNodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        onToggleCollapse: () => handleToggleCollapse(node.id),
        onClick: () => handleNodeClick(node.id, node.data.level),
      },
    }));
  }, [initialNodes, handleToggleCollapse, handleNodeClick]);

  const [nodes, setNodes, onNodesChange] = useNodesState(nodesWithCallbacks);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when data changes
  useEffect(() => {
    setNodes(nodesWithCallbacks);
    setEdges(initialEdges);
  }, [nodesWithCallbacks, initialEdges, setNodes, setEdges]);

  const handleExpandAll = useCallback(() => {
    setCollapsedNodes(new Set());
  }, []);

  const handleCollapseAll = useCallback(() => {
    if (data?.dreams) {
      const allNodesWithChildren = new Set<string>();
      const collectNodes = (node: HierarchyNode) => {
        if (node.childrenCount > 0) {
          allNodesWithChildren.add(node.id);
        }
        node.children?.forEach(collectNodes);
      };
      data.dreams.forEach(collectNodes);
      setCollapsedNodes(allNodesWithChildren);
    }
  }, [data?.dreams]);

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center h-full", className)}>
        <Loader2 className="w-8 h-8 text-lantern animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("flex items-center justify-center h-full", className)}>
        <p className="text-red-400">Failed to load goal hierarchy</p>
      </div>
    );
  }

  if (!data?.dreams || data.dreams.length === 0) {
    return <MindMapEmpty className={className} />;
  }

  return (
    <div className={cn("relative w-full h-full", className)}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
        className="bg-void"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="oklch(var(--night-mist) / 0.3)"
        />
        <Controls
          className="!bg-night !border-night-mist !shadow-lg"
          showInteractive={false}
        />
      </ReactFlow>

      <MindMapControls
        includeTasks={includeTasks}
        onToggleTasks={() => setIncludeTasks(!includeTasks)}
        onExpandAll={handleExpandAll}
        onCollapseAll={handleCollapseAll}
        stats={data.stats}
      />
    </div>
  );
}
