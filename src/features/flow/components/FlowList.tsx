import type { Edge, Node } from "@xyflow/react";
import { ChevronRight, CornerDownRight, Plus, Repeat2 } from "lucide-react";
import { type ReactNode, useState } from "react";
import { useGetAiStatus } from "../../../api/queries/useGetAiStatus";
import { Sheet } from "../../../shared/components/ui/Sheet";
import { ADDABLE_BLOCKS, BLOCK_GROUPS, BLOCKS, blockSummary } from "../catalog";
import { type NodeType, nodeOutputs } from "../contract";
import { useFlowStore } from "../store/flow.store";
import { NodePropertiesPanel } from "./NodePropertiesPanel";

const handleOf = (h: string | null | undefined) => (h && h !== "source" ? h : null);

/** Bloco ligado a uma saída (handle) de outro bloco. */
function targetOf(edges: Edge[], sourceId: string, handle: string) {
  const e = edges.find((x) => x.source === sourceId && handleOf(x.sourceHandle) === handleOf(handle));
  return e?.target ?? null;
}

function labelOf(node: Node) {
  const def = BLOCKS[node.type as NodeType];
  return String(node.data.label ?? "") || def?.name || "Bloco";
}

function BlockCard({ node, onOpen, highlighted }: { node: Node; onOpen: () => void; highlighted: boolean }) {
  const def = BLOCKS[node.type as NodeType];
  const Icon = def?.icon;
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`nx-anim flex w-full items-center gap-3 rounded-xl border bg-panel p-3 text-left shadow-card transition-colors active:bg-panel-hover ${
        highlighted ? "border-primary ring-2 ring-primary/20" : "border-border-ui/70"
      }`}
    >
      {Icon && (
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"
          style={{ background: `color-mix(in srgb, ${def.color} 14%, transparent)`, color: def.color }}
        >
          <Icon size={18} strokeWidth={2.2} data-gesture="pop" />
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[14px] font-semibold text-text-primary">{labelOf(node)}</span>
        <span className="line-clamp-2 text-[12.5px] leading-snug text-text-secondary">{blockSummary(node.type as NodeType, node.data)}</span>
      </span>
      <ChevronRight size={17} className="shrink-0 text-text-secondary/60" />
    </button>
  );
}

/**
 * Fluxo no celular: em vez do canvas, a conversa em ordem, como uma lista. Onde ela se divide (botões,
 * condição, horário...), cada saída vira um ramo com o nome da opção. Tocar edita; "+" adiciona o próximo passo.
 */
