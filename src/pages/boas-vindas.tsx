import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Briefcase,
  Camera,
  ChartLine,
  Check,
  Globe,
  type IconComponent,
  ImagePlus,
  Instagram,
  Link2,
  Music2,
  Package,
  ShoppingBag,
  ShoppingCart,
  Store,
  Trash2,
  WhatsApp,
  Youtube,
} from "../shared/icons";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { type ChangeEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { apiErrorMessage } from "../api/instance";
import { useUpdateMe } from "../api/mutations/useUpdateMe";
import { useGetMe } from "../api/queries/useGetMe";
import { MeshBackground } from "../features/auth/components/MeshBackground";
import { toAvatarDataUrl } from "../features/profile/resizeImage";
import { AVATAR_COLORS, type Audience, type AvatarColor, type BusinessProfile, type Goal, type Presence } from "../features/profile/types";
import { AVATAR_GRADIENTS } from "../features/profile/avatar";
import { UserAvatar } from "../features/profile/UserAvatar";
import { authClient } from "../lib/auth-client";
import { Button } from "../shared/components/ui/Button";
import { Logo } from "../shared/components/ui/Logo";
import { inputClass } from "../shared/components/ui/styles";
import { toast } from "../shared/components/ui/toast-store";

export const Route = createFileRoute("/boas-vindas")({
  validateSearch: (search: Record<string, unknown>): { editar?: boolean } => ({ editar: search.editar === true || search.editar === "1" ? true : undefined }),
  component: WelcomePage,
});

const AUDIENCES: { value: Audience; title: string; text: string; icon: IconComponent }[] = [
  { value: "creator", title: "Crio conteúdo", text: "Instagram, TikTok ou YouTube", icon: Camera },
  { value: "seller", title: "Vendo produtos", text: "Marketplace, Instagram ou WhatsApp", icon: Package },
  { value: "business", title: "Tenho um negócio", text: "Loja, salão, clínica, restaurante...", icon: Briefcase },
];

const SEGMENTS: Record<Audience, string[]> = {
  creator: ["Moda", "Fitness", "Beleza", "Gastronomia", "Humor", "Tecnologia", "Games", "Educação"],
  seller: ["Eletrônicos", "Moda", "Casa", "Beleza", "Acessórios", "Infantil"],
  business: ["Barbearia", "Salão de beleza", "Restaurante", "Clínica", "Academia", "Pet shop", "Estética", "Loja"],
};

const PRESENCES: { value: Presence; label: string; icon: IconComponent }[] = [
  { value: "instagram", label: "Instagram", icon: Instagram },
  { value: "tiktok", label: "TikTok", icon: Music2 },
  { value: "youtube", label: "YouTube", icon: Youtube },
  { value: "whatsapp", label: "WhatsApp", icon: WhatsApp },
  { value: "mercadolivre", label: "Mercado Livre", icon: ShoppingBag },
  { value: "shopee", label: "Shopee", icon: ShoppingCart },
  { value: "store", label: "Loja física", icon: Store },
  { value: "site", label: "Site próprio", icon: Globe },
];

const GOALS: { value: Goal; title: string; icon: IconComponent }[] = [
  { value: "whatsapp", title: "Receber mais contatos no WhatsApp", icon: WhatsApp },
  { value: "links", title: "Juntar meus links num lugar só", icon: Link2 },
  { value: "autoreply", title: "Responder clientes na hora, sozinho", icon: Bot },
  { value: "sources", title: "Saber de onde vêm meus clientes", icon: ChartLine },
];

const BRAND_LABEL: Record<Audience, string> = { creator: "Seu nome de criador ou @", seller: "Nome da sua loja", business: "Nome do negócio" };

/** Cartão de escolha (uma opção ou várias), com o mesmo visual em todos os passos. */
function Choice({ selected, onClick, icon: Icon, title, text }: { selected: boolean; onClick: () => void; icon: IconComponent; title: string; text?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`nx-anim flex min-h-14 w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
        selected ? "border-primary bg-primary/10" : "border-border-ui bg-panel-2/60 hover:bg-panel-hover"
      }`}
    >
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] ${selected ? "bg-primary text-white" : "bg-primary/12 text-primary"}`}>
        <Icon size={18} strokeWidth={2.2} data-gesture="pop" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-[14.5px] font-semibold text-text-primary">{title}</span>
        {text && <span className="text-[12.5px] text-text-secondary">{text}</span>}
      </span>
      {selected && <Check size={18} className="shrink-0 text-primary" />}
    </button>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-[13px] font-semibold text-text-secondary">
        {label}
      </label>
      {children}
    </div>
  );
}

function WelcomePage() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const { editar } = Route.useSearch();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const { data: me } = useGetMe();
  const { mutateAsync: save, isPending: saving } = useUpdateMe();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [color, setColor] = useState<AvatarColor>("violet");
  const [image, setImage] = useState<string | null>(null);
  const [biz, setBiz] = useState<BusinessProfile>({ presence: [] });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!sessionPending && !session) navigate({ to: "/login" });
  }, [session, sessionPending, navigate]);

  // Preenche com o que já existe (na edição, ou com o nome vindo do cadastro / Google).
  useEffect(() => {
    if (!me || loaded) return;
    setName(me.user.name ?? "");
    setColor(me.user.avatarColor ?? "violet");
    setImage(me.user.avatarImage);
    setBiz(me.workspace.profile);
    setLoaded(true);
  }, [me, loaded]);

  const canEditBusiness = me ? me.workspace.role !== "MEMBER" : false;
  const steps = canEditBusiness ? ["Você", "Seu negócio", "Onde você está", "Seu objetivo"] : ["Você"];
  const last = step === steps.length - 1;
  const set = (patch: Partial<BusinessProfile>) => setBiz((cur) => ({ ...cur, ...patch }));

  const pickPhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      setImage(await toAvatarDataUrl(file));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não deu para usar essa foto.");
    }
  };

  const finish = async (skip = false) => {
    try {
      await save(
        skip
          ? { finishOnboarding: true }
          : {
              name: name.trim() || undefined,
              avatarColor: color,
              // Só manda a foto se a pessoa escolheu uma agora (data URL) ou tirou a foto (null). A foto que veio do
              // Google é um link e não volta para o servidor (antes dava "foto de até 120 KB" sem a pessoa ter escolhido nada).
              avatarImage: image === null ? null : image.startsWith("data:") ? image : undefined,
              ...(canEditBusiness
                ? {
                    business: {
                      ...biz,
                      brandName: biz.brandName?.trim() || undefined,
                      segment: biz.segment?.trim() || undefined,
                      city: biz.city?.trim() || undefined,
                    },
                  }
                : {}),
              finishOnboarding: true,
            },
      );
      if (!skip) toast.success(editar ? "Perfil atualizado." : "Prontinho! O Nexo já está com a sua cara.");
      navigate({ to: "/" });
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível salvar agora. Tente de novo."));
    }
  };

  const canContinue = step !== 0 || name.trim().length > 0;

  const bodies: ReactNode[] = [
    // 0: avatar e nome
    <div key="you" className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <UserAvatar name={name || me?.user.email} color={color} image={image} size={104} className="shadow-float ring-4 ring-panel" />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            aria-label="Escolher foto"
            className="nx-anim absolute -bottom-1 -right-1 flex h-10 w-10 items-center justify-center rounded-full border border-border-ui bg-panel text-primary shadow-card hover:bg-panel-hover"
          >
            <ImagePlus size={18} data-gesture="lift" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => void pickPhoto(e)} />
        </div>
        {image ? (
          <button type="button" onClick={() => setImage(null)} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-text-secondary hover:text-danger-strong">
            <Trash2 size={14} /> Usar as iniciais
          </button>
        ) : (
          <div className="flex flex-wrap justify-center gap-1.5" role="radiogroup" aria-label="Cor do avatar">
            {AVATAR_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={color === c}
                aria-label={`Cor ${c}`}
                onClick={() => setColor(c)}
                className={`h-7 w-7 rounded-full transition-transform hover:scale-110 sm:h-8 sm:w-8 ${color === c ? "ring-2 ring-primary ring-offset-2 ring-offset-panel" : ""}`}
                style={{ background: AVATAR_GRADIENTS[c] }}
              />
            ))}
          </div>
        )}
      </div>
      <Field label="Como podemos te chamar?" htmlFor="me-name">
        <input id="me-name" className={inputClass} value={name} maxLength={80} autoComplete="name" placeholder="Seu nome" onChange={(e) => setName(e.target.value)} />
      </Field>
    </div>,

    // 1: quem é o negócio
    <div key="who" className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        {AUDIENCES.map((a) => (
          <Choice key={a.value} selected={biz.audience === a.value} onClick={() => set({ audience: a.value })} icon={a.icon} title={a.title} text={a.text} />
        ))}
      </div>
      <Field label={BRAND_LABEL[biz.audience ?? "business"]} htmlFor="me-brand">
        <input id="me-brand" className={inputClass} value={biz.brandName ?? ""} maxLength={80} placeholder={biz.audience === "creator" ? "@seuperfil" : "Ex.: Barbearia do Zé"} onChange={(e) => set({ brandName: e.target.value })} />
      </Field>
      <Field label="Segmento" htmlFor="me-segment">
        <input id="me-segment" className={inputClass} value={biz.segment ?? ""} maxLength={60} placeholder="Escolha abaixo ou escreva" onChange={(e) => set({ segment: e.target.value })} />
        <div className="flex flex-wrap gap-1.5 pt-1">
          {SEGMENTS[biz.audience ?? "business"].map((seg) => (
            <button
              key={seg}
              type="button"
              onClick={() => set({ segment: seg })}
              className={`h-8 rounded-full border px-3 text-[13px] font-medium transition-colors ${biz.segment === seg ? "border-primary bg-primary/10 text-primary-strong" : "border-border-ui text-text-secondary hover:bg-panel-hover"}`}
            >
              {seg}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Cidade (opcional)" htmlFor="me-city">
        <input id="me-city" className={inputClass} value={biz.city ?? ""} maxLength={60} autoComplete="address-level2" placeholder="Ex.: Campinas" onChange={(e) => set({ city: e.target.value })} />
      </Field>
    </div>,

    // 2: onde já está
    <div key="where" className="grid grid-cols-2 gap-2">
      {PRESENCES.map((p) => {
        const on = biz.presence.includes(p.value);
        return (
          <button
            key={p.value}
            type="button"
            aria-pressed={on}
            onClick={() => set({ presence: on ? biz.presence.filter((x) => x !== p.value) : [...biz.presence, p.value] })}
            className={`nx-anim flex h-12 min-w-0 items-center gap-2 rounded-xl border px-3 text-[14px] font-semibold transition-colors ${
              on ? "border-primary bg-primary/10 text-primary-strong" : "border-border-ui bg-panel-2/60 text-text-primary hover:bg-panel-hover"
            }`}
          >
            <p.icon size={17} className="shrink-0" data-gesture="pop" />
            <span className="truncate">{p.label}</span>
            {on && <Check size={15} className="ml-auto shrink-0" />}
          </button>
        );
      })}
    </div>,

    // 3: objetivo
    <div key="goal" className="flex flex-col gap-2">
      {GOALS.map((g) => (
        <Choice key={g.value} selected={biz.goal === g.value} onClick={() => set({ goal: g.value })} icon={g.icon} title={g.title} />
      ))}
    </div>,
  ];

  const titles = canEditBusiness
    ? ["Vamos nos conhecer", "Conte do seu negócio", "Onde você já está?", "O que você quer agora?"]
    : ["Vamos nos conhecer"];
  const subtitles = canEditBusiness
    ? ["Escolha a sua foto ou as iniciais com uma cor.", "Assim o Nexo já sugere os textos e o visual certos.", "Marque tudo o que você usa hoje.", "O Início mostra o próximo passo a partir disso."]
    : ["Escolha a sua foto ou as iniciais com uma cor."];

  const skip = !editar && (
    <button type="button" onClick={() => void finish(true)} disabled={saving} className="rounded-lg px-2 py-1 text-[13px] font-semibold text-white/80 hover:text-white">
      Pular por agora
    </button>
  );
  const progress = steps.length > 1 && (
    <div className="flex gap-1.5" aria-label={`Passo ${step + 1} de ${steps.length}`}>
      {steps.map((label, i) => (
        <span key={label} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-text-secondary/20"}`} />
      ))}
    </div>
  );

  return (
    <div className="relative flex min-h-dvh w-full flex-col bg-panel sm:items-center sm:justify-center sm:bg-transparent sm:px-3 sm:py-10">
      {/* Computador e tablet: fundo vivo na tela toda, com o cartão no meio. */}
      <div className="fixed inset-0 hidden sm:block">
        <MeshBackground />
      </div>

      {/* Celular: faixa do topo com o fundo vivo (como no login); o conteúdo sobe num painel. */}
      <header className="relative isolate flex shrink-0 items-center justify-between overflow-hidden px-5 pb-10 pt-[max(1rem,env(safe-area-inset-top))] text-white sm:hidden">
        <MeshBackground />
        <span className="relative">
          <Logo size={28} tone="light" />
        </span>
        <span className="relative">{skip}</span>
      </header>

      <div className="relative flex w-full flex-1 flex-col sm:max-w-[460px] sm:flex-none sm:gap-4">
        <div className="hidden items-center justify-between px-1 sm:flex">
          <Logo size={30} tone="light" />
          {skip}
        </div>

        <section className="relative z-10 -mt-6 flex flex-1 flex-col gap-4 rounded-t-[24px] bg-panel px-5 pb-28 pt-5 shadow-[0_-12px_30px_-12px_rgb(13_10_31/0.35)] sm:mt-0 sm:flex-none sm:rounded-2xl sm:border sm:border-border-ui sm:bg-panel/95 sm:p-5 sm:shadow-float sm:backdrop-blur-xl">
          {progress}
          <div className="flex flex-col gap-1">
            <h1 className="text-[24px] font-bold leading-tight tracking-tight text-text-primary">{titles[step]}</h1>
            <p className="text-[14px] text-text-secondary">{subtitles[step]}</p>
          </div>

          {!loaded ? (
            <div className="h-48 animate-pulse rounded-xl bg-panel-hover" />
          ) : (
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={step} initial={reduce ? false : { opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={reduce ? undefined : { opacity: 0, x: -14 }} transition={{ duration: 0.16 }}>
                {bodies[step]}
              </motion.div>
            </AnimatePresence>
          )}

          {/* Celular: botões fixos no rodapé, ao alcance do polegar. Computador: no fim do cartão. */}
          <div className="fixed inset-x-0 bottom-0 z-20 flex items-center gap-2 border-t border-border-ui bg-panel/95 px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:pt-1 sm:backdrop-blur-none">
            {step > 0 ? (
              <Button variant="ghost" icon={ArrowLeft} onClick={() => setStep((s) => s - 1)} disabled={saving}>
                Voltar
              </Button>
            ) : editar ? (
              <Button variant="ghost" onClick={() => navigate({ to: "/" })} disabled={saving}>
                Cancelar
              </Button>
            ) : null}
            <span className="flex-1" />
            {last ? (
              <Button variant="gold" size="lg" icon={Check} loading={saving} disabled={!canContinue || !loaded} onClick={() => void finish()}>
                {editar ? "Salvar" : "Concluir"}
              </Button>
            ) : (
              <Button size="lg" onClick={() => setStep((s) => s + 1)} disabled={!canContinue || !loaded}>
                Continuar
                <ArrowRight size={17} data-gesture="nudge" />
              </Button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
