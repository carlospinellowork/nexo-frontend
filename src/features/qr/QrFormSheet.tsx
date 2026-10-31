import { Link as RouterLink } from "@tanstack/react-router";
import { isAxiosError } from "axios";
import { ArrowRight, Eye, EyeOff, Info, KeyRound, Lock, TriangleAlert } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import { apiErrorMessage } from "../../api/instance";
import { useCreateQrCode } from "../../api/mutations/useCreateQrCode";
import { useUpdateQrCode } from "../../api/mutations/useUpdateQrCode";
import { useGetLandingPages } from "../../api/queries/useGetLandingPages";
import { Button } from "../../shared/components/ui/Button";
import { Segmented } from "../../shared/components/ui/Segmented";
import { Sheet } from "../../shared/components/ui/Sheet";
import { inputClass, selectClass, textareaClass } from "../../shared/components/ui/styles";
import { Switch } from "../../shared/components/ui/Switch";
import { toast } from "../../shared/components/ui/toast-store";
import { TONES } from "../../shared/components/ui/tones";
import { LABEL_MAX, QR_KIND_INFO, QR_KINDS, type QrCode, type QrInput, type QrKind, WIFI_SECURITY_LABEL, type WifiSecurity } from "./types";

interface QrFormSheetProps {
  open: boolean;
  onClose: () => void;
  /** Com um QR, edita; sem, cria. */
  editing?: QrCode | null;
  /** Tipo já escolhido ao abrir (ex.: link "Criar QR Code da sua bio"). */
  initialKind?: QrKind;
  onSaved?: (qr: QrCode) => void;
}

interface Draft {
  label: string;
  pageId: string;
  phone: string;
  message: string;
  reviewUrl: string;
  username: string;
  url: string;
  ssid: string;
  security: WifiSecurity;
  password: string;
  hidden: boolean;
}

const EMPTY: Draft = { label: "", pageId: "", phone: "", message: "", reviewUrl: "", username: "", url: "", ssid: "", security: "WPA", password: "", hidden: false };

function draftFrom(qr: QrCode): Draft {
  const d: Draft = { ...EMPTY, label: qr.label };
  switch (qr.kind) {
    case "bio":
    case "page":
      return { ...d, pageId: qr.target.pageId };
    case "whatsapp":
      return { ...d, phone: qr.target.phone, message: qr.target.message ?? "" };
    case "google_review":
      return { ...d, reviewUrl: qr.target.url };
    case "instagram":
      return { ...d, username: qr.target.username };
    case "url":
      return { ...d, url: qr.target.url };
    case "wifi":
      return { ...d, ssid: qr.target.ssid, security: qr.target.security, hidden: Boolean(qr.target.hidden) };
  }
}

/** Número com DDD vira 55 + DDD + número; quem já digitou o DDI fica como está. */
const normalizePhone = (v: string) => {
  const d = v.replace(/\D/g, "");
  return (d.length === 10 || d.length === 11) && !d.startsWith("55") ? `55${d}` : d;
};

function toInput(kind: QrKind, d: Draft): QrInput {
  const label = d.label.trim() || QR_KIND_INFO[kind].defaultLabel;
  switch (kind) {
    case "bio":
    case "page":
      return { label, kind, target: { pageId: d.pageId } };
    case "whatsapp":
      return { label, kind, target: { phone: normalizePhone(d.phone), ...(d.message.trim() ? { message: d.message.trim() } : {}) } };
    case "google_review":
      return { label, kind, target: { url: d.reviewUrl.trim() } };
    case "instagram":
      return { label, kind, target: { username: d.username.trim().replace(/^@/, "") } };
    case "url":
      return { label, kind, target: { url: d.url.trim() } };
    case "wifi":
      return {
        label,
        kind,
        target: { ssid: d.ssid, security: d.security, ...(d.security !== "nopass" && d.password ? { password: d.password } : {}), hidden: d.hidden },
      };
  }
}

