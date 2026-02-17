import { create } from "zustand"
import { persist } from "zustand/middleware"


export interface ChatSettings {
  id: string
  name: string
  botName: string
  welcomeMessage: string
  mainColor: string
  buttonIcon: "default" | "sparkles" | "message"
  position: "right" | "left"
  borderRadius: "none" | "medium" | "full"
  headerBackgroundColor: string
  headerTextColor: string
  userBubbleColor: string
  botBubbleColor: string
  botTextColor: string
}

interface ChatBuilderState {
  chats: ChatSettings[]
  activeChatId: string
  setSettings: <K extends keyof ChatSettings>(key: K, value: ChatSettings[K]) => void
  addChat: (name: string) => void
  setActiveChat: (id: string) => void
  getActiveSettings: () => ChatSettings
}

const DEFAULT_CHAT: ChatSettings = {
  id: "default",
  name: "Chat Padrão",
  botName: "Nexo Assistant",
  welcomeMessage: "Olá! Como posso ajudar você hoje?",
  mainColor: "#3b82f6",
  buttonIcon: "default",
  position: "right",
  borderRadius: "medium",
  headerBackgroundColor: "#3b82f6",
  headerTextColor: "#ffffff",
  userBubbleColor: "#3b82f6",
  botBubbleColor: "#f1f5f9",
  botTextColor: "#1e293b",
}

export const useChatBuilderStore = create<ChatBuilderState>()(
  persist(
    (set, get) => ({
      chats: [DEFAULT_CHAT],
      activeChatId: "default",

      getActiveSettings: () => {
        const { chats, activeChatId } = get()
        return chats.find(c => c.id === activeChatId) || DEFAULT_CHAT
      },

      setSettings: (key, value) => set((state) => ({
        chats: state.chats.map(chat =>
          chat.id === state.activeChatId ? { ...chat, [key]: value } : chat
        )
      })),

      addChat: (name) => set((state) => {
        const newChat = { ...DEFAULT_CHAT, id: Math.random().toString(36).substring(7), name }
        return { chats: [...state.chats, newChat], activeChatId: newChat.id }
      }),

      setActiveChat: (id) => set({ activeChatId: id })
    }),
    {
      name: "chat-builder-settings",
    }
  )
)