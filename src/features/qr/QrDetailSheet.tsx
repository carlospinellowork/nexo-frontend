import { isAxiosError } from "axios";
import { Check, Copy, Download, ExternalLink, FileCode2, Info, Loader2, Lock, Pencil, Printer, ShieldAlert, Trash2, TriangleAlert } from "../../shared/icons";
import { useEffect, useState } from "react";
import { apiErrorMessage } from "../../api/instance";
import { useDeleteQrCode } from "../../api/mutations/useDeleteQrCode";
import { useGetQrContent } from "../../api/queries/useGetQrContent";
import { useGetQrScans } from "../../api/queries/useGetQrScans";
import { DailyBars } from "../insights/DailyBars";
import { Button } from "../../shared/components/ui/Button";
import { Sheet } from "../../shared/components/ui/Sheet";
import { inputClass } from "../../shared/components/ui/styles";
import { toast } from "../../shared/components/ui/toast-store";
import { TONES } from "../../shared/components/ui/tones";
import { PrintArea, PrintCard } from "./PrintCard";
import { downloadPng, downloadSvg, useQrSvg } from "./qrImage";
import { destinationText, QR_KIND_INFO, type QrCode, WIFI_SECURITY_LABEL } from "./types";

interface QrDetailSheetProps {
  qr: QrCode | null;
  onClose: () => void;
  onEdit: (qr: QrCode) => void;
  canManage: boolean;
}

const fmt = (n: number) => n.toLocaleString("pt-BR");

/** Detalhe do QR Code: prévia, baixar, copiar, cartão para imprimir, leituras, trocar o destino e apagar. */
export function QrDetailSheet({ qr, onClose, onEdit, canManage }: QrDetailSheetProps) {
  return (
    <Sheet open={!!qr} title={qr?.label ?? "QR Code"} onClose={onClose} width="lg">
      {qr && <DetailBody key={qr.id} qr={qr} onEdit={onEdit} onDeleted={onClose} canManage={canManage} />}
    </Sheet>
  );
}

