import type { ErrorComponentProps } from "@tanstack/react-router";
import { type ReactNode, useEffect } from "react";
import { reportError } from "../../lib/reportError";
import { House, type IconComponent, RefreshCw, TriangleAlert } from "../icons";
import { Button } from "./ui/Button";

function Screen({ icon: Icon, title, text, children }: { icon: IconComponent; title: string; text: string; children: ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-bg-start px-5 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/12 text-primary">
        <Icon size={28} />
      </span>
      <h1 className="text-[24px] font-bold tracking-tight text-text-primary">{title}</h1>
      <p className="max-w-sm text-[15px] text-text-secondary">{text}</p>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">{children}</div>
    </main>
  );
}

// Fora do roteador de propósito: uma tela de erro precisa funcionar mesmo com a rota atual quebrada.
const goHome = () => window.location.assign("/");

export function ErrorScreen({ error }: ErrorComponentProps) {
  useEffect(() => reportError(error), [error]);
  return (
    <Screen icon={TriangleAlert} title="Algo deu errado" text="Já recebemos o aviso deste erro. Recarregue a página; o que você salvou continua guardado.">
      <Button icon={RefreshCw} onClick={() => window.location.reload()}>
        Recarregar
      </Button>
      <Button variant="secondary" icon={House} onClick={goHome}>
        Ir para o início
      </Button>
    </Screen>
  );
}

export function NotFoundScreen() {
  return (
    <Screen icon={TriangleAlert} title="Página não encontrada" text="Este endereço não existe ou mudou de lugar.">
      <Button icon={House} onClick={goHome}>
        Ir para o início
      </Button>
    </Screen>
  );
}
