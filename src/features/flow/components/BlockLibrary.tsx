import { motion } from "motion/react";
import { type DragEvent, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "../../../shared/icons";
import { fold } from "../../landing/schedule";
import { useGetAiStatus } from "../../../api/queries/useGetAiStatus";
import { ADDABLE_BLOCKS, BLOCK_GROUPS } from "../catalog";
import type { NodeType } from "../contract";
import { useFlowStore } from "../store/flow.store";

export const DRAG_MIME = "application/reactflow";

const COLLAPSED_KEY = "nexo:flow-blocks-collapsed";
function readCollapsed() {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
}

/** Biblioteca de blocos à esquerda: clique para adicionar depois do bloco selecionado, ou arraste para o canvas. */
export function BlockLibrary() {
  const addFromLibrary = useFlowStore((s) => s.addFromLibrary);
  const { data: ai } = useGetAiStatus();

  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [query, setQuery] = useState("");
  const toggle = () => {
    setCollapsed(!collapsed);
    try {
      localStorage.setItem(COLLAPSED_KEY, collapsed ? "0" : "1");
    } catch {
      /* sem armazenamento: só não lembra */
    }
  };
  const words = fold(query).split(/\s+/).filter(Boolean);
  const visible = ADDABLE_BLOCKS.filter((b) => !(b.needsAi && ai && !ai.configured) && words.every((w) => fold(`${b.name} ${b.description}`).includes(w)));

  const onDragStart = (event: DragEvent, type: NodeType) => {
    event.dataTransfer.setData(DRAG_MIME, type);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <motion.aside id="tour-flow-blocks" layout transition={{ type: "spring", stiffness: 420, damping: 36 }} style={{ width: collapsed ? 60 : 248 }} className="absolute bottom-4 left-4 top-4 z-40 flex flex-col overflow-hidden rounded-2xl border border-border-ui bg-panel/92 shadow-float backdrop-blur-xl">
      <div className={`flex items-center gap-1 ${collapsed ? "justify-center p-2" : "px-3 pb-1 pt-3"}`}>
        {!collapsed && <h3 className="flex-1 text-[15px] font-bold tracking-tight text-text-primary">Blocos</h3>}
        <button type="button" aria-label={collapsed ? "Mostrar a lista de blocos" : "Recolher a lista de blocos"} title={collapsed ? "Mostrar a lista de blocos" : "Recolher"} onClick={toggle} className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary hover:bg-panel-hover">
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
      {!collapsed && (
        <div className="px-3 pb-1">
          <div className="flex h-9 items-center gap-2 rounded-xl bg-panel-2 px-2.5">
            <Search size={15} className="shrink-0 text-text-secondary" />
            <input aria-label="Procurar bloco" value={query} placeholder="Procurar bloco" onChange={(e) => setQuery(e.target.value)} className="min-w-0 flex-1 bg-transparent text-[13.5px] text-text-primary outline-none placeholder:text-text-secondary" />
          </div>
        </div>
      )}
      <div className={`flex-1 overflow-y-auto pb-3 ${collapsed ? "px-1.5" : "px-2"}`}>
        {BLOCK_GROUPS.map((group) => {
          const blocks = visible.filter((b) => b.group === group);
          if (!blocks.length) return null;
          return (
            <div key={group} className="pt-2">
              {!collapsed && <p className="px-2 pb-1 text-[12px] font-semibold text-text-secondary">{group}</p>}
              {blocks.map((b) => (
                <button key={b.type} draggable onDragStart={(e) => onDragStart(e, b.type)} onClick={() => addFromLibrary(b.type)} aria-label={b.name} title={collapsed ? `${b.name}: ${b.description}` : b.description} className={`flex w-full cursor-grab items-center gap-2.5 rounded-xl py-1.5 text-left transition-[background-color,transform] hover:bg-panel-hover active:scale-[0.98] active:cursor-grabbing ${collapsed ? "justify-center px-0" : "px-2"}`}>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px]" style={{ background: `color-mix(in srgb, ${b.color} 14%, transparent)`, color: b.color }}>
                    <b.icon size={16} strokeWidth={2.2} />
                  </span>
                  {!collapsed && (
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-[14px] font-medium text-text-primary">{b.name}</span>
                      <span className="truncate text-[11.5px] text-text-secondary">{b.description}</span>
                    </span>
                  )}
                </button>
              ))}
            </div>
          );
        })}
        {!collapsed && !visible.length && <p className="px-2 pt-3 text-[13px] text-text-secondary">Nenhum bloco com esse nome.</p>}
      </div>
    </motion.aside>
  );
}