export function FlowList() {
  const { nodes, edges, highlightedNodeIds, selectedNodeId, setSelectedNodeId, addNodeAfter } = useFlowStore();
  const { data: ai } = useGetAiStatus();
  const [adding, setAdding] = useState<{ sourceId: string; handle: string } | null>(null);
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const start = nodes.find((n) => n.type === "start");
  const shown = new Set<string>();

  const addButton = (sourceId: string, handle: string) => (
    <button
      type="button"
      onClick={() => setAdding({ sourceId, handle })}
      className="nx-anim flex h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-primary/40 text-[13.5px] font-semibold text-primary-strong active:bg-primary/8"
    >
      <Plus size={16} data-gesture="spin" /> Próximo passo
    </button>
  );

  // Ligação entre dois blocos: um "+" pequeno insere um passo no meio (os de baixo descem, como no canvas).
  const insertButton = (sourceId: string, handle: string) => (
    <div className="flex justify-center">
      <button
        type="button"
        onClick={() => setAdding({ sourceId, handle })}
        aria-label="Inserir um passo aqui"
        className="nx-anim relative flex h-7 w-7 items-center justify-center rounded-full border border-border-ui bg-panel text-text-secondary shadow-card active:bg-panel-hover"
      >
        <Plus size={14} data-gesture="spin" />
      </button>
    </div>
  );

  // Desenha a partir de um bloco: o cartão e, depois, cada saída (uma só segue em linha; várias viram ramos).
  const chain = (id: string, path: Set<string>): ReactNode => {
    const node = byId.get(id);
    if (!node) return null;
    if (path.has(id) || shown.has(id)) {
      return (
        <span className="flex items-center gap-1.5 rounded-lg bg-panel-2 px-2.5 py-2 text-[12.5px] font-medium text-text-secondary">
          <Repeat2 size={14} className="shrink-0" /> {path.has(id) ? "Volta para" : "Continua em"} “{labelOf(node)}”
        </span>
      );
    }
    shown.add(id);
    const nextPath = new Set(path).add(id);
    const def = BLOCKS[node.type as NodeType];
    const outputs = nodeOutputs(node.type as NodeType, node.data, def?.color ?? "");
    return (
      <div className="flex flex-col gap-2">
        <BlockCard node={node} highlighted={highlightedNodeIds.includes(node.id)} onOpen={() => setSelectedNodeId(node.id)} />
        {outputs.length === 1 && (
          <div className="flex flex-col gap-2">
            {(() => {
              const t = targetOf(edges, node.id, outputs[0]!.id);
              return t ? (
                <>
                  {insertButton(node.id, outputs[0]!.id)}
                  {chain(t, nextPath)}
                </>
              ) : (
                addButton(node.id, outputs[0]!.id)
              );
            })()}
          </div>
        )}
        {outputs.length > 1 &&
          outputs.map((o) => {
            const t = targetOf(edges, node.id, o.id);
            return (
              <div key={o.id} className="ml-2 flex flex-col gap-2 border-l-2 pl-3" style={{ borderColor: `color-mix(in srgb, ${o.color} 45%, transparent)` }}>
                <span className="flex items-center gap-1 text-[12px] font-semibold" style={{ color: o.color }}>
                  <CornerDownRight size={13} /> {o.label ?? "Saída"}
                </span>
                {t ? (
                  <>
                    {insertButton(node.id, o.id)}
                    {chain(t, nextPath)}
                  </>
                ) : (
                  addButton(node.id, o.id)
                )}
              </div>
            );
          })}
      </div>
    );
  };

  const tree = start ? chain(start.id, new Set()) : null;
  const loose = nodes.filter((n) => !shown.has(n.id));
  const selected = nodes.find((n) => n.id === selectedNodeId);

  const pick = (type: NodeType) => {
    if (!adding) return;
    const id = addNodeAfter(adding.sourceId, adding.handle, type);
    setAdding(null);
    if (id) setSelectedNodeId(id);
  };

  return (
    <div className="h-full overflow-y-auto px-3 pb-6 pt-3">
      <div className="mx-auto flex w-full max-w-md flex-col gap-2">
        {tree}
        {loose.length > 0 && (
          <section className="mt-6 flex flex-col gap-2">
            <h2 className="px-1 text-[13px] font-semibold text-text-secondary">Blocos soltos (fora da conversa)</h2>
            {loose.map((n) => (
              <BlockCard key={n.id} node={n} highlighted={false} onOpen={() => setSelectedNodeId(n.id)} />
            ))}
          </section>
        )}
      </div>

      <Sheet open={!!selected} title={selected ? labelOf(selected) : "Bloco"} onClose={() => setSelectedNodeId(null)}>
        {selected && <NodePropertiesPanel inSheet />}
      </Sheet>

      <Sheet open={!!adding} title="Próximo passo" onClose={() => setAdding(null)}>
        <div className="flex flex-col gap-3">
          {BLOCK_GROUPS.map((group) => {
            const blocks = ADDABLE_BLOCKS.filter((b) => b.group === group && !(b.needsAi && ai && !ai.configured));
            if (!blocks.length) return null;
            return (
              <div key={group} className="flex flex-col gap-1">
                <p className="px-1 text-[12px] font-semibold text-text-secondary">{group}</p>
                {blocks.map((b) => (
                  <button
                    key={b.type}
                    type="button"
                    onClick={() => pick(b.type)}
                    className="nx-anim flex min-h-12 items-center gap-3 rounded-xl px-2 py-2 text-left active:bg-panel-hover"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]" style={{ background: `color-mix(in srgb, ${b.color} 14%, transparent)`, color: b.color }}>
                      <b.icon size={18} strokeWidth={2.2} data-gesture="pop" />
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="text-[14px] font-semibold text-text-primary">{b.name}</span>
                      <span className="truncate text-[12.5px] text-text-secondary">{b.description}</span>
                    </span>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </Sheet>
    </div>
  );
}
