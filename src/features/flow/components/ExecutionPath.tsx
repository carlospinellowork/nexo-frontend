import type { Node } from "@xyflow/react";
import { CheckCircle2, CircleDot, Route } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { BLOCKS } from "../catalog";
import type { NodeType } from "../contract";

interface ExecutionPathProps {
  nodes: Node[];
  /** Todos os nós executados na conversa, em ordem */
  path: string[];
  currentNodeId: string | null;
  waiting: boolean;
}

export function ExecutionPath({ nodes, path, currentNodeId, waiting }: ExecutionPathProps) {
  const byId = new Map(nodes.map((n) => [n.id, n]));

  return (
    <div className="flex h-full flex-col rounded-3xl bg-panel p-5 shadow-card">
      <h3 className="mb-4 flex items-center gap-2 text-[15px] font-bold text-text-primary">
        <Route size={18} className="text-primary" />
        Caminho percorrido
      </h3>
      <ol className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {path.length === 0 && <li className="text-[14px] text-text-secondary">Os blocos executados aparecem aqui.</li>}
        <AnimatePresence initial={false}>
          {path.map((id, index) => {
            const node = byId.get(id);
            const isCurrent = waiting && id === currentNodeId && index === path.length - 1;
            return (
              <motion.li
                key={`${id}-${index}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.04 * (index % 6) }}
                className={`flex items-center gap-3 rounded-xl px-2.5 py-2 ${isCurrent ? "bg-primary/10" : ""}`}
              >
                {isCurrent ? (
                  <CircleDot size={18} className="shrink-0 animate-pulse text-primary" />
                ) : (
                  <CheckCircle2 size={18} className="shrink-0 text-success" />
                )}
                <span className={`flex-1 truncate text-[14px] font-medium ${isCurrent ? "text-primary-strong" : "text-text-primary"}`}>
                  {String(node?.data.label || id)}
                </span>
                <span className="shrink-0 text-[12px] text-text-secondary">{BLOCKS[node?.type as NodeType]?.name ?? node?.type ?? "?"}</span>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ol>
      {waiting && <p className="mt-3 text-[13px] text-text-secondary">Aguardando a resposta do cliente…</p>}
    </div>
  );
}
