import { create } from "zustand"

export interface ChatSettings {
  botName: string
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

export const DEFAULT_SETTINGS: ChatSettings = {
  botName: "Assistente",
  mainColor: "#0A6CFF",
  buttonIcon: "default",
  position: "right",
  borderRadius: "full",
  headerBackgroundColor: "#0A6CFF",
  headerTextColor: "#ffffff",
  userBubbleColor: "#0A6CFF",
  botBubbleColor: "#f1f5f9",
  botTextColor: "#1e293b",
}

export const withDefaults = (settings?: Partial<ChatSettings>): ChatSettings => ({
  ...DEFAULT_SETTINGS,
  ...settings,
})

// Rascunho do chat em edição. Os dados salvos vêm do servidor (useGetChats).
interface ChatBuilderState {
  activeChatId: string | null
  name: string
  draft: ChatSettings
  dirty: boolean
  load: (chat: { id: string; name: string; settings: Partial<ChatSettings> }) => void
  setName: (name: string) => void
  setSetting: <K extends keyof ChatSettings>(key: K, value: ChatSettings[K]) => void
  markSaved: () => void
}

export const useChatBuilderStore = create<ChatBuilderState>()((set) => ({
  activeChatId: null,
  name: "",
  draft: DEFAULT_SETTINGS,
  dirty: false,
  load: (chat) => set({ activeChatId: chat.id, name: chat.name, draft: withDefaults(chat.settings), dirty: false }),
  setName: (name) => set({ name, dirty: true }),
  setSetting: (key, value) => set((s) => ({ draft: { ...s.draft, [key]: value }, dirty: true })),
  markSaved: () => set({ dirty: false }),
}))
