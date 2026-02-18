import { useQuery } from "@tanstack/react-query";
import type { ChatSettings } from "../../features/chatBuilder/store/chat-builder-store";
import { api } from "../instance";

export const useGetChats = () => {
  return useQuery({
    queryKey: ["chats"],
    queryFn: async () => {
      const { data } = await api.get<ChatSettings[]>("/chats");
      return data;
    },
  });
};
