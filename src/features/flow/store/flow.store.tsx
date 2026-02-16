import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  type OnConnect,
  type OnEdgesChange,
  type OnNodesChange,
} from "@xyflow/react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type FlowMode = "edit" | "simulate";

interface FlowState {
  nodes: Node[];
  edges: Edge[];
  mode: FlowMode;

  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;

  setMode: (mode: FlowMode) => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  addNode: (node: Node) => void;
  clearFlow: () => void;

  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  updateNodeData: (id: string, data: any) => void;

  deleteNode: (id: string) => void;

  activeNodeId: string | null;
  setActiveNodeId: (id: string | null) => void;

  simulationLogs: { id: string; type: string; message: string }[];
  addSimulationLog: (log: { type: string; message: string }) => void;
  clearSimulationLogs: () => void;
  validateFlow: () => void;
}

export const useFlowStore = create<FlowState>()(
  persist(
    (set, get) => ({
      nodes: [
        {
          id: "1",
          type: "start",
          position: { x: 400, y: 100 },
          data: { label: "Boas-vindas" },
        },
      ],
      edges: [],
      mode: "edit",

      onNodesChange: (changes: NodeChange[]) => {
        set({
          nodes: applyNodeChanges(changes, get().nodes),
        });
      },

      onEdgesChange: (changes: EdgeChange[]) => {
        set({
          edges: applyEdgeChanges(changes, get().edges),
        });
      },

      onConnect: (connection: Connection) => {
        set({
          edges: addEdge(connection, get().edges),
        });
      },


      setNodes: (nodes) => set({ nodes }),

      setEdges: (edges) => set({ edges }),

      addNode: (node) =>
        set({
          nodes: [...get().nodes, node],
        }),

      clearFlow: () => set({ nodes: [], edges: [] }),

      selectedNodeId: null,
      setSelectedNodeId: (id) => set({ selectedNodeId: id }),

      updateNodeData: (id, newData) =>
        set({
          nodes: get().nodes.map((node) =>
            node.id === id
              ? { ...node, data: { ...node.data, ...newData } }
              : node,
          ),
        }),

      deleteNode: (id) =>
        set({
          nodes: get().nodes.filter((node) => node.id !== id),
          edges: get().edges.filter(
            (edge) => edge.source !== id && edge.target !== id,
          ),
          selectedNodeId: null,
        }),

      activeNodeId: null,
      setActiveNodeId: (id) => set({ activeNodeId: id }),

      simulationLogs: [],
      addSimulationLog: (log) =>
        set({
          simulationLogs: [
            ...get().simulationLogs,
            { ...log, id: Math.random().toString(36).substring(2, 9) },
          ],
        }),
      clearSimulationLogs: () => set({ simulationLogs: [] }),

      validateFlow: () => {
        const { nodes, edges } = get();
        const nodeIds = new Set(nodes.map((n) => n.id));

        // Remove arestas que apontam para nós inexistentes
        const validEdges = edges.filter(
          (edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target)
        );

        if (validEdges.length !== edges.length) {
          console.log(`[VALIDATOR] Removidas ${edges.length - validEdges.length} arestas órfãs.`);
          set({ edges: validEdges });
        }
      },

      setMode: (mode) => {
        // Limpa o grafo antes de simular
        if (mode === "simulate") {
          get().validateFlow();
          set({ simulationLogs: [], activeNodeId: null });
        }
        set({ mode });
      },
    }),
    {
      name: "nexo-flow-storage",
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
      }),
    },
  ),
);
