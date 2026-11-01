import { useRouterState } from "@tanstack/react-router";
import { MessageSquareHeart } from "../../shared/icons";
import { type FormEvent, useState } from "react";
import { apiErrorMessage } from "../../api/instance";
import { useSendFeedback } from "../../api/mutations/useSendFeedback";
import { Button } from "../../shared/components/ui/Button";
import { Sheet } from "../../shared/components/ui/Sheet";
import { textareaClass } from "../../shared/components/ui/styles";
import { toast } from "../../shared/components/ui/toast-store";

const SCALE = ["Ruim", "Fraco", "Ok", "Bom", "Ótimo"];

/** "Dar opinião" (fase de testes): nota de 1 a 5, texto e a tela atual, direto para o Carlos. */
export function FeedbackButton({ onOpen }: { onOpen?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const { mutateAsync, isPending } = useSendFeedback();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    try {
      await mutateAsync({ rating: rating ?? undefined, message: message.trim(), page: pathname });
      toast.success("Obrigado! Sua opinião chegou.");
      setOpen(false);
      setMessage("");
      setRating(null);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível enviar agora."));
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          onOpen?.();
          setOpen(true);
        }}
        className="nx-anim flex h-11 w-full items-center gap-2.5 rounded-xl px-2.5 text-[14px] font-semibold text-text-primary hover:bg-panel-hover md:h-9"
      >
        <MessageSquareHeart size={17} className="text-primary" data-gesture="pop" /> Dar opinião
      </button>
      <Sheet
        open={open}
        title="Dar opinião"
        onClose={() => setOpen(false)}
        onSubmit={(e) => void submit(e)}
        busy={isPending}
        width="sm"
        footer={
          <Button type="submit" loading={isPending} disabled={!message.trim()}>
            Enviar
          </Button>
        }
      >
        <p className="text-[14px] text-text-secondary">O Nexo está em testes. Conte o que achou, o que travou ou o que faltou. Tudo ajuda.</p>
        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-text-secondary">Nota (opcional)</span>
          <div className="grid grid-cols-5 gap-1.5" role="radiogroup" aria-label="Nota de 1 a 5">
            {SCALE.map((label, i) => (
              <button
                key={label}
                type="button"
                role="radio"
                aria-checked={rating === i + 1}
                onClick={() => setRating(rating === i + 1 ? null : i + 1)}
                className={`flex h-14 flex-col items-center justify-center rounded-xl border text-[16px] font-bold transition-colors ${
                  rating === i + 1 ? "border-primary bg-primary/12 text-primary-strong" : "border-border-ui text-text-primary hover:bg-panel-hover"
                }`}
              >
                {i + 1}
                <span className="text-[11px] font-medium text-text-secondary">{label}</span>
              </button>
            ))}
          </div>
        </div>
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-text-secondary">Sua opinião</span>
          <textarea className={`${textareaClass} min-h-28`} value={message} maxLength={2000} onChange={(e) => setMessage(e.target.value)} placeholder="Ex.: achei fácil criar a bio, mas não entendi o QR Code." />
        </label>
        <p className="text-[12px] text-text-secondary">Enviamos junto a tela em que você está ({pathname}).</p>
      </Sheet>
    </>
  );
}
