import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Edge, Node } from "@xyflow/react";
import { api } from "../instance";

interface PutFlowPayload {
  chatId: string;
  nodes: Node[];
  edges: Edge[];
}

/** Só o que o backend precisa; estado de UI do React Flow (selected, measured...) fica de fora. */
export const flowPayload = (nodes: Node[], edges: Edge[]) => ({
  nodes: nodes.map(({ id, type, position, data }) => ({ id, type, position, data })),
  edges: edges.map(({ id, source, target, sourceHandle, targetHandle }) => ({ id, source, target, sourceHandle, targetHandle })),
});

export const usePutFlow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ chatId, nodes, edges }: PutFlowPayload) => {
      const { data } = await api.put(`/chats/${chatId}/flow`, flowPayload(nodes, edges));
      return data;
    },
    onSuccess: (_, { chatId }) => queryClient.invalidateQueries({ queryKey: ["flow"], predicate: (q) => q.queryKey.includes(chatId) }),
  });
};
