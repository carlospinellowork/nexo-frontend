import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronRight, Lock, Plus, Printer, QrCode as QrCodeIcon, RefreshCw, ScanLine, Shuffle, TriangleAlert } from "../../shared/icons";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { useGetQrCodes } from "../../api/queries/useGetQrCodes";
import { QrDetailSheet } from "../../features/qr/QrDetailSheet";
import { QrFormSheet } from "../../features/qr/QrFormSheet";
import { useQrSvg } from "../../features/qr/qrImage";
import { destinationText, QR_KIND_INFO, QR_KINDS, type QrCode, type QrKind } from "../../features/qr/types";
import { Header } from "../../shared/components/layout/Header";
import { Button } from "../../shared/components/ui/Button";
import { TONES } from "../../shared/components/ui/tones";
import { useWorkspaceRole } from "../../shared/hooks/useWorkspaceRole";

export const Route = createFileRoute("/_app/qr-codes")({
  validateSearch: (search: Record<string, unknown>): { novo?: QrKind } => ({
    novo: (QR_KINDS as readonly unknown[]).includes(search.novo) ? (search.novo as QrKind) : undefined,
  }),
  component: QrCodesPage,
});

const fmt = (n: number) => n.toLocaleString("pt-BR");

function QrCodesPage() {
  const { novo } = Route.useSearch();
  const navigate = useNavigate();
  const { data: items, isLoading, isError, refetch, isFetching } = useGetQrCodes();
  const { canManage } = useWorkspaceRole();
  const [form, setForm] = useState<{ open: boolean; editing: QrCode | null; kind?: QrKind }>({ open: false, editing: null });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // O detalhe lê sempre a versão do cache, para refletir a edição na hora.
  const selected = items?.find((q) => q.id === selectedId) ?? null;

  // Link "Criar QR Code da sua bio" (?novo=bio): abre o formulário já no tipo.
  useEffect(() => {
    if (!novo || !canManage) return;
    setForm({ open: true, editing: null, kind: novo });
    void navigate({ to: "/qr-codes", search: {}, replace: true });
  }, [novo, canManage, navigate]);

  const openCreate = () => setForm({ open: true, editing: null });

  return (
    <div className="flex h-full flex-col">
      <Header
        title="QR Codes"
        subtitle="Imprima uma vez, troque o destino depois"
        actions={
          canManage && !!items?.length ? (
            <Button icon={Plus} onClick={openCreate}>
              Novo QR Code
            </Button>
          ) : undefined
        }
      />

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <ListSkeleton />
        ) : isError ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-danger/12 text-danger-strong">
              <TriangleAlert size={26} />
            </span>
            <div className="flex flex-col gap-1">
              <p className="text-[18px] font-bold tracking-tight text-text-primary">Não foi possível carregar os QR Codes</p>
              <p className="text-[15px] text-text-secondary">Confira a conexão e tente de novo.</p>
            </div>
            <Button size="lg" variant="secondary" icon={RefreshCw} loading={isFetching} onClick={() => void refetch()}>
              Tentar de novo
            </Button>
          </div>
        ) : !items?.length ? (
          <EmptyQr canManage={canManage} onCreate={openCreate} />
        ) : (
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-3 py-4 md:px-6 md:py-6">
            <Summary items={items} />
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
              {items.map((qr, i) => (
                <QrCard key={qr.id} qr={qr} index={i} onOpen={() => setSelectedId(qr.id)} />
              ))}
            </ul>
          </div>
        )}
      </div>

      <QrDetailSheet
        qr={selected}
        canManage={canManage}
        onClose={() => setSelectedId(null)}
        onEdit={(qr) => {
          setSelectedId(null);
          setForm({ open: true, editing: qr });
        }}
      />
      <QrFormSheet
        open={form.open}
        editing={form.editing}
        initialKind={form.kind}
        onClose={() => {
          // Cancelar a edição volta para o detalhe do mesmo QR.
          if (form.editing) setSelectedId(form.editing.id);
          setForm((f) => ({ ...f, open: false }));
        }}
        onSaved={(qr) => setSelectedId(qr.id)}
      />
    </div>
  );
}

