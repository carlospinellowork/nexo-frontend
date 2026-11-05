import type { LandingIcon } from "../contract";
import { LANDING_ICONS } from "../contract";
import { AnimatedIcon } from "../AnimatedIcon";
import { ICON_MOTIONS, type IconMotion } from "../iconMotion";
import { ICON_LABELS, landingIcon } from "../icons";

/** Escolher o ícone e como ele se comporta: fixo ou animado, já mostrando o movimento. */
export function IconPicker({ icon, iconMotion, onIcon, onMotion, label = "Ícone" }: { icon?: string | null; iconMotion?: string | null; onIcon: (icon: LandingIcon | undefined) => void; onMotion: (m: IconMotion | undefined) => void; label?: string }) {
  const Preview = landingIcon(icon ?? "Sparkles");
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[13px] font-semibold text-text-secondary">{label}</span>
      <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={label}>
        {LANDING_ICONS.map((name) => {
          const Icon = landingIcon(name);
          return (
            <button key={name} type="button" role="radio" aria-checked={icon === name} aria-label={ICON_LABELS[name]} title={ICON_LABELS[name]} onClick={() => onIcon(icon === name ? undefined : name)} className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${icon === name ? "border-primary bg-primary/12 text-primary-strong" : "border-border-ui text-text-secondary hover:bg-panel-hover"}`}>
              <Icon size={17} />
            </button>
          );
        })}
      </div>
      {icon && (
        <>
          <span className="text-[13px] font-semibold text-text-secondary">Movimento</span>
          <div className="grid grid-cols-3 gap-1.5" role="radiogroup" aria-label="Movimento do ícone">
            {ICON_MOTIONS.map((m) => {
              const on = (iconMotion ?? "") === m.value;
              return (
                <button key={m.label} type="button" role="radio" aria-checked={on} onClick={() => onMotion(m.value || undefined)} className={`flex min-h-11 items-center justify-center gap-1.5 rounded-xl border text-[13px] font-semibold transition-colors ${on ? "border-primary bg-primary/12 text-primary-strong" : "border-border-ui text-text-secondary hover:bg-panel-hover"}`}>
                  <AnimatedIcon icon={Preview} motion={m.value} size={15} />
                  {m.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
