import { ArrowDown, ArrowUp, Bot, CheckCircle2, ExternalLink, Globe, GripVertical, type IconComponent, Instagram, Link2, MessageCircle, Music2, Pencil, Plus, QrCode, Rocket, Save, ChevronDown, Paintbrush, ShoppingBag, Smartphone, Star, Trash2, UserRound, WhatsApp, Youtube } from "../../shared/icons";
import { Reorder, useDragControls } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { apiErrorMessage } from "../../api/instance";
import { usePublishLandingPage } from "../../api/mutations/usePublishLandingPage";
import { type UpdateLandingPagePayload, useUpdateLandingPage } from "../../api/mutations/useUpdateLandingPage";
import { useGetLandingClicks } from "../../api/queries/useGetLandingClicks";
import { Badge } from "../../shared/components/ui/Badge";
import { Button } from "../../shared/components/ui/Button";
import { PhoneFrame } from "../../shared/components/ui/PhoneFrame";
import { toast } from "../../shared/components/ui/toast-store";
import { type BioTarget, LandingRenderer } from "../landing/components/LandingRenderer";
import { ClickCount, Field, LinkFields, ProductFields, ScheduleBadge } from "../landing/components/SectionEditor";
import { LookEditor } from "../landing/components/LookEditor";
import { ThemePicker } from "../landing/components/ThemePicker";
import { PhotoTheme } from "../landing/look/PhotoTheme";
import { type LandingPageRecord, type LandingPageSettings, type LandingSection, type LandingTheme, type LinkItem, type LinkKind, MAX, type ProductItem, themeBg, themeIsDark } from "../landing/contract";
import { BioBotTab } from "./BioBotTab";
import { BioSheet } from "./BioSheet";
import { BioShare } from "./BioShare";
import { bioUrl } from "./bioUrl";
import { PutOnInstagramSheet } from "./PutOnInstagram";
import { NEW_ITEM_OPTIONS, type NewItemKey } from "./presets";
import { ImageField } from "../uploads/ImageField";

interface Draft {
  title: string;
  theme: LandingTheme;
  sections: LandingSection[];
  settings: LandingPageSettings;
}

const toDraft = (p: LandingPageRecord): Draft => ({ title: p.title, theme: p.theme, sections: p.sections, settings: p.settings });
const newId = (prefix: string) => `${prefix}-${crypto.randomUUID().slice(0, 6)}`;

const KIND_ICONS: Record<LinkKind, IconComponent> = { chat: MessageCircle, whatsapp: WhatsApp, instagram: Instagram, tiktok: Music2, google: Star, site: Globe, link: Link2, pix: QrCode, youtube: Youtube };

type ClickMap = Record<string, { last7: number; last30: number }>;

interface RowProps {
  id: string;
  icon: IconComponent;
  title: string;
  subtitle?: string;
  schedule: { startsAt?: string; endsAt?: string };
  stats?: { last7: number; last30: number };
  selected: boolean;
  first: boolean;
  last: boolean;
  onOpen: () => void;
  onMove: (dir: -1 | 1) => void;
  value: unknown;
}

