import { Minus, Play, Plus, Redo2, Send, Undo2 } from "lucide-react";

import { createFileRoute } from "@tanstack/react-router";

import { FlowCanvas } from "../../features/flow/FlowCanvas";
import { useFlowStore } from "../../features/flow/store/flow.store";
import { Header } from "../../shared/components/layout/Header";

export const Route = createFileRoute("/_app/flow-builder")({
  component: RouteComponent,
});

function RouteComponent() {
  const { setMode } = useFlowStore();

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Onboarding Pro"
        subtitle="v2.1 • Rascunho"
        tools={
          <div className="flex items-center gap-4 bg-panel/50 p-1 rounded-lg border border-border-ui">
            <div className="flex items-center border-r border-border-ui pr-2 gap-1">
              <button className="p-1.5 hover:bg-panel rounded text-text-secondary hover:text-text-primary transition-colors">
                <Undo2 size={16} />
              </button>
              <button className="p-1.5 hover:bg-panel rounded text-text-secondary hover:text-text-primary transition-colors">
                <Redo2 size={16} />
              </button>
            </div>
            <div className="flex items-center gap-2 px-2">
              <button className="p-1 hover:text-primary text-text-secondary transition-colors">
                <Minus size={16} />
              </button>
              <span className="text-xs font-medium text-text-secondary w-10 text-center">
                100%
              </span>
              <button className="p-1 hover:text-primary text-text-secondary transition-colors">
                <Plus size={16} />
              </button>
            </div>
          </div>
        }
        actions={
          <div className="flex items-center gap-3">
            <button onClick={() => setMode('simulate')} className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border-ui rounded-lg hover:bg-panel transition-all text-text-primary">
              <Play size={16} />
              Simular
            </button>
            <button onClick={() => setMode('publish')} className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-primary text-bg-start rounded-lg hover:brightness-110 shadow-lg shadow-primary/20 transition-all">
              <Send size={16} />
              Publicar
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