/** Erros de validação do backend por campo (`/target/phone` ou `target.password` viram `phone`/`password`). */
function fieldErrors(err: unknown): Record<string, string> {
  if (!isAxiosError<{ message?: string; issues?: { path?: string | string[]; message: string }[]; details?: { path?: string } }>(err)) return {};
  const body = err.response?.data;
  const out: Record<string, string> = {};
  for (const issue of body?.issues ?? []) {
    const path = Array.isArray(issue.path) ? issue.path.join("/") : (issue.path ?? "");
    const key = path.split(/[/.]/).filter(Boolean).pop();
    if (key) out[key] = issue.message;
  }
  const detail = body?.details?.path?.split(".").pop();
  if (detail) out[detail] = body?.message ?? "Confira este campo";
  return out;
}

/** Criar ou editar um QR Code: primeiro o tipo (cartões com ícone), depois os campos do tipo. */
export function QrFormSheet({ open, onClose, editing, initialKind, onSaved }: QrFormSheetProps) {
  const [kind, setKind] = useState<QrKind | null>(null);
  const [step, setStep] = useState<"kind" | "fields">("kind");
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const create = useCreateQrCode();
  const update = useUpdateQrCode();
  const saving = create.isPending || update.isPending;

  // Cada abertura começa do zero (ou do QR em edição).
  useEffect(() => {
    if (!open) return;
    setErrors({});
    if (editing) {
      setKind(editing.kind);
      setDraft(draftFrom(editing));
      setStep("fields");
    } else {
      setKind(initialKind ?? null);
      setDraft(EMPTY);
      setStep(initialKind ? "fields" : "kind");
    }
  }, [open, editing, initialKind]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setErrors((e) => {
      const fieldKey = key === "reviewUrl" ? "url" : key;
      if (!(fieldKey in e)) return e;
      const next = { ...e };
      delete next[fieldKey];
      return next;
    });
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!kind) return;
    const input = toInput(kind, draft);
    try {
      const saved = editing ? await update.mutateAsync({ id: editing.id, input }) : await create.mutateAsync(input);
      toast.success(editing ? "QR Code salvo. O impresso continua valendo." : "QR Code criado.");
      onSaved?.(saved);
      onClose();
    } catch (err) {
      setErrors(fieldErrors(err));
      toast.error(apiErrorMessage(err, editing ? "Não foi possível salvar o QR Code." : "Não foi possível criar o QR Code."));
    }
  };

  const editingWifi = editing?.kind === "wifi";
  const title = step === "kind" ? (editing ? "Trocar o tipo" : "Novo QR Code") : editing ? "Editar QR Code" : kind ? QR_KIND_INFO[kind].title : "Novo QR Code";
  const canGoBack = step === "fields" && !editingWifi;

  return (
    <Sheet
      open={open}
      title={title}
      onClose={onClose}
      onBack={canGoBack ? () => setStep("kind") : undefined}
      footer={
        step === "fields" && kind ? (
          <>
            <Button type="button" variant="ghost" size="lg" onClick={onClose} className="flex-1 md:flex-none">
              Cancelar
            </Button>
            <Button type="submit" form="qr-form" size="lg" loading={saving} className="flex-[2] md:ml-auto md:flex-none">
              {editing ? "Salvar" : "Criar QR Code"}
            </Button>
          </>
        ) : undefined
      }
    >
      {step === "kind" ? (
        <KindPicker
          value={kind}
          disabled={editing ? (k) => (k === "wifi") !== editingWifi : undefined}
          onPick={(k) => {
            setKind(k);
            setErrors({});
            setStep("fields");
          }}
        />
      ) : kind ? (
        <form id="qr-form" onSubmit={(e) => void submit(e)} className="flex flex-col gap-4" noValidate>
          {editing && !editingWifi && (
            <Notice icon={Info} tone="primary">
              Pode trocar o destino à vontade: o QR impresso continua o mesmo e passa a levar para o novo endereço.
            </Notice>
          )}
          {kind === "wifi" && (
            <Notice icon={Lock} tone="warning">
              QR fixo: o celular lê a rede direto, sem passar pelo Nexo, então não conta leituras. Se trocar a senha do Wi-Fi, imprima de novo.
            </Notice>
          )}

          <KindFields kind={kind} draft={draft} set={set} errors={errors} editing={editing ?? null} />

          <Field label="Nome do QR Code" hint="Só você vê. Ajuda a achar o QR depois, ex.: Mesa 3, Vitrine." error={errors.label}>
            {(id) => (
              <input
                id={id}
                value={draft.label}
                maxLength={LABEL_MAX}
                onChange={(e) => set("label", e.target.value)}
                placeholder={QR_KIND_INFO[kind].defaultLabel}
                enterKeyHint="done"
                className={inputClass}
              />
            )}
          </Field>
        </form>
      ) : null}
    </Sheet>
  );
}

