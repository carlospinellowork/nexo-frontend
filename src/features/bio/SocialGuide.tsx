import { useEffect, useState } from "react";
import { Button } from "../../shared/components/ui/Button";
import { Sheet } from "../../shared/components/ui/Sheet";
import { toast } from "../../shared/components/ui/toast-store";
import { Check, ChevronRight, Copy, ExternalLink, Link2 } from "../../shared/icons";
import { NETWORK_IDS, NETWORKS, type NetworkGuide, type SocialNetwork } from "./socialNetworks";

/** Texto com **negrito**. */
function Rich({ text }: { text: string }) {
  return text.split("**").map((part, i) => (i % 2 ? <b key={i} className="font-semibold">{part}</b> : part));
}

/** Desenho simples da tela de edição com o caminho até o campo certo. */
function EditMock({ url, mock }: { url: string; mock: NetworkGuide["mock"] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border-ui bg-white text-black shadow-card" aria-hidden>
      <div className="border-b border-black/5 py-2 text-center text-[13px] font-semibold">{mock.title}</div>
      {mock.rows.map(([label, value, highlight]) => (
        <div key={label} className={`flex items-center gap-2 border-b border-black/5 px-3 py-2 text-[12.5px] ${highlight ? "bg-primary/10" : ""}`}>
          <span className="w-16 shrink-0 text-black/50">{label}</span>
          <span className={`min-w-0 flex-1 truncate ${highlight ? "font-semibold text-primary-strong" : "text-black/80"}`}>{value}</span>
          {highlight && <ChevronRight size={14} className="text-primary-strong" />}
        </div>
      ))}
      <div className="flex items-center gap-2 bg-primary/5 px-3 py-2 text-[12px]">
        <Link2 size={14} className="shrink-0 text-primary-strong" />
        <span className="min-w-0 flex-1 truncate font-mono text-black/70">{url}</span>
      </div>
    </div>
  );
}

/** Passo a passo para pôr o link da bio no Instagram, TikTok, WhatsApp, Facebook, YouTube e X. */
export function SocialGuide({ url, network, open, onClose }: { url: string; network: SocialNetwork; open: boolean; onClose: () => void }) {
  const [current, setCurrent] = useState<SocialNetwork>(network);
  const [copied, setCopied] = useState(false);
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    if (open) setCurrent(network);
  }, [open, network]);
  useEffect(() => setOpened(false), [current]);

  const g = NETWORKS[current];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      toast.error("Não foi possível copiar. Selecione o endereço e copie à mão.");
    }
  };

  const step = (n: number, done: boolean, title: string, children: React.ReactNode) => (
    <li className="flex gap-3">
      <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] font-bold ${done ? "bg-success text-white" : "bg-primary/12 text-primary-strong"}`}>
        {done ? <Check size={15} /> : n}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <span className="text-[15px] font-semibold text-text-primary">{title}</span>
        {children}
      </div>
    </li>
  );
  const text = (c: React.ReactNode) => <p className="text-[13.5px] leading-snug text-text-secondary">{c}</p>;

  return (
    <Sheet open={open} title={`Colocar no ${g.label}`} onClose={onClose} width="md" footer={<Button size="lg" className="w-full" onClick={onClose}>Pronto</Button>}>
      <div role="tablist" aria-label="Rede social" className="-mx-1 mb-5 flex shrink-0 gap-1.5 overflow-x-auto px-1 pb-1">
        {NETWORK_IDS.map((id) => {
          const n = NETWORKS[id];
          const Icon = n.icon;
          const active = id === current;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setCurrent(id)}
              className={`flex h-10 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13.5px] font-semibold transition-colors md:h-9 ${
                active ? "bg-primary text-white" : "bg-panel-2 text-text-secondary hover:bg-panel-hover hover:text-text-primary"
              }`}
            >
              <Icon size={16} filled={active} /> {n.label}
            </button>
          );
        })}
      </div>
      <ol className="flex flex-col gap-5">
        {step(
          1,
          copied,
          "Copie o link da sua bio",
          <Button variant={copied ? "secondary" : "primary"} icon={copied ? Check : Copy} onClick={() => void copy()} className="w-full sm:w-fit">
            {copied ? "Link copiado" : "Copiar link"}
          </Button>,
        )}
        {step(
          2,
          opened,
          g.openTitle,
          g.open && (
            <a
              href={g.open.href}
              target="_blank"
              rel="noreferrer"
              onClick={() => setOpened(true)}
              className="nx-anim inline-flex h-11 w-full items-center justify-center gap-2 rounded-[11px] border border-border-ui bg-panel px-4 text-[14px] font-semibold text-text-primary hover:bg-panel-hover sm:w-fit"
            >
              <g.icon size={18} /> {g.open.label} <ExternalLink size={14} className="text-text-secondary" />
            </a>
          ),
        )}
        {step(
          3,
          false,
          g.whereTitle,
          <>
            <EditMock url={url} mock={g.mock} />
            {text(<Rich text={g.where} />)}
          </>,
        )}
        {step(4, false, "Confira", text(<Rich text={g.check} />))}
      </ol>
      {g.note && <p className="mt-5 rounded-xl bg-warning/14 px-3 py-2.5 text-[13px] leading-snug text-warning-strong"><Rich text={g.note} /></p>}
    </Sheet>
  );
}
