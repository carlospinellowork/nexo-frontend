import { Terminal, User } from "lucide-react";
import { useEffect, useRef } from "react";
import { useFlowStore } from "../store/flow.store";

export function SimulationChat() {
  const simulationLogs = useFlowStore((s) => s.simulationLogs);
  const mode = useFlowStore((s) => s.mode);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [simulationLogs]);

  if (mode !== "simulate") return null;

  return (
    <div className="absolute right-6 bottom-6 w-96 h-[500px] bg-panel/95 backdrop-blur-2xl border border-border-ui rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-500">
      <div className="p-5 border-b border-border-ui flex items-center gap-3 bg-white/5 shrink-0">
        <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse shadow-[0_0_12px_var(--color-primary)]" />
        <h3 className="text-[11px] font-black text-text-primary uppercase tracking-[0.2em]">
          Simulando Fluxo
        </h3>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-5 space-y-6 scroll-smooth"
      >
        {simulationLogs.map((log) => (
          <div
            key={log.id}
            className={`flex flex-col gap-2 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 ${log.type === "system" ? "items-center" : "items-start"
              }`}
          >
            {log.type === "system" ? (
              <div className="py-2 w-full flex items-center gap-4">
                <div className="h-px bg-border-ui flex-1 opacity-50" />
                <span className="text-[9px] text-text-secondary font-bold uppercase tracking-widest shrink-0 px-3 py-1 bg-white/5 rounded-full border border-border-ui">
                  {log.message}
                </span>
                <div className="h-px bg-border-ui flex-1 opacity-50" />
              </div>
            ) : (
              <div className="flex gap-3 items-start w-full">
                <div className={`w-8 h-8 flex items-center justify-center rounded-xl shrink-0 border shadow-inner ${log.type === 'action' ? 'bg-info/20 text-info border-info/30' : 'bg-primary/20 text-primary border-primary/30'
                  }`}>
                  {log.type === 'action' ? <Terminal size={14} /> : <User size={14} />}
                </div>
                <div className={`p-4 rounded-2xl text-[13px] leading-relaxed break-words border shadow-sm flex-1 ${log.type === 'action'
                  ? 'bg-info/10 border-info/10 text-info'
                  : 'bg-white/5 border-white/5 text-text-primary'
                  }`}>
                  {log.message}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 bg-white/5 border-t border-border-ui flex justify-center shrink-0">
        <div className="px-3 py-1 bg-white/5 rounded-lg text-[10px] text-text-secondary font-bold uppercase tracking-tighter opacity-50">
          Visualização em Tempo Real
        </div>
      </div>
    </div>
  );
}
