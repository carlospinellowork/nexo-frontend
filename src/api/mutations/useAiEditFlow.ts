import { useMutation } from "@tanstack/react-query";
import type { Edge, Node } from "@xyflow/react";
import { api } from "../instance";
import { flowPayload } from "./usePutFlow";

export interface AiEditResult {
  nodes: Node[];
  edges: Edge[];
  summary: string;
}

/** Pede à IA uma alteração no fluxo. Devolve o fluxo novo sem salvar; o editor aplica com desfazer. */
export const useAiEditFlow = () =>
  useMutation({
    mutationFn: async ({ chatId, instruction, nodes, edges }: { chatId: string; instruction: string; nodes: Node[]; edges: Edge[] }) => {
      const { data } = await api.post<AiEditResult>(`/chats/${chatId}/flow/ai`, { instruction, ...flowPayload(nodes, edges) });
      return data;
    },
  });
