import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Edge, Node } from "@xyflow/react";
import { api } from "../instance";

interface PutFlowPayload {
  chatId: string;
  nodes: Node[];
  edges: Edge[];
}

export const usePutFlow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ chatId, nodes, edges }: PutFlowPayload) => {
      const { data } = await api.put(`/chats/${chatId}/flow`, { nodes, edges });
      return data;
    },
    onSuccess: (_, { chatId }) => {
      queryClient.invalidateQueries({ queryKey: ["flow", chatId] });
    },
  });
};
