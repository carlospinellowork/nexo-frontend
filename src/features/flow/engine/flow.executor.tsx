import { useEffect, useRef } from "react";
import { useFlowStore } from "../store/flow.store";

export function useFlowExecutor() {
  const mode = useFlowStore((state) => state.mode);
  const activeNodeId = useFlowStore((state) => state.activeNodeId);
  const waitingForResponse = useFlowStore((state) => state.waitingForResponse);
  const lastLoggedNodeId = useRef<string | null>(null);

  useEffect(() => {
    if (mode === "simulate") {
      const {
        nodes,
        setActiveNodeId,
        clearSimulationLogs,
        setWaitingForResponse,
      } = useFlowStore.getState();

      clearSimulationLogs();
      setWaitingForResponse(false);
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
    const {
      edges,
      activeNodeId: currentId,
      setActiveNodeId,
      simulationLogs,
    } = currentState;

    if (!currentId) return;

    const currentNode = currentState.nodes.find((n) => n.id === currentId);
    let targetHandle: string | undefined = undefined;

    // Lógica especial para decisão (ConditionNode)
    if (currentNode?.type === "condition") {
      const lastUserMessage =
        [...simulationLogs]
          .reverse()
          .find((l) => l.type === "user")
          ?.message.toLowerCase() || "";

      // Lógica simples de decisão: se tiver 'sim', 'ok', 'quero' ou 'yes', vai pelo SIM
      const positiveWords = ["sim", "ok", "quero", "yes", "s", "true", "bora"];
      const isPositive = positiveWords.some((word) =>
        lastUserMessage.includes(word),
      );

      targetHandle = isPositive ? "yes" : "no";
    }

    // Busca a conexão saindo do nó atual
    const connection = edges.find(
      (e) =>
        e.source === currentId &&
        (targetHandle ? e.sourceHandle === targetHandle : true),
    );

    if (connection) {
      setActiveNodeId(connection.target);
    } else {
      console.warn(`[SIMULADOR] Simulação interrompida em ${currentId}`);
    }
  };

  // Loop de Simulação
  useEffect(() => {
    // Se estivermos esperando resposta, ou não estivermos em simulação, paramos o loop
    if (mode !== "simulate" || !activeNodeId || waitingForResponse) return;

    const { nodes, addSimulationLog, setWaitingForResponse } =
      useFlowStore.getState();
    const currentNode = nodes.find((n) => n.id === activeNodeId);

    if (!currentNode) return;

    // Registrar no Log (apenas se for um novo nó)
    if (lastLoggedNodeId.current !== activeNodeId) {
      lastLoggedNodeId.current = activeNodeId;

      if (currentNode.type === "message") {
        addSimulationLog({
          type: "message",
          nodeId: currentNode.id,
          message:
            (currentNode.data?.content as string) ||
            (currentNode.data?.label as string),
        });
      } else if (currentNode.type === "action") {
        addSimulationLog({
          type: "action",
          nodeId: currentNode.id,
          message: `Executando: ${currentNode.data?.label || "Ação"}`,
        });
      } else if (currentNode.type === "condition") {
        addSimulationLog({
          type: "message",
          nodeId: currentNode.id,
          message:
            (currentNode.data?.criteria as string) ||
            "Por favor, responda para continuar:",
        });

        // Pausa a simulação e espera input do usuário
        setWaitingForResponse(true);
        return;
      } else if (currentNode.type === "start") {
        addSimulationLog({
          type: "system",
          nodeId: currentNode.id,
          message: "Fluxo Iniciado",
        });
      } else if (currentNode.type === "end") {
        addSimulationLog({
          type: "system",
          nodeId: currentNode.id,
          message: "Fluxo Finalizado",
        });
        return;
      }
    }

    const timer = setTimeout(next, 1500);
    return () => clearTimeout(timer);
  }, [activeNodeId, mode, waitingForResponse]);

  return { activeNodeId };
}
