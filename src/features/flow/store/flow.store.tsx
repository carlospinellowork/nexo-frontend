import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
} from "@xyflow/react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { defaultNodeData, nodeOutputs, type NodeType } from "../contract";
import { BLOCKS } from "../catalog";

interface Snapshot {
  nodes: Node[];
  edges: Edge[];
}

const HISTORY_LIMIT = 60;
/** Edições seguidas no mesmo campo dentro deste intervalo viram um único passo de desfazer. */
const COALESCE_MS = 900;
const ROW_GAP = 210;
const COLUMN_GAP = 300;

// Estado de edição do fluxo. A versão salva vive no servidor (useGetFlow / usePutFlow).
interface FlowState {
  selectedChatId: string | null;
  nodes: Node[];
  edges: Edge[];
  dirty: boolean;
  selectedNodeId: string | null;
  /** Nós destacados no canvas (último caminho executado no teste) */
  highlightedNodeIds: string[];
  testOpen: boolean;
  /** Bloco recém-adicionado que o canvas deve trazer para a vista */
  focusNodeId: string | null;

  past: Snapshot[];
  future: Snapshot[];
  lastCommit: { key: string; at: number } | null;
  dragging: boolean;

  setSelectedChatId: (id: string | null) => void;
  load: (nodes: Node[], edges: Edge[]) => void;
  markSaved: () => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNodeAt: (type: NodeType, position: { x: number; y: number }) => string;
  addNodeAfter: (sourceId: string, handleId: string, type: NodeType) => string;
  addFromLibrary: (type: NodeType) => string;
  updateNodeData: (id: string, data: Record<string, unknown>) => void;
  deleteNode: (id: string) => void;
  applyFlow: (nodes: Node[], edges: Edge[]) => void;
  setSelectedNodeId: (id: string | null) => void;
  setHighlighted: (ids: string[]) => void;
  setTestOpen: (open: boolean) => void;
  undo: () => void;
  redo: () => void;
}

// Mudanças que só refletem interação (seleção, medição) não tornam o fluxo "não salvo".
const isCosmetic = (c: NodeChange | EdgeChange) => c.type === "select" || c.type === "dimensions";

const newId = (type: string) => `${type}-${crypto.randomUUID().slice(0, 8)}`;

/** Encontra uma posição livre perto do ponto desejado (desce até não sobrepor outro bloco). */
function freeSpot(nodes: Node[], x: number, y: number) {
  let pos = { x, y };
  for (let i = 0; i < 20 && nodes.some((n) => Math.abs(n.position.x - pos.x) < 240 && Math.abs(n.position.y - pos.y) < 120); i++) {
    pos = { x: pos.x, y: pos.y + 140 };
  }
  return pos;
}

const handleOf = (h: string | null | undefined) => (h && h !== "source" ? h : null);

/** Blocos alcançáveis a partir de `startId` (sem voltar para `stopId`). */
function downstream(edges: Edge[], startId: string, stopId: string) {
  const seen = new Set<string>();
  const queue = [startId];
  while (queue.length) {
    const id = queue.shift()!;
    if (seen.has(id) || id === stopId) continue;
    seen.add(id);
    for (const e of edges) if (e.source === id) queue.push(e.target);
  }
  return seen;
}