function KindPicker({ value, onPick, disabled }: { value: QrKind | null; onPick: (k: QrKind) => void; disabled?: (k: QrKind) => boolean }) {
  const reduce = useReducedMotion();
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[14px] leading-snug text-text-secondary">O que acontece quando alguém aponta a câmera?</p>
      <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2">
        {QR_KINDS.map((k, i) => {
          const info = QR_KIND_INFO[k];
          const off = disabled?.(k) ?? false;
          const active = value === k;
          return (
            <motion.button
              key={k}
              type="button"
              disabled={off}
              onClick={() => onPick(k)}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: off ? 0.45 : 1, y: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 32, delay: reduce ? 0 : i * 0.025 }}
              whileTap={off ? undefined : { scale: 0.98 }}
              className={`flex min-h-[72px] items-center gap-3 rounded-2xl border p-3 text-left transition-colors disabled:cursor-not-allowed ${
                active ? "border-primary bg-primary/8" : "border-border-ui bg-panel-2 hover:bg-panel-hover"
              }`}
            >
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${k === "wifi" ? TONES.orange.chip : TONES.lagoon.chip}`}>
                <info.icon size={21} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-[15px] font-semibold text-text-primary">{info.title}</span>
                <span className="text-[13px] leading-snug text-text-secondary">{info.description}</span>
              </span>
            </motion.button>
          );
        })}
      </div>
      <p className="flex items-start gap-2 text-[13px] leading-snug text-text-secondary">
        <Info size={15} className="mt-0.5 shrink-0" />
        Todos, menos o Wi-Fi, são dinâmicos: dá para trocar o destino depois sem reimprimir, e o Nexo conta as leituras.
      </p>
    </div>
  );
}

function Notice({ icon: Icon, tone, children }: { icon: typeof Info; tone: "primary" | "warning"; children: ReactNode }) {
  const cls = tone === "warning" ? "bg-warning/12 text-warning-strong" : "bg-primary/10 text-primary-strong";
  return (
    <div className={`flex items-start gap-2.5 rounded-2xl p-3 text-[13px] leading-snug ${cls}`}>
      <Icon size={16} className="mt-0.5 shrink-0" />
      <p>{children}</p>
    </div>
  );
}

function Field({ label, hint, error, children }: { label: string; hint?: ReactNode; error?: string; children: (id: string) => ReactNode }) {
  const id = useMemo(() => `qr-${label.toLowerCase().replace(/[^a-z]+/g, "-")}`, [label]);
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-semibold text-text-secondary">
        {label}
      </label>
      {children(id)}
      {error ? (
        <p role="alert" className="text-[13px] font-medium text-danger-strong">
          {error}
        </p>
      ) : (
        hint && <p className="text-[13px] leading-snug text-text-secondary">{hint}</p>
      )}
    </div>
  );
}

const errorRing = (has: boolean) => (has ? "border-danger focus:border-danger focus:ring-danger/15" : "");

interface KindFieldsProps {
  kind: QrKind;
  draft: Draft;
  set: <K extends keyof Draft>(key: K, value: Draft[K]) => void;
  errors: Record<string, string>;
  editing: QrCode | null;
}

function KindFields({ kind, draft, set, errors, editing }: KindFieldsProps) {
  const [showPassword, setShowPassword] = useState(false);

  switch (kind) {
    case "bio":
    case "page":
      return <PageField kind={kind} value={draft.pageId} onChange={(v) => set("pageId", v)} error={errors.pageId} />;

    case "whatsapp":
      return (
        <>
          <Field label="Número do WhatsApp" hint="Com DDD. O 55 do Brasil entra sozinho." error={errors.phone}>
            {(id) => (
              <input
                id={id}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={draft.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="(11) 99999-9999"
                className={`${inputClass} ${errorRing(!!errors.phone)}`}
              />
            )}
          </Field>
          <Field label="Mensagem pronta (opcional)" hint="Já aparece escrita para a pessoa só tocar em enviar." error={errors.message}>
            {(id) => (
              <textarea
                id={id}
                value={draft.message}
                maxLength={300}
                rows={3}
                onChange={(e) => set("message", e.target.value)}
                placeholder="Olá! Vi o QR Code na loja e quero saber mais."
                className={textareaClass}
              />
            )}
          </Field>
        </>
      );

    case "google_review":
      return (
        <Field
          label="Link de avaliação do Google"
          hint="No seu Perfil da Empresa no Google, toque em Pedir avaliações e copie o link (começa com https://g.page)."
          error={errors.url}
        >
          {(id) => (
            <input
              id={id}
              type="url"
              inputMode="url"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={draft.reviewUrl}
              onChange={(e) => set("reviewUrl", e.target.value)}
              placeholder="https://g.page/r/..."
              className={`${inputClass} ${errorRing(!!errors.url)}`}
            />
          )}
        </Field>
      );

    case "instagram":
      return (
        <Field label="Seu @ no Instagram" error={errors.username}>
          {(id) => (
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[15px] text-text-secondary">@</span>
              <input
                id={id}
                autoCapitalize="none"
                autoCorrect="off"
                autoComplete="off"
                spellCheck={false}
                value={draft.username}
                onChange={(e) => set("username", e.target.value.replace(/^@/, ""))}
                placeholder="suaempresa"
                className={`${inputClass} pl-8 ${errorRing(!!errors.username)}`}
              />
            </div>
          )}
        </Field>
      );

    case "url":
      return (
        <Field label="Endereço" hint="Cardápio, loja, formulário ou qualquer site com https." error={errors.url}>
          {(id) => (
            <input
              id={id}
              type="url"
              inputMode="url"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={draft.url}
              onChange={(e) => set("url", e.target.value)}
              placeholder="https://"
              className={`${inputClass} ${errorRing(!!errors.url)}`}
            />
          )}
        </Field>
      );

    case "wifi": {
      const hasPassword = editing?.kind === "wifi" && editing.target.hasPassword;
      return (
        <>
          <Field label="Nome da rede" hint="Exatamente como aparece no celular, com maiúsculas." error={errors.ssid}>
            {(id) => (
              <input
                id={id}
                autoCapitalize="none"
                autoCorrect="off"
                autoComplete="off"
                spellCheck={false}
                maxLength={32}
                value={draft.ssid}
                onChange={(e) => set("ssid", e.target.value)}
                placeholder="Loja_Clientes"
                className={`${inputClass} ${errorRing(!!errors.ssid)}`}
              />
            )}
          </Field>
          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold text-text-secondary">Segurança</span>
            <Segmented
              label="Segurança da rede"
              fullWidth
              value={draft.security}
              onChange={(v) => set("security", v)}
              options={(["WPA", "WEP", "nopass"] as const).map((v) => ({ value: v, label: WIFI_SECURITY_LABEL[v] }))}
            />
            <span className="text-[13px] text-text-secondary">Na dúvida, deixe WPA/WPA2: é o padrão dos roteadores.</span>
          </div>
          {draft.security !== "nopass" && (
            <Field
              label="Senha do Wi-Fi"
              hint={hasPassword ? "Deixe vazio para manter a senha atual." : draft.security === "WPA" ? "No mínimo 8 caracteres." : undefined}
              error={errors.password}
            >
              {(id) => (
                <div className="flex flex-col gap-2">
                  {hasPassword && (
                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-success/14 px-2.5 py-1 text-[12px] font-semibold text-success-strong">
                      <KeyRound size={13} /> Senha guardada
                    </span>
                  )}
                  <div className="relative">
                    <input
                      id={id}
                      type={showPassword ? "text" : "password"}
                      autoCapitalize="none"
                      autoCorrect="off"
                      autoComplete="new-password"
                      spellCheck={false}
                      maxLength={63}
                      value={draft.password}
                      onChange={(e) => set("password", e.target.value)}
                      placeholder={hasPassword ? "Manter a senha atual" : "Senha da rede"}
                      className={`${inputClass} pr-12 ${errorRing(!!errors.password)}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? "Esconder a senha" : "Mostrar a senha"}
                      className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center rounded-xl text-text-secondary hover:text-text-primary"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              )}
            </Field>
          )}
          <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-2xl bg-panel-2 px-3.5 py-2">
            <span className="flex flex-col">
              <span className="text-[15px] font-medium text-text-primary">Rede oculta</span>
              <span className="text-[13px] text-text-secondary">Ligue se a rede não aparece na lista do celular.</span>
            </span>
            <Switch label="Rede oculta" checked={draft.hidden} onChange={(v) => set("hidden", v)} />
          </label>
        </>
      );
    }
  }
}

