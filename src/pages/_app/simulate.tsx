import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, RefreshCcw, Terminal } from "lucide-react";
import { useEffect } from "react";

import { useChatBuilderStore } from "../../features/chatBuilder/store/chat-builder-store";
import { ExecutionPath } from "../../features/flow/components/ExecutionPath";
import { SimulationChat } from "../../features/flow/components/SimulationChat";
import { useFlowExecutor } from "../../features/flow/engine/flow.executor";
import { useFlowStore } from "../../features/flow/store/flow.store";
import { Header } from "../../shared/components/layout/Header";

export const Route = createFileRoute("/_app/simulate")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const {
    setMode,
    flowName,
    flowSuffix,
    nodes,
    setActiveNodeId,
    selectedChatId,
    setSelectedChatId,
  } = useFlowStore();

  const { chats } = useChatBuilderStore();

  useFlowExecutor();

  useEffect(() => {
    setMode("simulate");
  }, [setMode]);

  const handleRestart = () => {
    setMode("edit");
    setTimeout(() => setMode("simulate"), 50);
  };

  const handleJumpToNode = (id: string) => {
    if (!id) return;
    setActiveNodeId(id);
  };

  if (!selectedChatId) {
    return (
      <div className="flex flex-col h-full bg-bg-end/30">
        <Header
          title="Simulador"
          subtitle="Escolha um chat para começar a simulação"
        />
        <div className="flex-1 overflow-y-auto p-12">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-black text-text-primary mb-8 tracking-tight">Meus Chats</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChatId(chat.id)}
                  className="group relative flex flex-col text-left bg-panel/40 border border-border-ui rounded-[32px] p-8 hover:bg-panel/60 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 overflow-hidden"
                >
                  <div
                    className="absolute top-0 right-0 w-32 h-32 opacity-10 group-hover:opacity-20 transition-opacity blur-3xl rounded-full"
                    style={{ backgroundColor: chat.mainColor }}
                  />

                  <div className="flex items-center gap-4 mb-6">
                    <div
                      style={{ backgroundColor: chat.mainColor }}
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
                    >
                      <Terminal size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-text-primary group-hover:text-primary transition-colors">
                        {chat.name}
                      </h3>
                      <span className="text-xs font-medium text-text-secondary uppercase tracking-widest opacity-60">
                        {chat.botName}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-text-secondary line-clamp-2 mb-8 leading-relaxed">
                    "{chat.welcomeMessage}"
                  </p>

                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex -space-x-2">
                      <div style={{ backgroundColor: chat.headerBackgroundColor }} className="w-4 h-4 rounded-full border border-bg-start" />
                      <div style={{ backgroundColor: chat.userBubbleColor }} className="w-4 h-4 rounded-full border border-bg-start" />
                      <div style={{ backgroundColor: chat.mainColor }} className="w-4 h-4 rounded-full border border-bg-start" />
                    </div>
                    <span className="text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                      Simular Fluxo →
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-bg-end/30">
      <Header
        title={flowName}
        subtitle={flowSuffix}
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedChatId(null)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold border border-border-ui rounded-lg hover:bg-panel transition-all text-text-secondary hover:text-text-primary h-9"
            >
              <ArrowLeft size={14} />
              Lista de Chats
            </button>

            <div className="flex items-center bg-panel border border-border-ui rounded-lg overflow-hidden h-9">
              <div className="px-3 border-r border-border-ui h-full flex items-center bg-white/5">
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-tighter">
                  Chat Ativo:
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
                  Pular para:
                </span>
              </div>
              <select
                value=""
                onChange={(e) => handleJumpToNode(e.target.value)}
                className="bg-transparent border-none outline-none text-xs font-medium px-2 py-1 pr-8 text-text-primary appearance-none cursor-pointer hover:bg-white/5 transition-colors h-full min-w-30"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 8px center",
                  backgroundSize: "12px",
                }}
              >
                <option value="">Selecione...</option>
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
              onClick={handleRestart}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold border border-border-ui rounded-lg hover:bg-panel transition-all text-text-secondary hover:text-text-primary h-9"
            >
              <RefreshCcw size={14} />
              Reiniciar
            </button>
            <button
              onClick={() => navigate({ to: "/flow-builder" })}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border-ui rounded-lg hover:bg-panel transition-all text-text-primary"
            >
              <ArrowLeft size={16} />
              Voltar ao Editor
            </button>
          </div>
        }
      />

      <div className="flex-1 flex overflow-hidden p-6 gap-6">
        <div className="w-80 flex flex-col gap-6 animate-in slide-in-from-left-8 duration-700">
          <div className="bg-panel/40 border border-border-ui rounded-3xl p-6 shadow-sm">
            <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-4">
              Status da Simulação
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Conexão</span>
                <div className="flex items-center gap-2 text-success">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Estável
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <ExecutionPath />
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center relative animate-in zoom-in-95 duration-700">
          <div className="w-full max-w-2xl h-full bg-panel/30 border border-border-ui rounded-[32px] overflow-hidden shadow-2xl flex flex-col backdrop-blur-md">
            <SimulationChat embedded />
          </div>
        </div>

        <div className="w-80 flex flex-col gap-6 animate-in slide-in-from-right-8 duration-700">
          <div className="bg-panel/40 border border-border-ui rounded-3xl p-6 shadow-sm flex flex-col h-full overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
              <Terminal size={16} className="text-primary" />
              <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">
                Contexto da Sessão
              </h4>
            </div>

            {/* <div className="flex-1 bg-black/20 rounded-2xl p-4 font-mono text-[11px] text-text-secondary overflow-y-auto space-y-2">
              <div className="text-primary/70">{"{"}</div>
              <div className="pl-4">"user_id": "usr_9421",</div>
              <div className="pl-4">"platform": "whatsapp",</div>
              <div className="pl-4">"language": "pt-BR",</div>
              <div className="pl-4">"variables": {"{"}</div>
              <div className="pl-8 text-text-primary">"nome": "Usuário Teste",</div>
              <div className="pl-8 text-text-primary">"saldo": 150.00</div>
              <div className="pl-4">{"}"},</div>
              <div className="pl-4">"current_step": "verification"</div>
              <div className="text-primary/70">{"}"}</div>
            </div> */}

            <div className="mt-4 pt-4 border-t border-border-ui/50">
              <button className="w-full py-2 bg-white/5 hover:bg-white/10 border border-border-ui/50 rounded-xl text-[10px] font-bold uppercase tracking-widest text-text-secondary transition-all">
                Inspecionar Variáveis
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
