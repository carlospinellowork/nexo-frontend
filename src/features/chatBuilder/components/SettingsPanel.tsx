import { AlignLeft, AlignRight, Circle, Mail, MessageCircle, Sparkles, Square, SquareDot } from "lucide-react";
import type { ReactNode } from "react";
import { Segmented } from "../../../shared/components/ui/Segmented";
import { inputClass } from "../../../shared/components/ui/styles";
import { type ChatSettings, useChatBuilderStore } from "../store/chat-builder-store";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-3xl bg-panel p-5 shadow-card">
      <h3 className="text-[15px] font-bold text-text-primary">{title}</h3>
      {children}
    </section>
  );
}

function ColorField({ label, field }: { label: string; field: keyof ChatSettings }) {
  const value = useChatBuilderStore((s) => s.draft[field] as string);
  const setSetting = useChatBuilderStore((s) => s.setSetting);
  return (
    <label className="flex items-center justify-between gap-3">
      <span className="text-[14px] text-text-primary">{label}</span>
      <span className="flex items-center gap-2">
        <input
          value={value.toUpperCase()}
          onChange={(e) => setSetting(field, e.target.value)}
          className="h-9 w-24 rounded-lg border border-border-ui bg-panel-2 px-2 text-center font-mono text-[13px] uppercase text-text-primary outline-none focus:border-primary"
          maxLength={7}
          aria-label={`${label} (hexadecimal)`}
        />
        <span className="relative h-9 w-9 overflow-hidden rounded-xl border border-border-ui shadow-card" style={{ backgroundColor: value }}>
          <input
            type="color"
            value={value}
            onChange={(e) => setSetting(field, e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            aria-label={label}
          />
        </span>
      </span>
    </label>
  );
}

export function SettingsPanel() {
  const { name, draft, setName, setSetting } = useChatBuilderStore();

  return (
    <div className="flex w-[360px] shrink-0 flex-col gap-4 overflow-y-auto border-r border-border-ui p-5">
      <Section title="Identificação">
        <label className="flex flex-col gap-2">
          <span className="text-[13px] font-semibold text-text-secondary">Nome interno do chat</span>
          <input className={inputClass} value={name} maxLength={80} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-[13px] font-semibold text-text-secondary">Nome do assistente (o cliente vê)</span>
          <input className={inputClass} value={draft.botName} maxLength={40} onChange={(e) => setSetting("botName", e.target.value)} placeholder="Ex.: Ana, da Clínica Sorriso" />
        </label>
        <p className="text-[13px] leading-snug text-text-secondary">O que o assistente fala é definido em Fluxos.</p>
      </Section>

      <Section title="Botão do site">
        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-semibold text-text-secondary">Ícone</span>
          <Segmented
            label="Ícone do botão"
            fullWidth
            value={draft.buttonIcon}
            onChange={(v) => setSetting("buttonIcon", v)}
            options={[
              { value: "default", label: "Balão", icon: MessageCircle },
              { value: "sparkles", label: "IA", icon: Sparkles },
              { value: "message", label: "Carta", icon: Mail },
            ]}
          />
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-semibold text-text-secondary">Formato</span>
          <Segmented
            label="Formato do botão"
            fullWidth
            value={draft.borderRadius}
            onChange={(v) => setSetting("borderRadius", v)}
            options={[
              { value: "full", label: "Círculo", icon: Circle },
              { value: "medium", label: "Suave", icon: SquareDot },
              { value: "none", label: "Reto", icon: Square },
            ]}
          />
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-semibold text-text-secondary">Posição na tela</span>
          <Segmented
            label="Posição"
            fullWidth
            value={draft.position}
            onChange={(v) => setSetting("position", v)}
            options={[
              { value: "left", label: "Esquerda", icon: AlignLeft },
              { value: "right", label: "Direita", icon: AlignRight },
            ]}
          />
        </div>
        <ColorField label="Cor principal" field="mainColor" />
      </Section>

      <Section title="Cores da conversa">
        <ColorField label="Cabeçalho" field="headerBackgroundColor" />
        <ColorField label="Texto do cabeçalho" field="headerTextColor" />
        <ColorField label="Balão do cliente" field="userBubbleColor" />
        <ColorField label="Balão do assistente" field="botBubbleColor" />
        <ColorField label="Texto do assistente" field="botTextColor" />
      </Section>
    </div>
  );
}
