import { useEffect } from "react";
import { useGetChats } from "../../api/queries/useGetChats";
import { useFlowStore } from "../../features/flow/store/flow.store";

/**
 * Chat selecionado compartilhado entre Flow Builder, Simulador, Aparência e Canais.
 * Garante que o id selecionado existe no workspace ativo (ou escolhe o primeiro).
 */
export function useActiveChat() {
  const { data: chats, isLoading } = useGetChats();
  const selectedChatId = useFlowStore((s) => s.selectedChatId);
  const setSelectedChatId = useFlowStore((s) => s.setSelectedChatId);

  useEffect(() => {
    if (!chats) return;
    if (!selectedChatId || !chats.some((c) => c.id === selectedChatId)) {
      setSelectedChatId(chats[0]?.id ?? null);
    }
  }, [chats, selectedChatId, setSelectedChatId]);

  const chat = chats?.find((c) => c.id === selectedChatId) ?? null;
  return { chats, chat, chatId: chat?.id ?? null, setChatId: setSelectedChatId, isLoading };
}
