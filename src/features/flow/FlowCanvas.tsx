import { Background, Controls, MiniMap, ReactFlow, ReactFlowProvider, useReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { type DragEvent, type ReactNode, useCallback, useEffect } from "react";
import { AiBar } from "./components/AiBar";
import { BlockLibrary, DRAG_MIME } from "./components/BlockLibrary";
import { NodePropertiesPanel } from "./components/NodePropertiesPanel";
import { NODE_TYPES, type NodeType } from "./contract";
import { nodeTypes } from "./nodes";
import { useFlowStore } from "./store/flow.store";
import { useThemeStore } from "../theme/theme-store";

const defaultEdgeOptions = {
  style: { strokeWidth: 2 },
  type: "smoothstep",
  animated: true,
};

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

/** Ctrl+Z desfaz; Ctrl+Shift+Z ou Ctrl+Y refaz. Dentro de campos de texto vale o desfazer do navegador. */
function useUndoShortcuts() {
  const undo = useFlowStore((s) => s.undo);
  const redo = useFlowStore((s) => s.redo);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || isTyping(e.target)) return;
      const key = e.key.toLowerCase();
      if (key === "z" && !e.shiftKey) undo();
      else if ((key === "z" && e.shiftKey) || key === "y") redo();
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);
}

function FlowCanvasContent({ chatId }: { chatId: string | null }) {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNodeAt, setSelectedNodeId, testOpen, selectedNodeId, focusNodeId } = useFlowStore();
  const { screenToFlowPosition, getViewport, setCenter } = useReactFlow();
  const theme = useThemeStore((s) => s.resolved);
  useUndoShortcuts();

  // Bloco recém-adicionado: centraliza na área livre entre a biblioteca e os painéis da direita.
  useEffect(() => {
    if (!focusNodeId) return;
    const node = useFlowStore.getState().nodes.find((n) => n.id === focusNodeId);
    useFlowStore.setState({ focusNodeId: null });
    if (!node) return;
    const { zoom } = getViewport();
    const rightPanels = 376 + (useFlowStore.getState().testOpen ? 376 : 0);
    const shift = (rightPanels - 248) / 2 / zoom;
    void setCenter(node.position.x + 132 + shift, node.position.y + 60, { zoom, duration: 400 });
  }, [focusNodeId, getViewport, setCenter]);

  const rightInset = 16 + (selectedNodeId ? 376 : 0) + (testOpen ? 376 : 0);

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData(DRAG_MIME) as NodeType;
      if (!NODE_TYPES.includes(type) || type === "start") return;
      // O ponto solto vira o centro do topo do card (264px de largura).
      const p = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      addNodeAt(type, { x: p.x - 132, y: p.y - 20 });
    },
    [addNodeAt, screenToFlowPosition],
  );

  return (
    <div className="h-full w-full" onDrop={onDrop} onDragOver={onDragOver}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => setSelectedNodeId(node.id)}
        onPaneClick={() => setSelectedNodeId(null)}
        deleteKeyCode={["Delete", "Backspace"]}
        colorMode={theme}
        fitView
        fitViewOptions={{ padding: 0.3, maxZoom: 1 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={22} size={1.4} />
        <Controls position="bottom-right" style={{ marginRight: rightInset, marginBottom: 16, transition: "margin 0.2s" }} />
        {!testOpen && !selectedNodeId && (
          <MiniMap
            pannable
            zoomable
            position="top-right"
            style={{ borderRadius: 16, overflow: "hidden", boxShadow: "var(--nx-shadow)" }}
            nodeColor="var(--nx-border)"
            maskColor="color-mix(in srgb, var(--nx-bg) 60%, transparent)"
          />
        )}
      </ReactFlow>

      <BlockLibrary />
      <NodePropertiesPanel />
      {chatId && <AiBar chatId={chatId} />}
    </div>
  );
}

export function FlowCanvas({ chatId, children }: { chatId: string | null; children?: ReactNode }) {
  return (
    <ReactFlowProvider>
      <FlowCanvasContent chatId={chatId} />
      {children}
    </ReactFlowProvider>
  );
}
