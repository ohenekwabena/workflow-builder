import { create } from "zustand";
import { Node, Edge, Connection, addEdge, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange } from "reactflow";
import { WorkflowNode, WorkflowEdge, Workflow } from "./types";

interface WorkflowStore {
  // Current workflow state
  workflow: Workflow | null;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNode: WorkflowNode | null;

  // UI state
  isSaving: boolean;
  isExecuting: boolean;
  showNodePanel: boolean;

  // Actions
  setWorkflow: (workflow: Workflow) => void;
  setNodes: (nodes: WorkflowNode[]) => void;
  setEdges: (edges: WorkflowEdge[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (node: WorkflowNode) => void;
  updateNodeConfig: (nodeId: string, config: Record<string, any>) => void;
  deleteNode: (nodeId: string) => void;
  setSelectedNode: (node: WorkflowNode | null) => void;
  setShowNodePanel: (show: boolean) => void;
  saveWorkflow: () => Promise<void>;
  executeWorkflow: () => Promise<void>;
  resetWorkflow: () => void;
}

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  workflow: null,
  nodes: [],
  edges: [],
  selectedNode: null,
  isSaving: false,
  isExecuting: false,
  showNodePanel: false,

  setWorkflow: (workflow) => {
    set({
      workflow,
      nodes: workflow.nodes || [],
      edges: workflow.edges || [],
    });
  },

  setNodes: (nodes) => set({ nodes }),

  setEdges: (edges) => set({ edges }),

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes) as WorkflowNode[],
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges as Edge[]) as WorkflowEdge[],
    });
  },

  onConnect: (connection) => {
    set({
      edges: addEdge(connection, get().edges as Edge[]) as WorkflowEdge[],
    });
  },

  addNode: (node) => {
    set({
      nodes: [...get().nodes, node],
    });
  },

  updateNodeConfig: (nodeId, config) => {
    set({
      nodes: get().nodes.map((node) => (node.id === nodeId ? { ...node, data: { ...node.data, config } } : node)),
    });
  },

  deleteNode: (nodeId) => {
    set({
      nodes: get().nodes.filter((node) => node.id !== nodeId),
      edges: get().edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
      selectedNode: get().selectedNode?.id === nodeId ? null : get().selectedNode,
    });
  },

  setSelectedNode: (node) => {
    set({ selectedNode: node, showNodePanel: !!node });
  },

  setShowNodePanel: (show) => {
    set({ showNodePanel: show });
  },

  saveWorkflow: async () => {
    const { workflow, nodes, edges } = get();
    if (!workflow) return;

    set({ isSaving: true });

    try {
      const response = await fetch(`/api/workflows/${workflow.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nodes,
          edges,
        }),
      });

      if (!response.ok) throw new Error("Failed to save workflow");

      const data = await response.json();
      set({ workflow: data.workflow });
    } catch (error) {
      console.error("Failed to save workflow:", error);
      throw error;
    } finally {
      set({ isSaving: false });
    }
  },

  executeWorkflow: async () => {
    const { workflow } = get();
    if (!workflow) return;

    set({ isExecuting: true });

    try {
      const response = await fetch(`/api/workflows/${workflow.id}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to execute workflow");

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to execute workflow:", error);
      throw error;
    } finally {
      set({ isExecuting: false });
    }
  },

  resetWorkflow: () => {
    set({
      workflow: null,
      nodes: [],
      edges: [],
      selectedNode: null,
      showNodePanel: false,
    });
  },
}));
