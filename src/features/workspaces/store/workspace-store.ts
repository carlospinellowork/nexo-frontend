import { create } from "zustand"
import { persist } from "zustand/middleware"

// Só a preferência de qual workspace está ativo; a lista vem do servidor (useGetWorkspaces).
interface WorkspaceState {
  activeWorkspaceId: string | null
  setActiveWorkspaceId: (id: string | null) => void
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      activeWorkspaceId: null,
      setActiveWorkspaceId: (id) => set({ activeWorkspaceId: id }),
    }),
    { name: "nexo-workspace" },
  ),
)