function PageField({ kind, value, onChange, error }: { kind: "bio" | "page"; value: string; onChange: (v: string) => void; error?: string }) {
  const { data: pages, isLoading, isError } = useGetLandingPages();
  const options = useMemo(() => (pages ?? []).filter((p) => (p.settings.layout === "bio") === (kind === "bio")), [pages, kind]);

  // Uma opção só (o caso comum da bio): já vem escolhida.
  useEffect(() => {
    if (!options.length) return;
    if (!options.some((p) => p.id === value)) onChange(options[0].id);
  }, [options, value, onChange]);

  if (isLoading) return <div className="h-[72px] animate-pulse rounded-2xl bg-panel-2" />;
  if (isError) {
    return (
      <Notice icon={TriangleAlert} tone="warning">
        Não foi possível carregar as suas páginas. Feche e tente de novo.
      </Notice>
    );
  }
  if (!options.length) {
    return (
      <div className="flex flex-col gap-3 rounded-2xl bg-panel-2 p-4">
        <p className="text-[14px] leading-snug text-text-primary">
          {kind === "bio" ? "Você ainda não tem uma bio. Crie em 2 minutos e volte aqui." : "Você ainda não tem uma página. Crie uma e volte aqui."}
        </p>
        <RouterLink
          to={kind === "bio" ? "/minha-bio" : "/landing-pages"}
          className="inline-flex min-h-11 w-fit items-center gap-1.5 rounded-xl bg-primary/12 px-4 text-[14px] font-semibold text-primary-strong hover:bg-primary/18"
        >
          {kind === "bio" ? "Criar minha bio" : "Criar uma página"}
          <ArrowRight size={16} />
        </RouterLink>
      </div>
    );
  }

  const selected = options.find((p) => p.id === value);
  return (
    <div className="flex flex-col gap-2">
      {options.length > 1 || kind === "page" ? (
        <Field label={kind === "bio" ? "Qual bio" : "Qual página"} error={error}>
          {(id) => (
            <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={selectClass}>
              {options.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          )}
        </Field>
      ) : (
        selected && (
          <div className="flex flex-col gap-0.5 rounded-2xl bg-panel-2 p-3.5">
            <span className="text-[13px] font-semibold text-text-secondary">Leva para a sua bio</span>
            <span className="truncate text-[15px] font-semibold text-text-primary">{selected.title}</span>
            <span className="truncate font-mono text-[12px] text-text-secondary">/p/{selected.slug}</span>
          </div>
        )
      )}
      {selected && !selected.publishedAt && (
        <Notice icon={TriangleAlert} tone="warning">
          Esta página ainda é rascunho. Publique antes de imprimir, senão quem ler o QR não encontra nada.
        </Notice>
      )}
    </div>
  );
}
