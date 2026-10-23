import { Handle, type NodeProps, Position } from "@xyflow/react";
import { Plus } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useState } from "react";
import { AddBlockMenu } from "../components/AddBlockMenu";
import { BLOCKS, blockSummary } from "../catalog";
import { nodeOutputs, type NodeType } from "../contract";
import { useFlowStore } from "../store/flow.store";

const handleStyle = (color: string) => ({
  width: 12,
  height: 12,
  background: "var(--nx-surface)",
  border: `2.5px solid ${color}`,
});

/** Card de qualquer bloco do fluxo. Os ids dos handles fazem parte do contrato com o motor. */
export function BlockNode({ id, type, data, selected }: NodeProps) {
  const def = BLOCKS[type as NodeType];
  const highlighted = useFlowStore((s) => s.highlightedNodeIds.includes(id));
  const edges = useFlowStore((s) => s.edges);
  const addNodeAfter = useFlowStore((s) => s.addNodeAfter);
  const [menuFor, setMenuFor] = useState<string | null>(null);

  if (!def) return <div className="rounded-xl bg-danger/14 p-3 text-[13px] text-danger-strong">Bloco desconhecido: {type}</div>;

  const outputs = nodeOutputs(def.type, data, def.color);
  const ring = highlighted || selected;
  const connected = (handle: string) =>
    edges.some((e) => e.source === id && (e.sourceHandle ?? "source") === handle);
  const showLabels = outputs.length > 1;
  const Icon = def.icon;

  return (
    <div
      className="group relative w-[264px] rounded-[20px] bg-panel px-4 pb-4 pt-3.5 transition-shadow"
      style={{
        boxShadow: ring
          ? `0 0 0 2px ${def.color}, 0 0 0 7px color-mix(in srgb, ${def.color} 16%, transparent), var(--nx-shadow-lg)`
          : "var(--nx-shadow)",
      }}
    >
      {def.type !== "start" && <Handle type="target" position={Position.Top} id="target" style={handleStyle(def.color)} />}

      <div className="mb-1 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.06em]" style={{ color: def.color }}>
        <Icon size={14} strokeWidth={2.4} />
        {def.name}
      </div>
      <div className="truncate text-[15px] font-semibold text-text-primary">{String(data.label || def.name)}</div>
      <div className="mt-1 line-clamp-2 text-[13px] leading-snug text-text-secondary">{blockSummary(def.type, data)}</div>

      {showLabels && (
        <div className="-mx-1 mt-3 flex justify-around gap-1 text-[11px] font-semibold">
          {outputs.map((o) => (
            <span key={o.id} className="min-w-0 flex-1 truncate text-center" style={{ color: o.color }} title={o.label}>
              {o.label}
            </span>
          ))}
        </div>
      )}

      {outputs.map((o, i) => {
        const left = outputs.length > 1 ? `${((i + 0.5) / outputs.length) * 100}%` : "50%";
        return (
          <div key={o.id}>
            <Handle type="source" position={Position.Bottom} id={o.id} style={{ ...handleStyle(o.color), left }} />
            {!connected(o.id) && (
              <div className="nodrag nopan absolute top-full" style={{ left, transform: "translate(-50%, 14px)" }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuFor(menuFor === o.id ? null : o.id);
                  }}
                  aria-label={`Adicionar bloco depois de ${o.label ?? def.name}`}
                  title="Adicionar o próximo bloco"
                  className={`flex h-7 w-7 items-center justify-center rounded-full border border-border-ui bg-panel text-primary shadow-card transition-all hover:scale-110 hover:border-primary ${
                    selected || menuFor === o.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  <Plus size={16} strokeWidth={2.4} />
                </button>
                <AnimatePresence>
                  {menuFor === o.id && (
                    <AddBlockMenu
                      onClose={() => setMenuFor(null)}
                      onPick={(t) => {
                        setMenuFor(null);
                        addNodeAfter(id, o.id, t);
                      }}
                    />
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
