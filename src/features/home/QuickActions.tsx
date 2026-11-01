import { Link } from "@tanstack/react-router";
import { Link2, type IconComponent, Play, QrCode, Users } from "../../shared/icons";
import { gestureFor } from "../../shared/components/ui/gestures";
import { type Tone, TONES } from "../../shared/components/ui/tones";

interface Action {
  to: string;
  label: string;
  icon: IconComponent;
  tone: Tone;
}

const ACTIONS: Action[] = [
  { to: "/minha-bio", label: "Editar a bio", icon: Link2, tone: "rose" },
  { to: "/qr-codes", label: "Novo QR Code", icon: QrCode, tone: "lagoon" },
  { to: "/simulate", label: "Testar o bot", icon: Play, tone: "mint" },
  { to: "/leads", label: "Ver contatos", icon: Users, tone: "green" },
];

/** Atalhos do Início: as ações do dia a dia, com o ícone fazendo o seu gesto no hover. */
export function QuickActions() {
  return (
    <nav aria-label="Atalhos" className="grid grid-cols-2 gap-2 lg:grid-cols-4">
      {ACTIONS.map(({ to, label, icon: Icon, tone }, i) => (
        <Link
          key={to}
          to={to}
          className={`nx-anim flex h-12 ${i === ACTIONS.length - 1 && ACTIONS.length % 2 ? "col-span-2 sm:col-span-1" : ""} min-w-0 items-center gap-2.5 rounded-xl border border-border-ui/70 bg-panel px-3 text-[13.5px] font-semibold text-text-primary transition-colors hover:bg-panel-hover`}
        >
          <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${TONES[tone].chip}`}>
            <Icon size={15} strokeWidth={2.2} data-gesture={gestureFor(Icon)} />
          </span>
          <span className="truncate">{label}</span>
        </Link>
      ))}
    </nav>
  );
}
