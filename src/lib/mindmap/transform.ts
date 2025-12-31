import dagre from "dagre";
import type {
  HierarchyNode,
  MindMapNode,
  MindMapEdge,
  MindMapLevel,
} from "@/types/mindmap";
import { NODE_DIMENSIONS, LAYOUT_CONFIG } from "./constants";

interface TransformOptions {
  collapsedNodes: Set<string>;
  direction: "horizontal" | "vertical";
  includeTasks?: boolean;
}

export function transformToReactFlow(
  hierarchy: HierarchyNode[],
  options: TransformOptions
): { nodes: MindMapNode[]; edges: MindMapEdge[] } {
  const { collapsedNodes, direction, includeTasks = false } = options;
  const nodes: MindMapNode[] = [];
  const edges: MindMapEdge[] = [];

  function traverse(
    node: HierarchyNode,
    depth: number,
    parentId: string | null
  ) {
    // Skip tasks if not included
    if (node.level === "task" && !includeTasks) return;

    const isCollapsed = collapsedNodes.has(node.id);
    const dimensions = NODE_DIMENSIONS[node.level];

    nodes.push({
      id: node.id,
      type: "mindMapNode",
      position: { x: 0, y: 0 }, // Will be calculated by dagre
      data: {
        ...node,
        isCollapsed,
        depth,
      },
      width: dimensions.width,
      height: dimensions.height,
    });

    if (parentId) {
      edges.push({
        id: `${parentId}-${node.id}`,
        source: parentId,
        target: node.id,
        type: "smoothstep",
        animated: node.status === "ACTIVE",
        style: {
          stroke: "oklch(var(--lantern) / 0.5)",
          strokeWidth: 2,
        },
      });
    }

    // Only traverse children if not collapsed
    if (!isCollapsed && node.children) {
      node.children.forEach((child) => traverse(child, depth + 1, node.id));
    }
  }

  hierarchy.forEach((dream) => traverse(dream, 0, null));

  // Apply dagre layout
  const layoutedNodes = applyDagreLayout(nodes, edges, direction);

  return { nodes: layoutedNodes, edges };
}

function applyDagreLayout(
  nodes: MindMapNode[],
  edges: MindMapEdge[],
  direction: "horizontal" | "vertical"
): MindMapNode[] {
  const config = LAYOUT_CONFIG[direction];
  const dagreGraph = new dagre.graphlib.Graph();

  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: config.rankdir,
    nodesep: config.nodesep,
    ranksep: config.ranksep,
  });

  // Add nodes to dagre
  nodes.forEach((node) => {
    const dimensions = NODE_DIMENSIONS[node.data.level as MindMapLevel];
    dagreGraph.setNode(node.id, {
      width: dimensions.width,
      height: dimensions.height,
    });
  });

  // Add edges to dagre
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Calculate layout
  dagre.layout(dagreGraph);

  // Apply calculated positions
  return nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const dimensions = NODE_DIMENSIONS[node.data.level as MindMapLevel];

    return {
      ...node,
      position: {
        x: nodeWithPosition.x - dimensions.width / 2,
        y: nodeWithPosition.y - dimensions.height / 2,
      },
    };
  });
}

export function getInitialCollapsedState(
  hierarchy: HierarchyNode[]
): Set<string> {
  const collapsed = new Set<string>();

  function traverse(node: HierarchyNode, depth: number) {
    // Collapse nodes at depth 2+ (show dreams and 5-year goals)
    if (depth >= 2 && node.children && node.children.length > 0) {
      collapsed.add(node.id);
    }
    node.children?.forEach((child) => traverse(child, depth + 1));
  }

  hierarchy.forEach((dream) => traverse(dream, 0));
  return collapsed;
}
