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

  flowName: string;
  flowSuffix: string;
  setFlowName: (name: string) => void;
  setFlowSuffix: (suffix: string) => void;

  simulationLogs: {
    id: string;
    nodeId?: string;
    type: string;
    message: string;
  }[];
  addSimulationLog: (log: {
    type: string;
    message: string;
    nodeId?: string;
  }) => void;
  clearSimulationLogs: () => void;
  validateFlow: () => void;
  waitingForResponse: boolean;
  setWaitingForResponse: (waiting: boolean) => void;
  selectedChatId: string | null;
  setSelectedChatId: (id: string | null) => void;
  flows: Record<string, { nodes: Node[]; edges: Edge[] }>;
}

const INITIAL_NODES: Node[] = [
  {
    id: "1",
    type: "start",
    position: { x: 400, y: 100 },
    data: { label: "Boas-vindas" },
  },
];

export const useFlowStore = create<FlowState>()(
  persist(
    (set, get) => ({
      nodes: INITIAL_NODES,
      edges: [],
      flows: {},
      mode: "edit",

      flowName: "Fluxo sem nome",
      flowSuffix: "v1.0 • Rascunho",
      setFlowName: (name) => set({ flowName: name }),
      setFlowSuffix: (suffix) => set({ flowSuffix: suffix }),

      onNodesChange: (changes: NodeChange[]) => {
        const nodes = applyNodeChanges(changes, get().nodes);
        const { flows, selectedChatId } = get();
        set({
          nodes,
          flows: selectedChatId
            ? { ...flows, [selectedChatId]: { nodes, edges: get().edges } }
            : flows,
        });
      },

      onEdgesChange: (changes: EdgeChange[]) => {
        const edges = applyEdgeChanges(changes, get().edges);
        const { flows, selectedChatId } = get();
        set({
          edges,
          flows: selectedChatId
            ? { ...flows, [selectedChatId]: { nodes: get().nodes, edges } }
            : flows,
        });
      },

      onConnect: (connection: Connection) => {
        const edges = addEdge(connection, get().edges);
        const { flows, selectedChatId } = get();
        set({
          edges,
          flows: selectedChatId
            ? { ...flows, [selectedChatId]: { nodes: get().nodes, edges } }
            : flows,
        });
      },

      setNodes: (nodes) => {
        const { flows, selectedChatId } = get();
        set({
          nodes,
          flows: selectedChatId
            ? { ...flows, [selectedChatId]: { nodes, edges: get().edges } }
            : flows,
        });
      },

      setEdges: (edges) => {
        const { flows, selectedChatId } = get();
        set({
          edges,
          flows: selectedChatId
            ? { ...flows, [selectedChatId]: { nodes: get().nodes, edges } }
            : flows,
        });
      },

      addNode: (node) => {
        const nodes = [...get().nodes, node];
        const { flows, selectedChatId } = get();
        set({
          nodes,
          flows: selectedChatId
            ? { ...flows, [selectedChatId]: { nodes, edges: get().edges } }
            : flows,
        });
      },

      clearFlow: () => {
        const { flows, selectedChatId } = get();
        set({
          nodes: [],
          edges: [],
          flows: selectedChatId
            ? { ...flows, [selectedChatId]: { nodes: [], edges: [] } }
            : flows,
        });
      },

      selectedNodeId: null,
      setSelectedNodeId: (id) => set({ selectedNodeId: id }),

      updateNodeData: (id, newData) => {
        const nodes = get().nodes.map((node) =>
          node.id === id ? { ...node, data: { ...node.data, ...newData } } : node,
        );
        const { flows, selectedChatId } = get();
        set({
          nodes,
          flows: selectedChatId
            ? { ...flows, [selectedChatId]: { nodes, edges: get().edges } }
            : flows,
        });
      },

      deleteNode: (id) => {
        const nodes = get().nodes.filter((node) => node.id !== id);
        const edges = get().edges.filter(
          (edge) => edge.source !== id && edge.target !== id,
        );
        const { flows, selectedChatId } = get();
        set({
          nodes,
          edges,
          flows: selectedChatId
            ? { ...flows, [selectedChatId]: { nodes, edges } }
            : flows,
          selectedNodeId: null,
        });
      },

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

        const validEdges = edges.filter(
          (edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target),
        );

        if (validEdges.length !== edges.length) {
          console.log(
            `[VALIDATOR] Removidas ${edges.length - validEdges.length} arestas órfãs.`,
          );
          set({ edges: validEdges });
        }
      },

      waitingForResponse: false,
      setWaitingForResponse: (waiting) => set({ waitingForResponse: waiting }),

      selectedChatId: null,
      setSelectedChatId: (id: string | null) => {
        const { flows, nodes, edges, selectedChatId: currentId } = get();

        // 1. Salva o estado atual no chatId anterior (se existia)
        const updatedFlows = { ...flows };
        if (currentId) {
          updatedFlows[currentId] = { nodes, edges };
        }

        // 2. Tenta carregar o estado do novo chatId
        const nextFlow = id ? updatedFlows[id] : null;

        set({
          selectedChatId: id,
          flows: updatedFlows,
          nodes: nextFlow?.nodes || INITIAL_NODES,
          edges: nextFlow?.edges || [],
          // Reset da simulação ao trocar de chat
          simulationLogs: [],
          activeNodeId: null,
          waitingForResponse: false,
        });
      },

      setMode: (mode) => {
        if (mode === "simulate") {
          get().validateFlow();
          set({
            simulationLogs: [],
            activeNodeId: null,
            waitingForResponse: false,
          });
        }
        set({ mode });
      },
    }),
    {
      name: "nexo-flow-storage",
      partialize: (state) => ({
        flows: state.flows,
        flowName: state.flowName,
        flowSuffix: state.flowSuffix,
        selectedChatId: state.selectedChatId,
        // Nodes e Edges são redundantes se já temos no flows, 
        // mas vamos manter para não quebrar o estado atual se o usuário der refresh
        nodes: state.nodes,
        edges: state.edges,
      }),
    },
  ),
);
