import { useId, useRef, useState } from "react";
import { apiErrorMessage } from "../../api/instance";
import { useUploadImage } from "../../api/mutations/useUploadImage";
import { Button } from "../../shared/components/ui/Button";
import { inputClass } from "../../shared/components/ui/styles";
import { toast } from "../../shared/components/ui/toast-store";
import { Camera, Link2, Loader2, Trash2 } from "../../shared/icons";
import { type ImageShape, imageSrc, isImageUrl, shrinkImage } from "./image";

interface ImageFieldProps {
  label: string;
  value?: string;
  onChange: (url: string | undefined) => void;
  shape?: ImageShape;
  hint?: string;
}

/** Foto por upload (reduzida no aparelho) ou, se preferir, por link https. */
export function ImageField({ label, value, onChange, shape = "square", hint }: ImageFieldProps) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const { mutateAsync: upload } = useUploadImage();
  const [busy, setBusy] = useState(false);
  const [byLink, setByLink] = useState(false);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      onChange(await upload(await shrinkImage(file, shape)));
    } catch (err) {
      toast.error(err instanceof Error && !("isAxiosError" in err) ? err.message : apiErrorMessage(err, "Não foi possível enviar a foto."));
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  const valid = isImageUrl(value);
  const thumb = shape === "square" ? "h-16 w-16 rounded-full" : shape === "portrait" ? "h-20 w-12 rounded-lg" : "h-14 w-20 rounded-lg";

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[13px] font-semibold text-text-secondary">{label}</span>
      <div className="flex items-center gap-3">
        <span className={`${thumb} flex shrink-0 items-center justify-center overflow-hidden border border-border-ui bg-panel-2 text-text-secondary`}>
          {busy ? <Loader2 size={20} className="animate-spin" /> : valid ? <img src={imageSrc(value)} alt="" className="h-full w-full object-cover" /> : <Camera size={22} />}
        </span>
        <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
          <input ref={input} id={id} type="file" accept="image/*" className="sr-only" onChange={(e) => void pick(e.target.files?.[0])} />
          <Button variant="secondary" icon={Camera} onClick={() => input.current?.click()} loading={busy}>
            {value ? "Trocar foto" : "Enviar foto"}
          </Button>
          {value && (
            <Button variant="ghost" icon={Trash2} onClick={() => onChange(undefined)} aria-label={`Remover ${label.toLowerCase()}`}>
              Remover
            </Button>
          )}
        </div>
      </div>
      {hint && <span className="text-[12px] text-text-secondary">{hint}</span>}
      {byLink || (value && !valid) ? (
        <>
          <input className={inputClass} inputMode="url" autoCapitalize="none" autoCorrect="off" placeholder="https://" value={value ?? ""} onChange={(e) => onChange(e.target.value.trim() || undefined)} aria-label={`${label} por link`} />
          {value && !valid && <span className="text-[12px] text-danger-strong">O endereço precisa começar com https://</span>}
        </>
      ) : (
        <button type="button" onClick={() => setByLink(true)} className="flex w-fit items-center gap-1 text-[12.5px] font-semibold text-primary-strong">
          <Link2 size={13} /> Usar um link de imagem
        </button>
      )}
    </div>
  );
}