function DetailBody({ qr, onEdit, onDeleted, canManage }: { qr: QrCode; onEdit: (qr: QrCode) => void; onDeleted: () => void; canManage: boolean }) {
  const isWifi = qr.kind === "wifi";
  const info = QR_KIND_INFO[qr.kind];
  const contentQuery = useGetQrContent(qr.id, isWifi && canManage);
  const content = isWifi ? (contentQuery.data ?? null) : qr.scanUrl;
  const qrSrc = useQrSvg(content);
  const [cardTitle, setCardTitle] = useState(info.cardTitle);
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { mutate: remove, isPending: deleting } = useDeleteQrCode();

  useEffect(() => {
    if (!confirmDelete) return;
    const t = setTimeout(() => setConfirmDelete(false), 6000);
    return () => clearTimeout(t);
  }, [confirmDelete]);

  const copy = async () => {
    if (!qr.scanUrl) return;
    try {
      await navigator.clipboard.writeText(qr.scanUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar. Selecione o endereço e copie à mão.");
    }
  };

  const download = async (type: "png" | "svg") => {
    if (!content) return;
    try {
      await (type === "png" ? downloadPng(content, qr.label) : downloadSvg(content, qr.label));
    } catch {
      toast.error("Não foi possível gerar o arquivo. Tente de novo.");
    }
  };

  const doDelete = () =>
    remove(qr.id, {
      onSuccess: () => {
        toast.success("QR Code apagado. Quem ler um impresso vai ver um aviso de QR desativado.");
        onDeleted();
      },
      onError: (err) => {
        setConfirmDelete(false);
        toast.error(apiErrorMessage(err, "Não foi possível apagar o QR Code."));
      },
    });

  const forbidden = isWifi && (!canManage || (isAxiosError(contentQuery.error) && contentQuery.error.response?.status === 403));
  const caption = isWifi ? `Rede ${qr.target.ssid}` : undefined;

  return (
    <>
      {/* Prévia grande */}
      <section className="flex flex-col items-center gap-4">
        <div className="flex w-full items-center gap-2">
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${isWifi ? TONES.orange.chip : TONES.lagoon.chip}`}>
            <info.icon size={18} />
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="text-[13px] font-semibold text-text-secondary">{info.title}</span>
            <span className={`truncate text-[15px] font-semibold ${qr.destination || isWifi ? "text-text-primary" : "text-danger-strong"}`}>{destinationText(qr)}</span>
          </span>
          {qr.destination && (
            <a
              href={qr.destination}
              target="_blank"
              rel="noreferrer"
              aria-label="Abrir o destino"
              title="Abrir o destino"
              className="ml-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-text-secondary hover:bg-panel-hover"
            >
              <ExternalLink size={18} />
            </a>
          )}
        </div>

        <div className="w-full max-w-[260px] rounded-3xl bg-white p-3 shadow-card">
          {qrSrc ? (
            <img src={qrSrc} alt={`QR Code ${qr.label}`} className="aspect-square w-full" />
          ) : forbidden ? (
            <div className="flex aspect-square flex-col items-center justify-center gap-2 p-4 text-center text-neutral-600">
              <Lock size={28} />
              <span className="text-[14px] font-semibold leading-snug">Só Admin vê este QR, porque ele leva a senha da rede.</span>
              <span className="text-[13px] leading-snug">Peça a um Admin do workspace para baixar ou imprimir.</span>
            </div>
          ) : contentQuery.isError ? (
            <div className="flex aspect-square flex-col items-center justify-center gap-2 p-4 text-center text-neutral-600">
              <TriangleAlert size={28} />
              <span className="text-[14px] font-semibold">Não foi possível gerar o QR.</span>
              <button type="button" onClick={() => void contentQuery.refetch()} className="min-h-11 rounded-xl px-3 text-[14px] font-semibold text-primary-strong">
                Tentar de novo
              </button>
            </div>
          ) : (
            <div className="flex aspect-square items-center justify-center text-neutral-500">
              <Loader2 size={28} className="animate-spin" />
            </div>
          )}
        </div>

        {qr.scanUrl && (
          <div className="flex w-full items-center gap-2 rounded-2xl bg-panel-2 p-1.5 pl-3">
            <span className="min-w-0 flex-1 truncate font-mono text-[13px] text-text-primary" title={qr.scanUrl}>
              {qr.scanUrl.replace(/^https?:\/\//, "")}
            </span>
            <Button size="md" variant="secondary" icon={copied ? Check : Copy} onClick={() => void copy()} className="h-11 shrink-0">
              {copied ? "Copiado" : "Copiar link"}
            </Button>
          </div>
        )}

        {!forbidden && (
          <>
            <div className="grid w-full grid-cols-2 gap-2">
              <Button size="lg" icon={Download} disabled={!content} onClick={() => void download("png")} className="w-full px-3 text-[15px]">
                Baixar PNG
              </Button>
              <Button size="lg" variant="secondary" icon={FileCode2} disabled={!content} onClick={() => void download("svg")} className="w-full px-3 text-[15px]">
                Baixar SVG
              </Button>
              <Button
                size="lg"
                variant="outline"
                icon={Printer}
                disabled={!qrSrc}
                onClick={() => document.getElementById("qr-print-card")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                className="col-span-2 w-full"
              >
                Imprimir cartão
              </Button>
            </div>
            <p className="-mt-1 text-center text-[13px] text-text-secondary">PNG para redes e gráfica rápida; SVG para ampliar em banner e adesivo sem perder qualidade.</p>
          </>
        )}
      </section>

      {/* Leituras ou aviso do Wi-Fi */}
      {isWifi ? <WifiInfo qr={qr} /> : <ScansSection qr={qr} />}

      {/* Cartão para imprimir */}
      {qrSrc && (
        <section id="qr-print-card" className="flex scroll-mt-4 flex-col gap-3 rounded-3xl bg-panel-2 p-4">
          <div className="flex flex-col gap-0.5">
            <h3 className="text-[16px] font-bold tracking-tight text-text-primary">Cartão para imprimir</h3>
            <p className="text-[13px] leading-snug text-text-secondary">Para o balcão, a mesa ou a vitrine. Troque o título se quiser.</p>
          </div>
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold text-text-secondary">Título do cartão</span>
            <input value={cardTitle} maxLength={60} onChange={(e) => setCardTitle(e.target.value)} placeholder={info.cardTitle} className={`${inputClass} bg-panel`} />
          </label>
          <PrintCard qrSrc={qrSrc} title={cardTitle.trim() || info.cardTitle} label={qr.label} caption={caption} />
          <Button size="lg" icon={Printer} onClick={() => window.print()} className="w-full">
            Imprimir agora
          </Button>
          <PrintArea qrSrc={qrSrc} title={cardTitle.trim() || info.cardTitle} label={qr.label} caption={caption} />
        </section>
      )}

      {/* Trocar o destino e apagar */}
      {canManage ? (
        <section className="flex flex-col gap-3 rounded-3xl border border-border-ui p-4">
          <div className="flex flex-col gap-0.5">
            <h3 className="text-[16px] font-bold tracking-tight text-text-primary">{isWifi ? "Editar a rede" : "Trocar o destino"}</h3>
            <p className="text-[13px] leading-snug text-text-secondary">
              {isWifi ? "Mudou a senha ou o nome da rede? Atualize aqui e imprima de novo." : "O QR impresso continua o mesmo: ele passa a levar para o novo destino na hora."}
            </p>
          </div>
          <Button size="lg" variant="secondary" icon={Pencil} onClick={() => onEdit(qr)} className="w-full">
            {isWifi ? "Editar Wi-Fi" : "Trocar destino ou nome"}
          </Button>
          {confirmDelete ? (
            <div role="alert" className="flex flex-col gap-2 rounded-2xl bg-danger/10 p-3">
              <p className="text-[14px] font-semibold leading-snug text-danger-strong">
                Apagar de vez? {isWifi ? "O impresso continua conectando na rede, mas o QR some do Nexo." : "Quem ler um QR impresso vai ver que ele foi desativado."}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button size="lg" variant="ghost" onClick={() => setConfirmDelete(false)} className="w-full">
                  Cancelar
                </Button>
                <Button size="lg" variant="danger" icon={Trash2} loading={deleting} onClick={doDelete} className="w-full">
                  Apagar
                </Button>
              </div>
            </div>
          ) : (
            <Button size="lg" variant="ghost" icon={Trash2} onClick={() => setConfirmDelete(true)} className="w-full !text-danger-strong">
              Apagar QR Code
            </Button>
          )}
        </section>
      ) : (
        <p className="flex items-start gap-2 rounded-2xl bg-panel-2 p-3 text-[13px] leading-snug text-text-secondary">
          <ShieldAlert size={16} className="mt-0.5 shrink-0" />
          Você é Membro deste workspace: pode ver e baixar, mas só Admin troca o destino ou apaga.
        </p>
      )}
    </>
  );
}

function ScansSection({ qr }: { qr: Extract<QrCode, { kind: Exclude<QrCode["kind"], "wifi"> }> }) {
  const { data: days, isLoading, isError, refetch } = useGetQrScans(qr.id);
  const total = days?.reduce((s, d) => s + d.count, 0) ?? 0;
  return (
    <section className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <StatTile label="Leituras em 7 dias" value={qr.stats.last7} />
        <StatTile label="Leituras em 30 dias" value={qr.stats.last30} />
      </div>
      <div className="rounded-3xl bg-panel-2 p-4">
        <h3 className="mb-3 text-[15px] font-bold tracking-tight text-text-primary">Leituras por dia</h3>
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 size={24} className="animate-spin text-primary" />
          </div>
        ) : isError || !days ? (
          <div className="flex h-40 flex-col items-center justify-center gap-2 text-center">
            <p className="text-[14px] text-text-secondary">Não foi possível carregar as leituras.</p>
            <Button size="sm" variant="secondary" onClick={() => void refetch()}>
              Tentar de novo
            </Button>
          </div>
        ) : total === 0 ? (
          <p className="flex min-h-24 items-center justify-center rounded-2xl text-center text-[14px] leading-snug text-text-secondary">
            Ainda sem leituras nos últimos 30 dias. Assim que alguém apontar a câmera, aparece aqui.
          </p>
        ) : (
          <DailyBars data={days.map((d) => ({ date: d.day, count: d.count }))} label="Leituras por dia nos últimos 30 dias" unit={{ one: "leitura", other: "leituras" }} height={170} />
        )}
        <p className="mt-2 text-[12px] leading-snug text-text-secondary">Cada pessoa conta uma vez por dia. Prévias de link e robôs não contam.</p>
      </div>
    </section>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-panel-2 p-3.5">
      <span className="text-[13px] font-semibold text-text-secondary">{label}</span>
      <span className="text-[28px] font-extrabold leading-none tracking-tight tabular-nums text-text-primary">{fmt(value)}</span>
    </div>
  );
}

function WifiInfo({ qr }: { qr: Extract<QrCode, { kind: "wifi" }> }) {
  return (
    <section className="flex flex-col gap-3 rounded-3xl bg-warning/10 p-4">
      <p className="flex items-start gap-2 text-[14px] leading-snug text-warning-strong">
        <Info size={17} className="mt-0.5 shrink-0" />
        <span>
          <strong className="font-semibold">QR fixo: não conta leituras.</strong> O celular lê a rede direto, sem passar pelo Nexo. Trocar a senha do Wi-Fi exige imprimir de novo.
        </span>
      </p>
      <dl className="grid grid-cols-2 gap-2 text-[13px]">
        <div className="flex flex-col gap-0.5 rounded-2xl bg-panel p-3">
          <dt className="font-semibold text-text-secondary">Segurança</dt>
          <dd className="font-semibold text-text-primary">{WIFI_SECURITY_LABEL[qr.target.security]}</dd>
        </div>
        <div className="flex flex-col gap-0.5 rounded-2xl bg-panel p-3">
          <dt className="font-semibold text-text-secondary">Senha</dt>
          <dd className="font-semibold text-text-primary">{qr.target.security === "nopass" ? "Rede aberta" : qr.target.hasPassword ? "Guardada" : "Não informada"}</dd>
        </div>
      </dl>
    </section>
  );
}
