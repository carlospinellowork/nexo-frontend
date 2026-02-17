import { createFileRoute } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { SettingsPanel } from '../../features/chatBuilder/components/SettingsPanel'
import { WidgetPreview } from '../../features/chatBuilder/components/WidgetPreview'
import { useChatBuilderStore } from '../../features/chatBuilder/store/chat-builder-store'
import { Header } from '../../shared/components/layout/Header'

export const Route = createFileRoute('/_app/chat-builder')({
  component: RouteComponent,
})

function RouteComponent() {
  const { chats, activeChatId, setActiveChat, addChat } = useChatBuilderStore()

  const handleCreateChat = () => {
    const name = prompt("Nome do novo chat:")
    if (name) addChat(name)
  }

  return (
    <div className='flex flex-col h-full'>
      <Header
        title="Chat Builder"
        subtitle="Configure a aparência do seu widget de chat"
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-panel border border-border-ui rounded-lg overflow-hidden h-9">
              <div className="px-3 border-r border-border-ui h-full flex items-center bg-white/5">
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-tighter">
                  Chat Ativo:
                </span>
              </div>
              <select
                value={activeChatId}
                onChange={(e) => setActiveChat(e.target.value)}
                className="bg-transparent border-none outline-none text-xs font-medium px-2 py-1 pr-8 text-text-primary appearance-none cursor-pointer hover:bg-white/5 transition-colors h-full min-w-40"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 8px center",
                  backgroundSize: "12px",
                }}
              >
                {chats.map((chat) => (
                  <option key={chat.id} value={chat.id}>
                    {chat.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleCreateChat}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold border border-primary/20 rounded-lg hover:brightness-110 shadow-lg shadow-primary/20 transition-all h-9"
            >
              <Plus size={16} />
              Novo Chat
            </button>
          </div>
        }
      />
      <div className='flex-1 flex overflow-hidden'>
        <SettingsPanel />
        <WidgetPreview />
      </div>
    </div>
  )
}
