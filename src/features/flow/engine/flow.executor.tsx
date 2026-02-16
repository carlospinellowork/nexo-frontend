import { useEffect, useRef } from "react";
import { useFlowStore } from "../store/flow.store";

export function useFlowExecutor() {
  const mode = useFlowStore((state) => state.mode);
  const activeNodeId = useFlowStore((state) => state.activeNodeId);
  const lastLoggedNodeId = useRef<string | null>(null);

  useEffect(() => {
    if (mode === "simulate") {
      const { nodes, setActiveNodeId } = useFlowStore.getState();

      useFlowStore.getState().clearSimulationLogs();
      lastLoggedNodeId.current = null;

      const startNode = nodes.find((n) => n.type === "start");
      if (startNode) {
        setActiveNodeId(startNode.id);
      }
    } else {
      useFlowStore.getState().setActiveNodeId(null);
      lastLoggedNodeId.current = null;
    }
  }, [mode]);

  const next = () => {
    const currentState = useFlowStore.getState();
    const { edges, activeNodeId: currentId, setActiveNodeId } = currentState;

    if (!currentId) return;

    const connection = edges.find((e) => e.source === currentId);

    if (connection) {
      setActiveNodeId(connection.target);
    } else {
      console.warn(`[SIMULADOR] Fim do caminho em ${currentId}`);
    }
  };

  useEffect(() => {
    if (mode !== "simulate" || !activeNodeId) return;

    const { nodes, addSimulationLog } = useFlowStore.getState();
    const currentNode = nodes.find((n) => n.id === activeNodeId);

    if (!currentNode) return;

    if (lastLoggedNodeId.current !== activeNodeId) {
      lastLoggedNodeId.current = activeNodeId;

      const label = currentNode.data?.label || `Bloco ${currentNode.type}`;
      if (currentNode.type === "message" || currentNode.type === "action") {
        addSimulationLog({
          type: currentNode.type,
          message: label as string,
        });
      } else if (currentNode.type === "start") {
        addSimulationLog({ type: "system", message: "Fluxo Iniciado" });
      } else if (currentNode.type === "end") {
        addSimulationLog({ type: "system", message: "Fluxo Finalizado" });
        return;
      }
    }

    const timer = setTimeout(next, 1500);
    return () => clearTimeout(timer);
  }, [activeNodeId, mode]);

  return { activeNodeId };
}