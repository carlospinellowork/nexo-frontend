import { useState } from "react";
import { Button } from "../../../shared/components/ui/Button";
import { Check, Sparkles, UserRound } from "../../../shared/icons";
import { imageSrc } from "../../uploads/image";
import { ThemeThumb } from "../components/ThemePicker";
import { type PhotoLook, extractColors, photoLooks } from "./photoPalette";
import { getTheme } from "./themes";
import type { LandingLook } from "./types";

/** Lê os pixels da foto num canvas pequeno. Falha se a imagem for de outro site sem permissão (CORS). */
function readPixels(url: string): Promise<Uint8ClampedArray> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const size = 48;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) throw new Error("sem canvas");
        ctx.drawImage(img, 0, 0, size, size);
        resolve(ctx.getImageData(0, 0, size, size).data);
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error("não carregou"));
    img.src = imageSrc(url);
  });
}

interface PhotoThemeProps {
  photoUrl?: string;
  /** O visual atual da bio, para marcar a opção escolhida. */
  current?: LandingLook;
  onApply: (theme: string, look: LandingLook) => void;
  /** Leva a pessoa até o campo da foto. */
  onAddPhoto: () => void;
}

/** "Tema da sua foto": quatro temas montados com as cores da foto de perfil. */
export function PhotoTheme({ photoUrl, current, onApply, onAddPhoto }: PhotoThemeProps) {
  const [options, setOptions] = useState<PhotoLook[] | null>(null);
  const [from, setFrom] = useState<string>();
  const [state, setState] = useState<"idle" | "reading" | "error">("idle");

  const create = async () => {
    if (!photoUrl) return;
    setState("reading");
    try {
      const colors = extractColors(await readPixels(photoUrl));
      setOptions(photoLooks(colors));
      setFrom(photoUrl);
      setState("idle");
    } catch {
      setState("error");
    }
  };

  const same = (a?: LandingLook, b?: LandingLook) => JSON.stringify(a?.background) === JSON.stringify(b?.background) && a?.buttonColor === b?.buttonColor;
  const stale = options && from !== photoUrl;

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-primary/25 bg-primary/6 p-3.5">
      <div className="flex items-center gap-3">
        {photoUrl ? (
          <img src={imageSrc(photoUrl)} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-panel" />
        ) : (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-panel-2 text-text-secondary">
            <UserRound size={20} />
          </span>
        )}
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-[14.5px] font-semibold text-text-primary">Tema da sua foto</span>
          <span className="text-[12.5px] leading-snug text-text-secondary">
            {photoUrl ? "O Nexo usa as cores da sua foto de perfil para criar um tema que combina com você." : "Coloque uma foto no perfil e o Nexo cria um tema com as cores dela."}
          </span>
        </div>
      </div>

      {!photoUrl ? (
        <Button variant="secondary" icon={UserRound} onClick={onAddPhoto} className="w-full sm:w-fit">
          Colocar foto no perfil
        </Button>
      ) : (!options || stale) && (
        <Button icon={Sparkles} onClick={() => void create()} loading={state === "reading"} className="w-full sm:w-fit">
          {stale ? "Criar de novo com a foto nova" : "Criar tema com a minha foto"}
        </Button>
      )}

      {state === "error" && (
        <p className="rounded-xl bg-warning/14 px-3 py-2 text-[13px] leading-snug text-warning-strong">
          Não deu para ler as cores desta foto. Envie a foto pelo botão <b>Enviar foto</b> do perfil e tente de novo.
        </p>
      )}

      {options && !stale && (
        <>
          <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Temas criados com a sua foto">
            {options.map((o) => {
              const active = same(o.look, current);
              return (
                <button
                  key={o.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  aria-label={`Tema ${o.name}`}
                  onClick={() => onApply(o.theme, o.look)}
                  className={`relative rounded-[16px] p-[2px] transition-shadow ${active ? "ring-2 ring-primary" : "ring-1 ring-border-ui hover:ring-primary/50"}`}
                >
                  <ThemeThumb theme={getTheme(o.theme)} custom={o.look} label="" />
                  <span className="block pb-1 pt-1.5 text-center text-[12px] font-semibold text-text-primary">{o.name}</span>
                  {active && (
                    <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                      <Check size={12} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-[12px] text-text-secondary">Toque para usar. Depois dá para ajustar em Personalizar.</p>
        </>
      )}
    </section>
  );
}
