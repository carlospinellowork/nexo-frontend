import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  CheckCircle2,
  ChevronDown,
  Download,
  ExternalLink,
  FileText,
  Globe,
  Loader2,
  MessageCircle,
  Monitor,
  Pencil,
  Plus,
  QrCode,
  Rocket,
  Save,
  Settings2,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import QRCode from "qrcode";
import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { apiErrorMessage } from "../../api/instance";
import { useAiEditLandingPage } from "../../api/mutations/useAiEditLandingPage";
import { usePublishLandingPage } from "../../api/mutations/usePublishLandingPage";
import { type UpdateLandingPagePayload, useUpdateLandingPage } from "../../api/mutations/useUpdateLandingPage";
import { useGetAiStatus } from "../../api/queries/useGetAiStatus";
import { useGetChats } from "../../api/queries/useGetChats";
import { useGetLandingClicks } from "../../api/queries/useGetLandingClicks";
import { useGetLandingPage } from "../../api/queries/useGetLandingPage";
import { LandingRenderer } from "../../features/landing/components/LandingRenderer";
import { SectionEditor } from "../../features/landing/components/SectionEditor";
import { ThemePicker } from "../../features/landing/components/ThemePicker";
import { type LandingPageRecord, type LandingPageSettings, type LandingSection, type LandingTheme, SECTION_LABELS } from "../../features/landing/contract";
import { startTour } from "../../features/tour/driver-service";
import { HelpButton } from "../../features/tour/HelpButton";
import { Badge } from "../../shared/components/ui/Badge";
import { Button, IconButton } from "../../shared/components/ui/Button";
import { EmptyState } from "../../shared/components/ui/EmptyState";
import { Segmented } from "../../shared/components/ui/Segmented";
import { inputClass, selectClass, textareaClass } from "../../shared/components/ui/styles";
import { Switch } from "../../shared/components/ui/Switch";
import { toast } from "../../shared/components/ui/toast-store";

export const Route = createFileRoute("/_app/landing-builder")({
  validateSearch: (search: Record<string, unknown>): { id?: string } => ({
    id: typeof search.id === "string" ? search.id : undefined,
  }),
  component: LandingBuilderPage,
});

interface Draft {
  title: string;
  slug: string;
  theme: LandingTheme;
  sections: LandingSection[];
  settings: LandingPageSettings;
  chatId: string | null;
}

const toDraft = (p: LandingPageRecord): Draft => ({
  title: p.title,
  slug: p.slug,
  theme: p.theme,
  sections: p.sections,
  settings: p.settings,
  chatId: p.chatId,
});

const AI_SUGGESTIONS = ["Deixe o texto mais formal", "Escreva para quem tem pressa", "Adicione uma pergunta sobre formas de pagamento"];

