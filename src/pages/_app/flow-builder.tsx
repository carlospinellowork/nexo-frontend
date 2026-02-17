import { Play } from "lucide-react";
import { useState } from "react";

import { createFileRoute } from "@tanstack/react-router";

import { useNavigate } from "@tanstack/react-router";
import { useChatBuilderStore } from "../../features/chatBuilder/store/chat-builder-store";
import { FlowCanvas } from "../../features/flow/FlowCanvas";
import { useFlowStore } from "../../features/flow/store/flow.store";
import { Header } from "../../shared/components/layout/Header";

export const Route = createFileRoute("/_app/flow-builder")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const {
    flowName,
    flowSuffix,
    setFlowName,
    setFlowSuffix,
    nodes,
    setActiveNodeId,
    selectedChatId,
    setSelectedChatId,
  } = useFlowStore();

  const { chats } = useChatBuilderStore();

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingSuffix, setIsEditingSuffix] = useState(false);
  const [startAtNodeId, setStartAtNodeId] = useState<string>("");

  const handleStartSimulation = () => {
    if (startAtNodeId) {
      setActiveNodeId(startAtNodeId);
    }
    navigate({ to: "/simulate" });
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title={
          isEditingName ? (
            <input
              autoFocus
              className="bg-transparent border-none outline-none font-bold text-base text-text-primary focus:ring-0 p-0 w-auto min-w-25"
              value={flowName}
              onChange={(e) => setFlowName(e.target.value)}
              onBlur={() => setIsEditingName(false)}
              onKeyDown={(e) => e.key === "Enter" && setIsEditingName(false)}
            />
          ) : (
            <span
              onClick={() => setIsEditingName(true)}
              className="cursor-pointer hover:text-primary transition-colors"
            >
              {flowName}
            </span>
          )
        }
        subtitle={
          isEditingSuffix ? (
            <input
              autoFocus
              className="bg-transparent border-none outline-none font-semibold text-[10px] text-text-secondary uppercase tracking-widest focus:ring-0 p-0 w-auto"
              value={flowSuffix}
              onChange={(e) => setFlowSuffix(e.target.value)}
              onBlur={() => setIsEditingSuffix(false)}
              onKeyDown={(e) => e.key === "Enter" && setIsEditingSuffix(false)}
            />
          ) : (
            <span
              onClick={() => setIsEditingSuffix(true)}
              className="cursor-pointer hover:text-primary transition-colors uppercase"
            >
              {flowSuffix}
            </span>
          )
        }
        tools={<></>}
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-panel border border-border-ui rounded-lg overflow-hidden h-9">
              <div className="px-3 border-r border-border-ui h-full flex items-center bg-white/5">
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-tighter">
                  Configuração do Chat:
                </span>
              </div>
              <select
                value={selectedChatId || ""}
                onChange={(e) => setSelectedChatId(e.target.value)}
                className="bg-transparent border-none outline-none text-xs font-medium px-2 py-1 pr-8 text-text-primary appearance-none cursor-pointer hover:bg-white/5 transition-colors h-full min-w-30"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 8px center",
                  backgroundSize: "12px",
                }}
              >
                <option value="">Padrão (Builder)</option>
                {chats.map((chat) => (
                  <option key={chat.id} value={chat.id}>
                    {chat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center bg-panel border border-border-ui rounded-lg overflow-hidden h-9">
              <div className="px-3 border-r border-border-ui h-full flex items-center bg-white/5">
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-tighter">
                  Começar em:
                </span>
              </div>
              <select
                value={startAtNodeId}
                onChange={(e) => setStartAtNodeId(e.target.value)}
                className="bg-transparent border-none outline-none text-xs font-medium px-2 py-1 pr-8 text-text-primary appearance-none cursor-pointer hover:bg-white/5 transition-colors h-full min-w-30"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 8px center",
                  backgroundSize: "12px",
                }}
              >
                <option value="">Nó Inicial</option>
                {nodes
                  .filter((n) => n.type !== "start" && n.type !== "end")
                  .map((node) => (
                    <option key={node.id} value={node.id}>
                      {node.data.label as string}
                    </option>
                  ))}
              </select>
            </div>

            <button
              onClick={handleStartSimulation}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold border border-primary/20 rounded-lg hover:brightness-110 shadow-lg shadow-primary/20 transition-all h-9"
            >
              <Play size={16} fill="currentColor" />
              Simular Fluxo
            </button>
          </div>
        }
      />
      <div className="flex-1 relative">
        <FlowCanvas />
      </div>
    </div>
  );
}