/** Linha da lista de itens: arrastar pela alça, tocar para editar, botões de subir e descer. */
function ItemRow({ id, icon: Icon, title, subtitle, schedule, stats, selected, first, last, onOpen, onMove, value }: RowProps) {
  const controls = useDragControls();
  return (
    <Reorder.Item value={value} id={id} dragListener={false} dragControls={controls} className={`flex items-center gap-0.5 rounded-2xl border bg-panel py-1 pl-0.5 pr-1 ${selected ? "border-primary ring-2 ring-primary/20" : "border-border-ui"}`}>
      <button type="button" aria-label={`Arrastar ${title}`} onPointerDown={(e) => controls.start(e)} className="flex h-11 w-9 shrink-0 cursor-grab touch-none items-center justify-center text-text-secondary active:cursor-grabbing">
        <GripVertical size={18} />
      </button>
      <button type="button" onClick={onOpen} className="flex min-h-11 min-w-0 flex-1 items-center gap-2.5 rounded-xl text-left">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
          <Icon size={18} />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="flex items-center gap-1.5">
            <span className="truncate text-[14px] font-semibold text-text-primary">{title}</span>
            <ScheduleBadge item={schedule} />
          </span>
          {subtitle && <span className="truncate text-[12px] text-text-secondary">{subtitle}</span>}
          <ClickCount stats={stats} />
        </span>
      </button>
      <div className="flex shrink-0">
        <button type="button" aria-label={`Subir ${title}`} disabled={first} onClick={() => onMove(-1)} className="flex h-11 w-9 items-center justify-center rounded-lg text-text-secondary hover:bg-panel-hover disabled:opacity-25">
          <ArrowUp size={16} />
        </button>
        <button type="button" aria-label={`Descer ${title}`} disabled={last} onClick={() => onMove(1)} className="flex h-11 w-9 items-center justify-center rounded-lg text-text-secondary hover:bg-panel-hover disabled:opacity-25">
          <ArrowDown size={16} />
        </button>
      </div>
    </Reorder.Item>
  );
}

function moveItem<T>(list: T[], index: number, dir: -1 | 1): T[] {
  const next = [...list];
  const j = index + dir;
  if (j < 0 || j >= next.length) return list;
  [next[index], next[j]] = [next[j], next[index]];
  return next;
}

type Selection = BioTarget | null;