export const useFlowStore = create<FlowState>()(
  persist(
    (set, get) => {
      /** Guarda o estado atual no histórico antes de uma mudança. */
      const commit = (key?: string) => {
        const { nodes, edges, past, lastCommit } = get();
        const now = Date.now();
        if (key && lastCommit?.key === key && now - lastCommit.at < COALESCE_MS) {
          set({ lastCommit: { key, at: now } });
          return;
        }
        set({ past: [...past, { nodes, edges }].slice(-HISTORY_LIMIT), future: [], lastCommit: key ? { key, at: now } : null });
      };

      const insertNode = (node: Node, extraEdges: Edge[] = [], removeEdgeIds: string[] = [], baseNodes = get().nodes) => {
        commit();
        set({
          nodes: [...baseNodes.map((n) => ({ ...n, selected: false })), { ...node, selected: true }],
          edges: [...get().edges.filter((e) => !removeEdgeIds.includes(e.id)), ...extraEdges],
          selectedNodeId: node.id,
          focusNodeId: node.id,
          dirty: true,
        });
        return node.id;
      };

      return {
        selectedChatId: null,
        nodes: [],
        edges: [],
        dirty: false,
        selectedNodeId: null,
        highlightedNodeIds: [],
        testOpen: false,
        focusNodeId: null,
        past: [],
        future: [],
        lastCommit: null,
        dragging: false,

        setSelectedChatId: (id) => set({ selectedChatId: id, selectedNodeId: null, highlightedNodeIds: [], past: [], future: [] }),
        load: (nodes, edges) => set({ nodes, edges, dirty: false, selectedNodeId: null, past: [], future: [], lastCommit: null }),
        markSaved: () => set({ dirty: false }),

        onNodesChange: (changes) => {
          const structural = changes.some((c) => c.type === "remove" || c.type === "add");
          const dragStart = changes.some((c) => c.type === "position" && c.dragging) && !get().dragging;
          const dragEnd = changes.some((c) => c.type === "position" && c.dragging === false);
          if (structural || dragStart) commit();
          set({
            nodes: applyNodeChanges(changes, get().nodes),
            dirty: get().dirty || changes.some((c) => !isCosmetic(c)),
            dragging: dragStart ? true : dragEnd ? false : get().dragging,
            ...(changes.some((c) => c.type === "remove" && c.id === get().selectedNodeId) ? { selectedNodeId: null } : {}),
          });
        },
        onEdgesChange: (changes) => {
          if (changes.some((c) => c.type === "remove")) commit();
          set({
            edges: applyEdgeChanges(changes, get().edges),
            dirty: get().dirty || changes.some((c) => !isCosmetic(c)),
          });
        },
        onConnect: (connection) => {
          commit();
          // Cada saída (handle) aceita uma única conexão: a nova substitui a anterior.
          const edges = get().edges.filter(
            (e) => !(e.source === connection.source && handleOf(e.sourceHandle) === handleOf(connection.sourceHandle)),
          );
          set({ edges: addEdge(connection, edges), dirty: true });
        },

        addNodeAt: (type, position) =>
          insertNode({ id: newId(type), type, position: freeSpot(get().nodes, position.x, position.y), data: { ...defaultNodeData(type) } }),

        addNodeAfter: (sourceId, handleId, type) => {
          const { nodes, edges } = get();
          const source = nodes.find((n) => n.id === sourceId);
          if (!source) return "";
          const outputs = nodeOutputs(source.type as NodeType, source.data, BLOCKS[source.type as NodeType]?.color ?? "");
          const index = Math.max(0, outputs.findIndex((o) => o.id === handleId));
          const offset = (index - (outputs.length - 1) / 2) * COLUMN_GAP;
          const height = source.measured?.height ?? 120;
          const fromHandle = handleOf(handleId);
          const existing = edges.find((e) => e.source === sourceId && handleOf(e.sourceHandle) === fromHandle);
          const desired = { x: source.position.x + offset, y: source.position.y + height + ROW_GAP - 120 };

          // Inserindo no meio de um caminho: tudo o que vem depois desce para abrir espaço.
          let current = nodes;
          if (existing) {
            const below = downstream(edges, existing.target, sourceId);
            current = nodes.map((n) => (below.has(n.id) ? { ...n, position: { x: n.position.x, y: n.position.y + ROW_GAP } } : n));
          }
          const position = existing ? desired : freeSpot(current, desired.x, desired.y);

          const node: Node = { id: newId(type), type, position, data: { ...defaultNodeData(type) } };
          const newEdges: Edge[] = [
            { id: `e-${crypto.randomUUID().slice(0, 8)}`, source: sourceId, target: node.id, ...(fromHandle ? { sourceHandle: fromHandle } : {}) },
          ];
          // Se a saída já levava a outro bloco, o novo bloco entra no meio do caminho
          // (pela primeira saída dele; blocos sem saída, como Fim, encerram ali).
          const first = nodeOutputs(type, node.data, "")[0];
          if (existing && first) {
            const handle = handleOf(first.id);
            newEdges.push({ id: `e-${crypto.randomUUID().slice(0, 8)}`, source: node.id, target: existing.target, ...(handle ? { sourceHandle: handle } : {}) });
          }
          return insertNode(node, newEdges, existing ? [existing.id] : [], current);
        },

        addFromLibrary: (type) => {
          const { nodes, edges, selectedNodeId } = get();
          const selected = nodes.find((n) => n.id === selectedNodeId);
          if (selected) {
            const outputs = nodeOutputs(selected.type as NodeType, selected.data, "");
            const free = outputs.find((o) => !edges.some((e) => e.source === selected.id && handleOf(e.sourceHandle) === handleOf(o.id)));
            const target = free ?? outputs[0];
            if (target) return get().addNodeAfter(selected.id, target.id, type);
          }
          const lowest = nodes.reduce((max, n) => Math.max(max, n.position.y), 0);
          return get().addNodeAt(type, { x: nodes[0]?.position.x ?? 0, y: nodes.length ? lowest + ROW_GAP : 0 });
        },

        updateNodeData: (id, data) => {
          commit(`${id}:${Object.keys(data).sort().join(",")}`);
          set({
            nodes: get().nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...data } } : n)),
            dirty: true,
          });
        },
        deleteNode: (id) => {
          commit();
          set({
            nodes: get().nodes.filter((n) => n.id !== id),
            edges: get().edges.filter((e) => e.source !== id && e.target !== id),
            selectedNodeId: null,
            dirty: true,
          });
        },
        applyFlow: (nodes, edges) => {
          commit();
          set({ nodes, edges, dirty: true, selectedNodeId: null });
        },
        setSelectedNodeId: (id) => set({ selectedNodeId: id }),
        setHighlighted: (ids) => set({ highlightedNodeIds: ids }),
        setTestOpen: (open) => set(open ? { testOpen: true, selectedNodeId: null } : { testOpen: false }),

        undo: () => {
          const { past, nodes, edges, future } = get();
          const previous = past.at(-1);
          if (!previous) return;
          set({ ...previous, past: past.slice(0, -1), future: [{ nodes, edges }, ...future], dirty: true, lastCommit: null, selectedNodeId: null });
        },
        redo: () => {
          const { past, nodes, edges, future } = get();
          const next = future[0];
          if (!next) return;
          set({ ...next, future: future.slice(1), past: [...past, { nodes, edges }], dirty: true, lastCommit: null, selectedNodeId: null });
        },
      };
    },
    {
      name: "nexo-flow-editor",
      // Só a preferência de qual chat estava aberto; o conteúdo vem sempre do servidor.
      partialize: (s) => ({ selectedChatId: s.selectedChatId }),
    },
  ),
);
