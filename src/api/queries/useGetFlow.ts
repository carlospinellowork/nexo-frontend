import { useQuery } from "@tanstack/react-query";
import type { Edge, Node } from "@xyflow/react";
import { useWorkspaceStore } from "../../features/workspaces/store/workspace-store";
import { api } from "../instance";

export interface FlowResponse {
  chatId: string;
  nodes: Node[];
  edges: Edge[];
  updatedAt?: string;
  publishedAt: string | null;
  hasUnpublishedChanges: boolean;
}

export const useGetFlow = (chatId: string | null) => {
  const workspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  return useQuery({
    queryKey: ["flow", workspaceId, chatId],
    queryFn: async () => {
      const { data } = await api.get<FlowResponse>(`/chats/${chatId}/flow`);
      return data;
    },
    enabled: !!chatId && !!workspaceId,
  });
};