/** Editor próprio da bio: o celular no centro, toque para editar, arraste para reordenar. */
export function BioEditor({ page, openInstagram = false }: { page: LandingPageRecord; openInstagram?: boolean }) {
  const { mutateAsync: updatePage, isPending: saving } = useUpdateLandingPage();
  const { mutateAsync: publishPage, isPending: publishing } = usePublishLandingPage();
  const { data: clickStats } = useGetLandingClicks(page.id);
  const clicks: ClickMap = clickStats?.items ?? {};

  const [draft, setDraft] = useState<Draft>(() => toDraft(page));
  const [dirty, setDirty] = useState(false);
  const [tab, setTab] = useState<"items" | "bot" | "page">("items");
  const [igOpen, setIgOpen] = useState(openInstagram && Boolean(page.publishedAt));
  const [igTitle, setIgTitle] = useState("Colocar no Instagram");
  const [pane, setPane] = useState<"edit" | "preview">("edit");
  const [selection, setSelection] = useState<Selection>(null);
  const [adding, setAdding] = useState(false);

  // Carrega a versão do servidor uma vez por página; depois a tela é a fonte do rascunho.
  const loadedFor = useRef(page.id);
  useEffect(() => {
    if (loadedFor.current !== page.id) {
      loadedFor.current = page.id;
      setDraft(toDraft(page));
      setDirty(false);
    }
  }, [page]);

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const change = (patch: Partial<Draft>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setDirty(true);
  };
  const setSections = (fn: (s: LandingSection[]) => LandingSection[]) => change({ sections: fn(draft.sections) });

  const hero = draft.sections.find((s): s is Extract<LandingSection, { type: "hero" }> => s.type === "hero");
  const linksSection = draft.sections.find((s): s is Extract<LandingSection, { type: "links" }> => s.type === "links");
  const productsSection = draft.sections.find((s): s is Extract<LandingSection, { type: "products" }> => s.type === "products");
  const links = linksSection?.data.items ?? [];
  const products = productsSection?.data.items ?? [];

  const setLinks = (items: LinkItem[]) => setSections((all) => all.map((s) => (s.type === "links" ? { ...s, data: { ...s.data, items } } : s)));
  const setProducts = (items: ProductItem[]) => setSections((all) => all.map((s) => (s.type === "products" ? { ...s, data: { ...s.data, items } } : s)));
  const patchHero = (patch: Partial<Extract<LandingSection, { type: "hero" }>["data"]>) => setSections((all) => all.map((s) => (s.type === "hero" ? { ...s, data: { ...s.data, ...patch } } : s)));

  const ensureSaved = async (notify = false) => {
    if (!dirty) return true;
    const payload: UpdateLandingPagePayload = { title: draft.title, theme: draft.theme, sections: draft.sections, settings: draft.settings };
    try {
      await updatePage({ id: page.id, ...payload });
      setDirty(false);
      if (notify) toast.success("Rascunho salvo. Publique quando quiser que os visitantes vejam.");
      return true;
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível salvar a bio."));
      return false;
    }
  };

  const publish = async () => {
    if (!(await ensureSaved())) return;
    const firstTime = !page.publishedAt;
    try {
      await publishPage(page.id);
      toast.success(`Bio no ar em /p/${page.slug}`);
      // Na primeira publicação, já oferece o passo que faz a bio funcionar: o link no Instagram.
      if (firstTime) {
        setIgTitle("Sua bio está no ar!");
        setIgOpen(true);
      }
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível publicar a bio."));
    }
  };

  const addItem = (key: NewItemKey) => {
    setAdding(false);
    if (key === "product") {
      const item: ProductItem = { id: newId("prd"), name: "Novo produto" };
      if (productsSection) setProducts([...products, item]);
      else {
        setSections((all) => {
          const at = all.findIndex((s) => s.type === "footer");
          const next = [...all];
          next.splice(at === -1 ? next.length : at, 0, { id: newId("sec-products"), type: "products", enabled: true, data: { title: "Produtos", items: [item] } });
          return next;
        });
      }
      setSelection({ type: "product", id: item.id });
      return;
    }
    const base: Record<Exclude<NewItemKey, "product">, Omit<LinkItem, "id">> = {
      whatsapp: { kind: "whatsapp", label: "Falar no WhatsApp", url: "", message: "Oi! Vim pela sua bio e queria conversar." },
      instagram: { kind: "instagram", label: "Instagram", url: "https://instagram.com/" },
      tiktok: { kind: "tiktok", label: "TikTok", url: "https://tiktok.com/@" },
      youtube: { kind: "youtube", label: "YouTube", url: "https://youtube.com/@" },
      site: { kind: "site", label: "Meu site", url: "https://" },
      pix: { kind: "pix", label: "Pagar com Pix", pixKey: "", pixName: "", pixCity: "" },
    };
    const item: LinkItem = { id: newId("lnk"), ...base[key] };
    setLinks([...links, item]);
    setSelection({ type: "link", id: item.id });
  };

  const selectedLink = selection?.type === "link" ? links.find((l) => l.id === selection.id) : undefined;
  const selectedProduct = selection?.type === "product" ? products.find((p) => p.id === selection.id) : undefined;
  const selectedId = selection?.type === "link" || selection?.type === "product" ? selection.id : selection?.type;

  const status = dirty ? <Badge tone="warning">Não salvo</Badge> : !page.publishedAt ? <Badge tone="neutral">Rascunho</Badge> : page.hasUnpublishedChanges ? <Badge tone="accent">Mudanças não publicadas</Badge> : <Badge tone="success" icon={CheckCircle2}>No ar</Badge>;

  const tabs = [
    { value: "items", label: "Itens", icon: Pencil },
    { value: "bot", label: "Bot", icon: Bot },
    { value: "page", label: "Visual", icon: Paintbrush },
  ] as const;


  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-border-ui bg-panel/80 px-3 py-2 backdrop-blur-xl md:px-4">
        <div className="flex min-w-0 flex-1 flex-col md:flex-none">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-[18px] font-bold tracking-tight text-text-primary">Minha Bio</h1>
            {status}
          </div>
          <span className="truncate font-mono text-[12px] text-text-secondary">/p/{page.slug}</span>
        </div>
        <div className="flex w-full items-center gap-2 md:ml-auto md:w-auto">
          {page.publishedAt && (
            <a href={`/p/${page.slug}`} target="_blank" rel="noreferrer" aria-label="Ver no ar" title="Ver no ar" className="flex h-11 min-w-11 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-border-ui px-3 text-[14px] font-semibold text-text-primary hover:bg-panel-hover sm:border-0">
              <ExternalLink size={16} />
              <span className="hidden sm:inline">Ver no ar</span>
            </a>
          )}
          {page.publishedAt && (
            <Button variant="gold" icon={Instagram} onClick={() => { setIgTitle("Colocar no Instagram"); setIgOpen(true); }} aria-label="Colocar no Instagram" className="h-11 shrink-0">
              Instagram
            </Button>
          )}
          <Button variant="outline" icon={Save} onClick={() => void ensureSaved(true)} loading={saving && !publishing} disabled={!dirty} aria-label="Salvar" className="ml-auto h-11 md:ml-0">
            <span className="hidden min-[430px]:inline">Salvar</span>
          </Button>
          <Button icon={Rocket} onClick={() => void publish()} loading={publishing} disabled={!dirty && !page.hasUnpublishedChanges} className="h-11">
            Publicar
          </Button>
        </div>
        <div className="grid w-full grid-cols-2 gap-1 rounded-xl bg-text-secondary/12 p-[3px] md:hidden" role="radiogroup" aria-label="Mostrar">
          {(["edit", "preview"] as const).map((p) => (
            <button key={p} type="button" role="radio" aria-checked={pane === p} onClick={() => setPane(p)} className={`flex h-11 items-center justify-center gap-1.5 rounded-[9px] text-[14px] font-semibold ${pane === p ? "bg-panel text-text-primary shadow-sm" : "text-text-secondary"}`}>
              {p === "edit" ? <Pencil size={15} /> : <Smartphone size={15} />}
              {p === "edit" ? "Editar" : "Prévia"}
            </button>
          ))}
        </div>
      </header>
      <PutOnInstagramSheet url={bioUrl(page.slug)} open={igOpen} title={igTitle} onClose={() => setIgOpen(false)} />

      <div className="flex min-h-0 flex-1">
        <aside className={`${pane === "edit" ? "flex" : "hidden"} w-full min-w-0 shrink-0 flex-col border-r border-border-ui bg-panel md:flex md:w-[400px]`}>
          <div className="grid grid-cols-3 gap-1 border-b border-border-ui p-2" role="tablist" aria-label="Painel da bio">
            {tabs.map((t) => (
              <button key={t.value} type="button" role="tab" aria-selected={tab === t.value} onClick={() => setTab(t.value)} className={`flex h-11 items-center justify-center gap-1.5 rounded-xl text-[14px] font-semibold ${tab === t.value ? "bg-primary/12 text-primary-strong" : "text-text-secondary hover:bg-panel-hover"}`}>
                <t.icon size={16} />
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-3 pb-8">
            {tab === "items" && (
              <div className="flex flex-col gap-3">
                <button type="button" onClick={() => setSelection({ type: "profile" })} className={`flex min-h-14 items-center gap-3 rounded-2xl border bg-panel p-2 pl-3 text-left ${selection?.type === "profile" ? "border-primary ring-2 ring-primary/20" : "border-border-ui"}`}>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/14 text-accent-strong">
                    <UserRound size={18} />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-[14px] font-semibold text-text-primary">{hero?.data.headline || draft.title}</span>
                    <span className="truncate text-[12px] text-text-secondary">Perfil: nome, @, frase e foto</span>
                  </span>
                  <Pencil size={16} className="shrink-0 text-text-secondary" />
                </button>

                <div className="flex flex-col gap-2">
                  <span className="text-[13px] font-semibold text-text-secondary">Links</span>
                  <Reorder.Group axis="y" values={links} onReorder={setLinks} className="flex flex-col gap-2">
                    {links.map((l, i) => (
                      <ItemRow
                        key={l.id}
                        id={l.id}
                        value={l}
                        icon={KIND_ICONS[l.kind] ?? Link2}
                        title={l.label}
                        subtitle={l.kind === "pix" ? "Pix" : l.kind === "chat" ? "Abre o bot" : l.url?.replace("https://", "")}
                        schedule={l}
                        stats={clicks[l.id]}
                        selected={selection?.type === "link" && selection.id === l.id}
                        first={i === 0}
                        last={i === links.length - 1}
                        onOpen={() => setSelection({ type: "link", id: l.id })}
                        onMove={(dir) => setLinks(moveItem(links, i, dir))}
                      />
                    ))}
                  </Reorder.Group>
                </div>

                {products.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <span className="text-[13px] font-semibold text-text-secondary">Produtos</span>
                    <Reorder.Group axis="y" values={products} onReorder={setProducts} className="flex flex-col gap-2">
                      {products.map((p, i) => (
                        <ItemRow
                          key={p.id}
                          id={p.id}
                          value={p}
                          icon={ShoppingBag}
                          title={p.name}
                          subtitle={p.price}
                          schedule={p}
                          stats={clicks[p.id]}
                          selected={selection?.type === "product" && selection.id === p.id}
                          first={i === 0}
                          last={i === products.length - 1}
                          onOpen={() => setSelection({ type: "product", id: p.id })}
                          onMove={(dir) => setProducts(moveItem(products, i, dir))}
                        />
                      ))}
                    </Reorder.Group>
                  </div>
                )}

                <Button size="lg" variant="secondary" icon={Plus} onClick={() => setAdding(true)} disabled={links.length >= MAX.links && products.length >= MAX.products} aria-label="Adicionar item">
                  Adicionar
                </Button>
              </div>
            )}

            {tab === "bot" && <BioBotTab page={page} ensureSaved={ensureSaved} />}

            {tab === "page" && (
              <div className="flex flex-col gap-5">
                <PhotoTheme
                  photoUrl={hero?.data.imageUrl}
                  current={draft.settings.look}
                  onApply={(theme, look) => change({ theme, settings: { ...draft.settings, look, fontHeading: "inter" } })}
                  onAddPhoto={() => {
                    setTab("items");
                    setSelection({ type: "profile" });
                  }}
                />
                <div className="flex flex-col gap-2">
                  <span className="text-[13px] font-semibold text-text-secondary">Tema</span>
                  <ThemePicker value={draft.theme} onChange={(theme) => change({ theme, settings: { ...draft.settings, look: undefined, fontHeading: "inter" } })} />
                </div>
                <details className="group rounded-2xl border border-border-ui bg-panel" open={Boolean(draft.settings.look)}>
                  <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 px-3.5 text-[14px] font-semibold text-text-primary">
                    <Paintbrush size={17} className="text-primary" data-gesture="tilt" />
                    <span className="flex-1">Personalizar</span>
                    <span className="text-[12.5px] font-medium text-text-secondary">fundo, botões, cores e letra</span>
                    <ChevronDown size={16} className="text-text-secondary transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="border-t border-border-ui p-3.5">
                    <LookEditor theme={draft.theme} look={draft.settings.look} fontHeading={draft.settings.fontHeading} onChange={(look) => change({ settings: { ...draft.settings, look } })} />
                  </div>
                </details>
                <div className="flex flex-col gap-2">
                  <span className="text-[13px] font-semibold text-text-secondary">Compartilhar</span>
                  {!page.publishedAt && <p className="text-[12px] text-warning-strong">Publique a bio para o endereço funcionar.</p>}
                  <BioShare slug={page.slug} name={draft.title} showSteps={false} />
                </div>
              </div>
            )}
          </div>
        </aside>

        <div className={`${pane === "preview" ? "flex" : "hidden"} min-w-0 flex-1 items-center justify-center bg-bg-start p-3 md:flex md:p-6`}>
          <PhoneFrame statusTone={themeIsDark(draft.theme, draft.settings.look) ? "light" : "dark"} statusBg={themeBg(draft.theme, draft.settings.look)} label="Prévia da bio">
              <LandingRenderer
                title={draft.title}
                theme={draft.theme}
                sections={draft.sections}
                settings={draft.settings}
                slug={page.slug}
                canAsk={!!page.chatId}
                onChat={() => toast.success(page.chat ? `Na bio publicada, este botão abre o bot "${page.chat.name}".` : "Esta bio ainda não tem bot. Veja a aba Bot.")}
                onAsk={() => undefined}
                onEditSelect={setSelection}
                editSelectedId={selectedId}
              />
          </PhoneFrame>
        </div>
      </div>

      {adding && (
        <BioSheet title="O que você quer adicionar?" onClose={() => setAdding(false)}>
          <div className="flex flex-col gap-2">
            {NEW_ITEM_OPTIONS.map((o) => (
              <button key={o.key} type="button" onClick={() => addItem(o.key)} disabled={o.key === "product" ? products.length >= MAX.products : links.length >= MAX.links} className="flex min-h-14 flex-col items-start justify-center rounded-2xl border border-border-ui bg-panel-2/60 px-4 text-left hover:bg-panel-hover disabled:opacity-40">
                <span className="text-[15px] font-semibold text-text-primary">{o.label}</span>
                <span className="text-[13px] text-text-secondary">{o.hint}</span>
              </button>
            ))}
          </div>
        </BioSheet>
      )}

      {selection?.type === "profile" && hero && (
        <BioSheet title="Perfil" onClose={() => setSelection(null)}>
          <Field label="Nome" required value={hero.data.headline} max={MAX.headline} onChange={(headline) => { patchHero({ headline }); change({ title: headline.slice(0, 100) || draft.title }); }} />
          <Field label="Seu @" value={hero.data.badge} max={MAX.badge} placeholder="@seuperfil" onChange={(badge) => patchHero({ badge: badge || undefined })} />
          <Field label="Frase curta" multiline value={hero.data.subheadline} max={MAX.subheadline} onChange={(subheadline) => patchHero({ subheadline: subheadline || undefined })} />
          <ImageField label="Foto do perfil" value={hero.data.imageUrl} shape="square" hint="Aparece redonda no topo da bio." onChange={(imageUrl) => patchHero({ imageUrl })} />
        </BioSheet>
      )}

      {selectedLink && (
        <BioSheet
          title={selectedLink.label || "Link"}
          onClose={() => setSelection(null)}
          footer={
            <>
              <Button variant="danger" icon={Trash2} className="h-11" onClick={() => { setLinks(links.filter((l) => l.id !== selectedLink.id)); setSelection(null); }}>
                Remover
              </Button>
              <Button variant="outline" className="ml-auto h-11" onClick={() => setSelection(null)}>
                Pronto
              </Button>
            </>
          }
        >
          <ClickCount stats={clicks[selectedLink.id]} />
          <LinkFields item={selectedLink} update={(patch) => setLinks(links.map((l) => (l.id === selectedLink.id ? { ...l, ...patch } : l)))} />
        </BioSheet>
      )}

      {selectedProduct && (
        <BioSheet
          title={selectedProduct.name || "Produto"}
          onClose={() => setSelection(null)}
          footer={
            <>
              <Button
                variant="danger"
                icon={Trash2}
                className="h-11"
                onClick={() => {
                  if (products.length <= 1) setSections((all) => all.filter((s) => s.type !== "products"));
                  else setProducts(products.filter((p) => p.id !== selectedProduct.id));
                  setSelection(null);
                }}
              >
                Remover
              </Button>
              <Button variant="outline" className="ml-auto h-11" onClick={() => setSelection(null)}>
                Pronto
              </Button>
            </>
          }
        >
          <ClickCount stats={clicks[selectedProduct.id]} />
          <ProductFields item={selectedProduct} update={(patch) => setProducts(products.map((p) => (p.id === selectedProduct.id ? { ...p, ...patch } : p)))} />
        </BioSheet>
      )}

    </div>
  );
}
