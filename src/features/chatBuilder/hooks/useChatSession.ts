import { useCallback, useEffect } from "react";
import { useSocket } from "../../../shared/contexts/SocketContext";
import { useFlowStore } from "../../flow/store/flow.store";

export const useChatSession = (chatId: string | null) => {
  const { socket, isConnected } = useSocket();
  const { addSimulationLog, setWaitingForResponse } = useFlowStore();

  useEffect(() => {
    if (!socket || !isConnected || !chatId) return;

    // Entrar na sala do chat específico para simulação
    socket.emit("join_simulation", { chatId });

    const handleBotMessage = (message: any) => {
      addSimulationLog({
        type: "message",
        message: message.content,
        nodeId: message.nodeId,
      });
      setWaitingForResponse(true);
    };

    const handleBotAction = (action: any) => {
      addSimulationLog({
        type: "action",
        message: `Executando: ${action.name}`,
      });
    };

    socket.on("bot_message", handleBotMessage);
    socket.on("bot_action", handleBotAction);

    return () => {
      socket.off("bot_message", handleBotMessage);
      socket.off("bot_action", handleBotAction);
      socket.emit("leave_simulation", { chatId });
    };
  }, [socket, isConnected, chatId, addSimulationLog, setWaitingForResponse]);

  const sendMessage = useCallback((message: string) => {
    if (socket && isConnected && chatId) {
      socket.emit("user_message", { chatId, message });
      setWaitingForResponse(false);
    }
  }, [socket, isConnected, chatId, setWaitingForResponse]);

  return {
    sendMessage,
    isConnected,
  };
};
