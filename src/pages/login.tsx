import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Lock, Mail, User } from "../shared/icons";
import { AnimatePresence, motion, useAnimationControls } from "motion/react";
import { type FormEvent, useEffect, useState } from "react";
import { useGetAuthProviders } from "../api/queries/useGetAuthProviders";
import { AuthShell } from "../features/auth/components/AuthShell";
import { GoogleButton } from "../features/auth/components/GoogleButton";
import { IconInput } from "../features/auth/components/IconInput";
import { authClient } from "../lib/auth-client";
import { Button } from "../shared/components/ui/Button";
import { Segmented } from "../shared/components/ui/Segmented";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  // O Google devolve para cá com ?error=... quando o login não deu certo.
  validateSearch: (search: Record<string, unknown>): { error?: string } =>
    typeof search.error === "string" ? { error: search.error } : {},
});

/** Mensagens para os erros que a better-auth devolve ao voltar do Google. */
function oauthErrorMessage(code: string): string {
  if (code === "account_not_linked")
    return "Já existe uma conta com esse e-mail, criada com senha. Entre com o e-mail e a senha.";
  if (code === "access_denied") return "O login com o Google foi cancelado.";
  return "Não foi possível entrar com o Google. Tente novamente.";
}

type Mode = "signin" | "signup";

function LoginPage() {
  const { data: session } = authClient.useSession();
  const navigate = useNavigate();
  const shake = useAnimationControls();
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const search = Route.useSearch();
  const [error, setError] = useState(() => (search.error ? oauthErrorMessage(search.error) : ""));
  const [googleLoading, setGoogleLoading] = useState(false);
  const { data: providers } = useGetAuthProviders();

  useEffect(() => {
    if (session) navigate({ to: "/" });
  }, [session, navigate]);

  const fail = (message: string) => {
    setError(message);
    void shake.start({ x: [0, -10, 10, -6, 6, 0], transition: { duration: 0.4 } });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const callbacks = {
      onSuccess: () => navigate({ to: "/" }),
      onError: (ctx: { error: { message?: string; status?: number } }) =>
        fail(
          ctx.error.status === 401 || ctx.error.status === 400
            ? mode === "signin"
              ? "E-mail ou senha incorretos."
              : ctx.error.message || "Não foi possível criar a conta."
            : ctx.error.message || "Algo deu errado. Tente novamente.",
        ),
    };
    try {
      if (mode === "signup") await authClient.signUp.email({ email, password, name }, callbacks);
      else await authClient.signIn.email({ email, password }, callbacks);
    } catch {
      fail("Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError("");
    const origin = window.location.origin;
    try {
      // Redireciona para o Google; ao voltar, a sessão já está criada.
      const { error: err } = await authClient.signIn.social({
        provider: "google",
        callbackURL: `${origin}/`,
        errorCallbackURL: `${origin}/login`,
      });
      if (err) {
        fail(err.message || "Não foi possível entrar com o Google.");
        setGoogleLoading(false);
      }
    } catch {
      fail("Não foi possível conectar ao servidor.");
      setGoogleLoading(false);
    }
  };

  const signup = mode === "signup";

  return (
    <AuthShell>
        <motion.form
          onSubmit={handleSubmit}
          animate={shake}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
          className="mx-auto flex w-full max-w-[400px] flex-col gap-4 lg:gap-5"
        >
          <div className="flex flex-col gap-1">
            <AnimatePresence mode="wait" initial={false}>
              <motion.h2
                key={mode}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="text-[26px] font-bold tracking-[-0.02em] text-text-primary lg:text-[32px]"
              >
                {signup ? "Crie sua conta" : "Bem-vindo de volta"}
              </motion.h2>
            </AnimatePresence>
            <p className="text-[14.5px] text-text-secondary">
              {signup ? "Grátis para começar. Sem cartão de crédito." : "Entre para continuar de onde parou."}
            </p>
          </div>

          <Segmented
            label="Entrar ou criar conta"
            fullWidth
            value={mode}
            onChange={(m) => {
              setMode(m);
              setError("");
            }}
            options={[
              { value: "signin", label: "Entrar" },
              { value: "signup", label: "Criar conta" },
            ]}
          />

          {providers?.google && (
            <div className="flex flex-col gap-3">
              <GoogleButton loading={googleLoading} onClick={handleGoogle} />
              <div className="flex items-center gap-3 text-[13px] text-text-secondary">
                <span className="h-px flex-1 bg-border-ui" />
                ou com e-mail
                <span className="h-px flex-1 bg-border-ui" />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <AnimatePresence initial={false}>
              {signup && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <IconInput id="name" label="Seu nome" icon={User} required value={name} onChange={(e) => setName(e.target.value)} placeholder="Como podemos te chamar?" autoComplete="name" />
                </motion.div>
              )}
            </AnimatePresence>
            <IconInput id="email" label="E-mail" icon={Mail} type="email" inputMode="email" autoCapitalize="none" autoCorrect="off" spellCheck={false} enterKeyHint="next" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@empresa.com.br" autoComplete="email" />
            <IconInput
              id="password"
              label="Senha"
              icon={Lock}
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={signup ? "Mínimo de 8 caracteres" : "Sua senha"}
              enterKeyHint="go"
              autoComplete={signup ? "new-password" : "current-password"}
            />
            {!signup && providers?.passwordReset && (
              <Link to="/redefinir-senha" search={{}} className="-mt-1 self-end text-[13px] font-semibold text-text-primary underline underline-offset-2">
                Esqueci minha senha
              </Link>
            )}
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                role="alert"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-xl bg-danger/12 px-3 py-2.5 text-[14px] font-medium text-danger-strong"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <Button type="submit" size="lg" loading={loading} className="w-full">
            {signup ? "Criar conta grátis" : "Entrar"}
            {!loading && <ArrowRight size={18} />}
          </Button>

          <p className="text-center text-[13px] text-text-secondary">
            Ao continuar, você concorda com os{" "}
            <Link to="/termos" className="font-semibold text-text-primary underline underline-offset-2">
              Termos de Uso
            </Link>{" "}
            e a{" "}
            <Link to="/privacidade" className="font-semibold text-text-primary underline underline-offset-2">
              Política de Privacidade
            </Link>
            .
          </p>
        </motion.form>
    </AuthShell>
  );
}