function LandingBuilderPage() {
  const navigate = useNavigate();
  const { id } = Route.useSearch();
  const { data: page, isLoading, isError } = useGetLandingPage(id);
  const { data: chats } = useGetChats();
  const { data: ai } = useGetAiStatus();
  const { data: clickStats } = useGetLandingClicks(id);
  const { mutateAsync: updatePage, isPending: saving } = useUpdateLandingPage();
  const { mutateAsync: publishPage, isPending: publishing } = usePublishLandingPage();
  const { mutateAsync: aiEdit, isPending: aiWorking } = useAiEditLandingPage();

  // A bio tem editor próprio: quem abrir o editor de seções com uma bio vai para "Minha Bio".
  useEffect(() => {
    if (page?.settings.layout === "bio") void navigate({ to: "/minha-bio", replace: true });
  }, [page, navigate]);

  const [draft, setDraft] = useState<Draft | null>(null);
  const [dirty, setDirty] = useState(false);
  const [tab, setTab] = useState<"sections" | "ai" | "page">("sections");
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [instruction, setInstruction] = useState("");
  // Em telas estreitas o editor e a prévia se alternam (não cabem lado a lado).
  const [pane, setPane] = useState<"edit" | "preview">("edit");

  // Carrega a versão do servidor uma vez por página; depois a tela é a fonte do rascunho.
  const loadedFor = useRef<string | null>(null);
  useEffect(() => {
    if (page && loadedFor.current !== page.id) {
      loadedFor.current = page.id;
      setDraft(toDraft(page));
      setDirty(false);
      setExpanded(page.sections[0]?.id ?? null);
      setViewport(page.settings.layout === "bio" ? "mobile" : "desktop");
    }
  }, [page]);

  useEffect(() => {
    const timer = setTimeout(() => startTour("landing_builder"), 700);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const change = useCallback((patch: Partial<Draft>) => {
    setDraft((d) => (d ? { ...d, ...patch } : d));
    setDirty(true);
  }, []);
  const setSections = (fn: (sections: LandingSection[]) => LandingSection[]) => draft && change({ sections: fn(draft.sections) });

  /** Salva o rascunho se houver mudanças. Devolve false se o servidor recusou. */
  const ensureSaved = async (notify = false) => {
    if (!draft || !page) return false;
    if (!dirty) return true;
    const payload: UpdateLandingPagePayload = { title: draft.title, theme: draft.theme, sections: draft.sections, settings: draft.settings, chatId: draft.chatId };
    if (draft.slug !== page.slug) payload.slug = draft.slug;
    try {
      const saved = await updatePage({ id: page.id, ...payload });
      setDraft((d) => (d ? { ...d, slug: saved.slug } : d));
      setDirty(false);
      if (notify) toast.success("Rascunho salvo. Publique quando quiser que os visitantes vejam.");
      return true;
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível salvar a página."));
      return false;
    }
  };

  const publish = async () => {
    if (!page || !(await ensureSaved())) return;
    try {
      await publishPage(page.id);
      toast.success(`Página no ar em /p/${draft?.slug ?? page.slug}`);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível publicar a página."));
    }
  };

  const askAi = async (e?: FormEvent, text = instruction) => {
    e?.preventDefault();
    if (!page || !draft || text.trim().length < 3) return;
    try {
      const sections = await aiEdit({ id: page.id, instruction: text.trim(), sections: draft.sections });
      change({ sections });
      setInstruction("");
      toast.success("A IA alterou a página. Revise na prévia e salve.");
    } catch (err) {
      toast.error(apiErrorMessage(err, "A IA não conseguiu alterar a página."));
    }
  };

  const addProducts = () =>
    setSections((all) => {
      const footerAt = all.findIndex((x) => x.type === "footer");
      const section: LandingSection = { id: `sec-products-${crypto.randomUUID().slice(0, 6)}`, type: "products", enabled: true, data: { title: "Produtos", items: [{ id: `prd-${crypto.randomUUID().slice(0, 6)}`, name: "Meu produto" }] } };
      const next = [...all];
      next.splice(footerAt === -1 ? next.length : footerAt, 0, section);
      setExpanded(section.id);
      return next;
    });

  /** Baixa o QR Code do endereço público da bio (PNG). */
  const downloadQr = async () => {
    if (!page) return;
    try {
      const url = await QRCode.toDataURL(`${window.location.origin}/p/${page.slug}`, { margin: 2, width: 1024, errorCorrectionLevel: "M" });
      const a = document.createElement("a");
      a.href = url;
      a.download = `qrcode-${page.slug}.png`;
      a.click();
    } catch {
      toast.error("Não foi possível gerar o QR Code.");
    }
  };

  const chat = chats?.find((c) => c.id === draft?.chatId);
  const previewChat = () =>
    chat ? toast.success(`Na página publicada, este botão abre o chat do bot "${chat.name}".`) : toast.error("Vincule um bot na aba Página para os botões de conversa funcionarem.");

  if (!id || isError) {
    return (
      <EmptyState icon={Globe} title="Página não encontrada" description="Ela pode ter sido excluída ou pertence a outro workspace.">
        <Button icon={ArrowLeft} onClick={() => navigate({ to: "/landing-pages" })}>
          Voltar para as páginas
        </Button>
      </EmptyState>
    );
  }
  if (isLoading || !page || !draft) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  const status = dirty ? (
    <Badge tone="warning">Não salvo</Badge>
  ) : !page.publishedAt ? (
    <Badge tone="neutral">Rascunho</Badge>
  ) : page.hasUnpublishedChanges ? (
    <Badge tone="accent">Mudanças não publicadas</Badge>
  ) : (
    <Badge tone="success" icon={CheckCircle2}>
      No ar
    </Badge>
  );

  return (
    <div className="flex h-full flex-col">
      <header className="flex min-h-[68px] shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-border-ui bg-panel/80 px-3 py-2 backdrop-blur-xl md:px-4">
        <IconButton icon={ArrowLeft} label="Voltar para as páginas" onClick={() => (!dirty || window.confirm("Sair sem salvar as mudanças?")) && navigate({ to: "/landing-pages" })} />
        <div className="flex min-w-0 flex-1 flex-col md:flex-none">
          <div className="flex items-center gap-2">
            <input
              value={draft.title}
              maxLength={100}
              onChange={(e) => change({ title: e.target.value })}
              aria-label="Nome da página"
              className="min-h-11 min-w-0 max-w-full rounded-lg bg-transparent px-1 text-[17px] font-bold tracking-tight text-text-primary outline-none hover:bg-panel-hover focus:bg-panel-2"
            />
            {status}
          </div>
          <span className="truncate px-1 font-mono text-[12px] text-text-secondary">/p/{draft.slug}</span>
        </div>

        <div id="tour-builder-viewport" className="mx-auto hidden md:block">
          <Segmented
            label="Prévia"
            size="sm"
            value={viewport}
            onChange={setViewport}
            options={[
              { value: "desktop", label: "Computador", icon: Monitor },
              { value: "mobile", label: "Celular", icon: Smartphone },
            ]}
          />
        </div>

        <div className="flex w-full items-center gap-2 md:ml-0 md:w-auto">
          {page.publishedAt && (
            <a
              href={`/p/${page.slug}`}
              target="_blank"
              rel="noreferrer"
              className="flex h-11 items-center gap-1.5 rounded-xl px-3 text-[14px] font-semibold text-text-primary hover:bg-panel-hover md:h-10"
            >
              <ExternalLink size={16} />
              Ver no ar
            </a>
          )}
          <Button variant="outline" icon={Save} onClick={() => void ensureSaved(true)} loading={saving && !publishing} disabled={!dirty}>
            Salvar
          </Button>
          <span id="tour-builder-publish">
            <Button icon={Rocket} onClick={() => void publish()} loading={publishing} disabled={!dirty && !page.hasUnpublishedChanges}>
              Publicar
            </Button>
          </span>
          <span className="hidden md:block">
            <HelpButton tourKey="landing_builder" screenTitle="Editor de página" />
          </span>
        </div>
        <div className="flex w-full md:hidden">
          <Segmented
            label="Mostrar"
            size="sm"
            fullWidth
            value={pane}
            onChange={setPane}
            options={[
              { value: "edit", label: "Editar", icon: Pencil },
              { value: "preview", label: "Prévia", icon: Smartphone },
            ]}
          />
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className={`${pane === "edit" ? "flex" : "hidden"} w-full min-w-0 shrink-0 flex-col border-r border-border-ui bg-panel md:flex md:w-[380px]`}>
          <div id="tour-builder-tabs" className="p-3">
            <Segmented
              label="Painel"
              size="sm"
              fullWidth
              value={tab}
              onChange={setTab}
              options={[
                { value: "sections", label: "Seções", icon: FileText },
                { value: "ai", label: "IA", icon: Sparkles },
                { value: "page", label: "Página", icon: Settings2 },
              ]}
            />
          </div>

          <div className="flex-1 overflow-y-auto px-3 pb-6">
            {tab === "sections" && (
              <div className="flex flex-col gap-2">
                {draft.sections.map((section, i) => {
                  const open = expanded === section.id;
                  return (
                    <div key={section.id} className={`overflow-hidden rounded-2xl border ${open ? "border-primary/40 bg-panel-2" : "border-border-ui bg-panel-2/60"}`}>
                      <div className="flex items-center gap-1 py-2 pl-3 pr-2">
                        <button type="button" onClick={() => setExpanded(open ? null : section.id)} className="flex min-h-11 flex-1 items-center gap-2 text-left" aria-expanded={open}>
                          <ChevronDown size={16} className={`shrink-0 text-text-secondary transition-transform ${open ? "rotate-180" : ""}`} />
                          <span className={`text-[14px] font-semibold ${section.enabled ? "text-text-primary" : "text-text-secondary line-through"}`}>{SECTION_LABELS[section.type]}</span>
                        </button>
                        <button
                          type="button"
                          className="flex h-11 w-9 items-center justify-center rounded-md text-text-secondary hover:bg-panel-hover disabled:opacity-30 md:h-8"
                          disabled={i === 0}
                          onClick={() => setSections((all) => all.map((s, j) => (j === i - 1 ? all[i] : j === i ? all[i - 1] : s)))}
                          aria-label={`Subir ${SECTION_LABELS[section.type]}`}
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          className="flex h-11 w-9 items-center justify-center rounded-md text-text-secondary hover:bg-panel-hover disabled:opacity-30 md:h-8"
                          disabled={i === draft.sections.length - 1}
                          onClick={() => setSections((all) => all.map((s, j) => (j === i + 1 ? all[i] : j === i ? all[i + 1] : s)))}
                          aria-label={`Descer ${SECTION_LABELS[section.type]}`}
                        >
                          <ArrowDown size={14} />
                        </button>
                        <Switch
                          checked={section.enabled}
                          label={section.enabled ? `Esconder ${SECTION_LABELS[section.type]}` : `Mostrar ${SECTION_LABELS[section.type]}`}
                          onChange={(enabled) => setSections((all) => all.map((s) => (s.id === section.id ? { ...s, enabled } : s)))}
                        />
                      </div>
                      <AnimatePresence initial={false}>
                        {open && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="flex flex-col gap-3 border-t border-border-ui p-3">
                              <SectionEditor section={section} clicks={clickStats?.items} onChange={(next) => setSections((all) => all.map((s) => (s.id === next.id ? next : s)))} />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
                {draft.settings.layout === "bio" && !draft.sections.some((x) => x.type === "products") && (
                  <button
                    type="button"
                    onClick={addProducts}
                    className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-dashed border-border-ui text-[13px] font-semibold text-primary-strong hover:bg-primary/8"
                  >
                    <Plus size={15} /> Adicionar vitrine de produtos
                  </button>
                )}
                {draft.settings.layout === "bio" && (
                  <div className="mt-2 flex flex-col gap-2 rounded-2xl border border-border-ui bg-panel-2/60 p-3">
                    <span className="flex items-center gap-2 text-[14px] font-semibold text-text-primary">
                      <QrCode size={16} className="text-primary" />
                      QR Code da bio
                    </span>
                    <p className="text-[12px] leading-snug text-text-secondary">Imprima ou use nos stories. Aponta para /p/{draft.slug}.{!page.publishedAt && " Publique a página para o endereço funcionar."}</p>
                    <Button variant="outline" icon={Download} onClick={() => void downloadQr()} className="w-full">
                      Baixar QR Code (PNG)
                    </Button>
                  </div>
                )}
              </div>
            )}

            {tab === "ai" && (
              <form onSubmit={(e) => void askAi(e)} className="flex flex-col gap-3">
                <p className="text-[13px] leading-snug text-text-secondary">
                  Peça uma mudança e a IA reescreve as seções. Depoimentos e rodapé não são alterados. Nada é salvo até você clicar em Salvar.
                </p>
                {!ai?.configured && (
                  <p className="rounded-2xl bg-warning/14 p-3 text-[13px] leading-snug text-warning-strong">A IA ainda não está ligada neste servidor (NEXO_ANTHROPIC_API_KEY).</p>
                )}
                <textarea
                  className={`${textareaClass} h-28 text-[14px]`}
                  value={instruction}
                  maxLength={1000}
                  disabled={!ai?.configured || aiWorking}
                  onChange={(e) => setInstruction(e.target.value)}
                  placeholder="Ex.: Fale mais do atendimento em domicílio e troque o botão para Agendar visita"
                />
                <div className="flex flex-wrap gap-1.5">
                  {AI_SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      disabled={!ai?.configured || aiWorking}
                      onClick={() => void askAi(undefined, s)}
                      className="rounded-full border border-border-ui bg-panel-2 px-3 py-1 text-[12.5px] font-medium text-text-secondary hover:text-text-primary disabled:opacity-50"
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <Button type="submit" icon={Sparkles} loading={aiWorking} disabled={!ai?.configured || instruction.trim().length < 3} className="w-full">
                  {aiWorking ? "A IA está reescrevendo..." : "Aplicar com a IA"}
                </Button>
              </form>
            )}

            {tab === "page" && (
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-semibold text-text-secondary">Tema</span>
                  <ThemePicker value={draft.theme} columns={1} onChange={(theme) => change({ theme })} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-semibold text-text-secondary">Fonte dos títulos</span>
                  <Segmented
                    label="Fonte dos títulos"
                    size="sm"
                    fullWidth
                    value={draft.settings.fontHeading === "serif" ? "serif" : "inter"}
                    onChange={(fontHeading) => change({ settings: { ...draft.settings, fontHeading } })}
                    options={[
                      { value: "inter", label: "Moderna" },
                      { value: "serif", label: "Clássica" },
                    ]}
                  />
                </div>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-semibold text-text-secondary">Bot que atende na página</span>
                  <select className={selectClass} value={draft.chatId ?? ""} onChange={(e) => change({ chatId: e.target.value || null })}>
                    <option value="">Nenhum</option>
                    {chats?.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <span className="text-[12px] text-text-secondary">Os botões de conversa abrem este bot. Ele usa o fluxo publicado.</span>
                </label>
                <div className="flex items-center justify-between gap-3 rounded-2xl bg-panel-2 p-3">
                  <span className="flex items-center gap-2 text-[14px] font-medium text-text-primary">
                    <MessageCircle size={16} className="text-primary" />
                    Botão de chat flutuante
                  </span>
                  <Switch checked={draft.settings.showChatWidget} label="Botão de chat flutuante" onChange={(showChatWidget) => change({ settings: { ...draft.settings, showChatWidget } })} />
                </div>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-semibold text-text-secondary">Endereço da página</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[14px] text-text-secondary">/p/</span>
                    <input
                      className={`${inputClass} font-mono text-[14px]`}
                      value={draft.slug}
                      maxLength={60}
                      onChange={(e) => change({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
                    />
                  </div>
                  {page.publishedAt && draft.slug !== page.slug && <span className="text-[12px] text-warning-strong">Quem tiver o endereço antigo não vai mais encontrar a página.</span>}
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-semibold text-text-secondary">Título no Google</span>
                  <input className={inputClass} value={draft.settings.seoTitle ?? ""} maxLength={100} onChange={(e) => change({ settings: { ...draft.settings, seoTitle: e.target.value || undefined } })} placeholder={draft.title} />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-semibold text-text-secondary">Descrição no Google</span>
                  <textarea
                    className={`${textareaClass} text-[14px]`}
                    value={draft.settings.seoDescription ?? ""}
                    maxLength={250}
                    onChange={(e) => change({ settings: { ...draft.settings, seoDescription: e.target.value || undefined } })}
                    placeholder="Uma frase sobre a empresa e a cidade onde atende."
                  />
                </label>
              </div>
            )}
          </div>
        </aside>

        <div id="tour-builder-preview" className={`${pane === "preview" ? "flex" : "hidden"} min-w-0 flex-1 items-center justify-center bg-bg-start p-3 md:flex md:p-6`}>
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className={`relative overflow-hidden bg-white shadow-float ${viewport === "mobile" ? "h-full max-h-[780px] w-full max-w-[390px] rounded-[32px] border-[6px] border-[#0B1220] md:w-[390px] md:rounded-[44px] md:border-[10px]" : "h-full w-full rounded-2xl border border-border-ui"}`}
          >
            <div className="h-full overflow-y-auto">
              <LandingRenderer title={draft.title} theme={draft.theme} sections={draft.sections} settings={draft.settings} slug={draft.slug} canAsk={!!draft.chatId} onChat={previewChat} onAsk={previewChat} />
            </div>
            {draft.settings.showChatWidget && draft.chatId && (
              <button
                type="button"
                onClick={previewChat}
                className="absolute bottom-5 right-5 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-float transition-transform hover:scale-105"
                style={{ background: chat?.settings.mainColor ?? "#0A6CFF" }}
                aria-label="Prévia do botão de chat"
              >
                <MessageCircle size={26} />
              </button>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