function Summary({ items }: { items: QrCode[] }) {
  const last7 = items.reduce((s, q) => s + (q.stats?.last7 ?? 0), 0);
  const last30 = items.reduce((s, q) => s + (q.stats?.last30 ?? 0), 0);
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4">
      {[
        { label: "QR Codes", value: items.length },
        { label: "Leituras em 7 dias", value: last7 },
        { label: "Leituras em 30 dias", value: last30 },
      ].map((s) => (
        <div key={s.label} className="flex min-w-0 flex-col gap-1 rounded-2xl border border-border-ui/70 bg-panel p-3 shadow-card sm:p-4">
          <span className="font-display text-[24px] font-bold leading-none tracking-tight tabular-nums text-text-primary sm:text-[28px]">{fmt(s.value)}</span>
          <span className="text-[12px] font-semibold leading-tight text-text-secondary sm:text-[13px]">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

function QrThumb({ qr }: { qr: QrCode }) {
  const src = useQrSvg(qr.scanUrl);
  if (qr.kind === "wifi") {
    return (
      <span className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${TONES.orange.chip}`}>
        <QR_KIND_INFO.wifi.icon size={28} />
      </span>
    );
  }
  return (
    <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white p-1 shadow-card">
      {src ? <img src={src} alt="" className="h-full w-full" /> : <span className="h-full w-full animate-pulse rounded-xl bg-neutral-100" />}
    </span>
  );
}

function QrCard({ qr, index, onOpen }: { qr: QrCode; index: number; onOpen: () => void }) {
  const reduce = useReducedMotion();
  const info = QR_KIND_INFO[qr.kind];
  const broken = qr.kind !== "wifi" && !qr.destination;
  return (
    <motion.li
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 32, delay: reduce ? 0 : Math.min(index, 8) * 0.035 }}
    >
      <motion.button
        type="button"
        onClick={onOpen}
        whileTap={{ scale: 0.985 }}
        className="flex h-full w-full flex-col gap-3 rounded-2xl border border-border-ui/70 bg-panel p-3.5 text-left shadow-card transition-shadow hover:shadow-float"
      >
        <span className="flex w-full items-center gap-3.5">
          <QrThumb qr={qr} />
          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="truncate text-[16px] font-bold tracking-tight text-text-primary">{qr.label}</span>
            <span className="flex min-w-0 items-center gap-1.5 text-[13px] text-text-secondary">
              <info.icon size={14} className={`shrink-0 ${qr.kind === "wifi" ? TONES.orange.text : TONES.lagoon.text}`} />
              <span className="shrink-0 font-semibold">{info.title}</span>
            </span>
            <span className={`truncate text-[13px] ${broken ? "font-semibold text-danger-strong" : "text-text-secondary"}`}>{destinationText(qr)}</span>
          </span>
          <ChevronRight size={20} className="shrink-0 text-text-secondary/60" />
        </span>
        {qr.stats ? (
          <span className="flex items-center gap-2 rounded-2xl bg-panel-2 px-3 py-2 text-[13px] text-text-secondary">
            <ScanLine size={15} className={`shrink-0 ${TONES.lagoon.text}`} />
            <span>
              <strong className="font-bold tabular-nums text-text-primary">{fmt(qr.stats.last7)}</strong> em 7 dias
            </span>
            <span className="ml-auto">
              <strong className="font-bold tabular-nums text-text-primary">{fmt(qr.stats.last30)}</strong> em 30 dias
            </span>
          </span>
        ) : (
          <span className="flex items-center gap-2 rounded-2xl bg-warning/10 px-3 py-2 text-[13px] font-medium text-warning-strong">
            <Lock size={14} className="shrink-0" /> QR fixo: não conta leituras
          </span>
        )}
      </motion.button>
    </motion.li>
  );
}

function ListSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-3 py-4 md:px-6 md:py-6" aria-busy="true" aria-label="Carregando QR Codes">
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-[72px] animate-pulse rounded-2xl bg-panel shadow-card sm:h-[96px] sm:rounded-3xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-3.5 rounded-3xl bg-panel p-3.5 shadow-card">
            <span className="h-16 w-16 animate-pulse rounded-2xl bg-panel-2" />
            <span className="flex flex-1 flex-col gap-2">
              <span className="h-4 w-2/3 animate-pulse rounded bg-panel-2" />
              <span className="h-3 w-1/2 animate-pulse rounded bg-panel-2" />
              <span className="h-3 w-3/4 animate-pulse rounded bg-panel-2" />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const BENEFITS = [
  { icon: Printer, title: "Imprima uma vez", text: "Cartão pronto para o balcão, a mesa ou a vitrine." },
  { icon: Shuffle, title: "Troque o destino quando quiser", text: "Mudou o número ou a promoção? O QR impresso continua valendo." },
  { icon: ScanLine, title: "Veja quantas pessoas leram", text: "Leituras por dia, para saber qual cartaz funciona." },
];

function EmptyQr({ canManage, onCreate }: { canManage: boolean; onCreate: () => void }) {
  const reduce = useReducedMotion();
  return (
    <div className="flex min-h-full items-center justify-center px-4 py-8">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
        className="flex w-full max-w-md flex-col items-center gap-5 text-center"
      >
        <span className={`relative flex h-20 w-20 items-center justify-center rounded-[26px] ${TONES.lagoon.chip}`}>
          <span className={`pointer-events-none absolute inset-0 -z-10 rounded-full opacity-25 blur-2xl ${TONES.lagoon.glow}`} />
          <QrCodeIcon size={38} strokeWidth={1.8} />
        </span>
        <div className="flex flex-col gap-1.5">
          <h2 className="text-[22px] font-bold leading-tight tracking-tight text-text-primary">Seu primeiro QR Code</h2>
          <p className="text-[15px] leading-relaxed text-text-secondary">Imprima uma vez e troque o destino quando quiser; veja quantas pessoas leram.</p>
        </div>
        <ul className="flex w-full flex-col gap-2 text-left">
          {BENEFITS.map((b) => (
            <li key={b.title} className="flex items-start gap-3 rounded-2xl bg-panel p-3.5 shadow-card">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${TONES.lagoon.chip}`}>
                <b.icon size={19} />
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-[15px] font-semibold text-text-primary">{b.title}</span>
                <span className="text-[13px] leading-snug text-text-secondary">{b.text}</span>
              </span>
            </li>
          ))}
        </ul>
        {canManage ? (
          <Button size="lg" icon={Plus} onClick={onCreate} className="w-full sm:w-auto">
            Criar QR Code
          </Button>
        ) : (
          <p className="text-[14px] text-text-secondary">Peça a um Admin do workspace para criar o primeiro QR Code.</p>
        )}
        <p className="text-[13px] text-text-secondary">WhatsApp, avaliação no Google, Instagram, Minha Bio, página, link ou Wi-Fi.</p>
      </motion.div>
    </div>
  );
}
