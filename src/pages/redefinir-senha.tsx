import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { type FormEvent, type ReactNode, useState } from "react";
import { AuthShell } from "../features/auth/components/AuthShell";
import { IconInput } from "../features/auth/components/IconInput";
import { authClient } from "../lib/auth-client";
import { Button } from "../shared/components/ui/Button";
import { ArrowLeft, ArrowRight, CircleCheck, Lock, Mail } from "../shared/icons";

export const Route = createFileRoute("/redefinir-senha")({
  component: ResetPasswordPage,
  // Sem token: pede o link por e-mail. Com token (veio do e-mail): escolhe a nova senha.
  validateSearch: (search: Record<string, unknown>): { token?: string } =>
    typeof search.token === "string" ? { token: search.token } : {},
});

const CONNECTION_ERROR = "Não foi possível conectar ao servidor.";

function ResetPasswordPage() {
  const { token } = Route.useSearch();
  return <AuthShell>{token ? <NewPasswordForm key={token} token={token} /> : <RequestLinkForm />}</AuthShell>;
}

function Heading({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-[26px] font-bold tracking-[-0.02em] text-text-primary lg:text-[32px]">{title}</h2>
      <p className="text-[14.5px] text-text-secondary">{children}</p>
    </div>
  );
}

function FormError({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="rounded-xl bg-danger/12 px-3 py-2.5 text-[14px] font-medium text-danger-strong">
      {children}
    </p>
  );
}

function BackToLogin() {
  return (
    <Link to="/login" className="inline-flex items-center justify-center gap-1.5 text-[14px] font-semibold text-text-primary underline-offset-2 hover:underline">
      <ArrowLeft size={16} />
      Voltar para entrar
    </Link>
  );
}

const panelClass = "mx-auto flex w-full max-w-[400px] flex-col gap-4 lg:gap-5";

function RequestLinkForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { error: err } = await authClient.requestPasswordReset({ email });
      if (!err) setSent(true);
      else if (err.status === 429) setError("Muitas tentativas. Aguarde um minuto e tente de novo.");
      else setError("Não foi possível enviar o link. Tente novamente.");
    } catch {
      setError(CONNECTION_ERROR);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className={panelClass}>
        <CircleCheck size={36} className="text-success-strong" />
        <Heading title="Confira seu e-mail">
          Se <strong className="font-semibold text-text-primary">{email}</strong> tiver conta no Nexo, o link chega em instantes. Ele vale por 1 hora. Olhe também a caixa de spam.
        </Heading>
        <BackToLogin />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={panelClass}>
      <Heading title="Esqueceu a senha?">Enviamos um link para você escolher uma nova. Também serve para quem entra com o Google e quer ter uma senha.</Heading>
      <IconInput id="email" label="E-mail da conta" icon={Mail} type="email" inputMode="email" autoCapitalize="none" autoCorrect="off" spellCheck={false} enterKeyHint="send" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@empresa.com.br" autoComplete="email" />
      {error && <FormError>{error}</FormError>}
      <Button type="submit" size="lg" loading={loading} className="w-full">
        Enviar link
        {!loading && <ArrowRight size={18} />}
      </Button>
      <BackToLogin />
    </form>
  );
}

function NewPasswordForm({ token }: { token: string }) {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [invalidLink, setInvalidLink] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmation) {
      setError("As senhas não são iguais.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { error: err } = await authClient.resetPassword({ newPassword: password, token });
      if (!err) setDone(true);
      else if (err.code === "INVALID_TOKEN") setInvalidLink(true);
      else if (err.status === 429) setError("Muitas tentativas. Aguarde um minuto e tente de novo.");
      else setError("Não foi possível trocar a senha. Tente novamente.");
    } catch {
      setError(CONNECTION_ERROR);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className={panelClass}>
        <CircleCheck size={36} className="text-success-strong" />
        <Heading title="Senha alterada">Por segurança, encerramos as sessões abertas em todos os aparelhos. Entre de novo com a nova senha.</Heading>
        <Button size="lg" className="w-full" onClick={() => navigate({ to: "/login" })}>
          Entrar
          <ArrowRight size={18} />
        </Button>
      </div>
    );
  }

  if (invalidLink) {
    return (
      <div className={panelClass}>
        <Heading title="Link inválido">Este link venceu ou já foi usado. Peça um novo para continuar.</Heading>
        <Button size="lg" className="w-full" onClick={() => navigate({ to: "/redefinir-senha", search: {} })}>
          Pedir novo link
          <ArrowRight size={18} />
        </Button>
        <BackToLogin />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={panelClass}>
      <Heading title="Escolha a nova senha">Use pelo menos 8 caracteres.</Heading>
      <div className="flex flex-col gap-3">
        <IconInput id="new-password" label="Nova senha" icon={Lock} type="password" required minLength={8} maxLength={128} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo de 8 caracteres" enterKeyHint="next" autoComplete="new-password" />
        <IconInput id="confirm-password" label="Repita a nova senha" icon={Lock} type="password" required minLength={8} maxLength={128} value={confirmation} onChange={(e) => setConfirmation(e.target.value)} placeholder="A mesma senha" enterKeyHint="go" autoComplete="new-password" />
      </div>
      {error && <FormError>{error}</FormError>}
      <Button type="submit" size="lg" loading={loading} className="w-full">
        Salvar nova senha
        {!loading && <ArrowRight size={18} />}
      </Button>
    </form>
  );
}
