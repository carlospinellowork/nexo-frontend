import type { DragEvent } from "react";
import { useGetAiStatus } from "../../../api/queries/useGetAiStatus";
import { ADDABLE_BLOCKS, BLOCK_GROUPS } from "../catalog";
import type { NodeType } from "../contract";
import { useFlowStore } from "../store/flow.store";

export const DRAG_MIME = "application/reactflow";

/** Biblioteca de blocos à esquerda: clique para adicionar depois do bloco selecionado, ou arraste para o canvas. */
export function BlockLibrary() {
  const addFromLibrary = useFlowStore((s) => s.addFromLibrary);
  const { data: ai } = useGetAiStatus();

  const onDragStart = (event: DragEvent, type: NodeType) => {
    event.dataTransfer.setData(DRAG_MIME, type);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside id="tour-flow-blocks" className="absolute bottom-4 left-4 top-4 z-40 flex w-[232px] flex-col overflow-hidden rounded-3xl border border-border-ui bg-panel/92 shadow-float backdrop-blur-xl">
      <div className="px-4 pb-2 pt-4">
        <h3 className="text-[15px] font-bold tracking-tight text-text-primary">Blocos</h3>
        <p className="text-[12px] leading-snug text-text-secondary">Clique ou arraste para o fluxo</p>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-3">
        {BLOCK_GROUPS.map((group) => (
          <div key={group} className="pt-2">
            <p className="px-2 pb-1 text-[12px] font-semibold text-text-secondary">{group}</p>
            {ADDABLE_BLOCKS.filter((b) => b.group === group).map((b) => {
              const disabled = Boolean(b.needsAi && ai && !ai.configured);
              return (
                <button
                  key={b.type}
                  draggable={!disabled}
                  onDragStart={(e) => onDragStart(e, b.type)}
                  onClick={() => addFromLibrary(b.type)}
                  disabled={disabled}
                  title={disabled ? "A IA ainda não está configurada no servidor" : b.description}
                  className="flex w-full cursor-grab items-center gap-2.5 rounded-xl px-2 py-1.5 text-left transition-[background-color,transform] hover:bg-panel-hover active:scale-[0.97] active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px]"
                    style={{ background: `color-mix(in srgb, ${b.color} 14%, transparent)`, color: b.color }}
                  >
                    <b.icon size={16} strokeWidth={2.2} />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-[14px] font-medium text-text-primary">{b.name}</span>
                    <span className="truncate text-[11.5px] text-text-secondary">{b.description}</span>
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </aside>
  );
}
