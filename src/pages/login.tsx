import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Lock, Mail, User } from "lucide-react";
import { AnimatePresence, motion, useAnimationControls } from "motion/react";
import { type FormEvent, useEffect, useState } from "react";
import { useGetAuthProviders } from "../api/queries/useGetAuthProviders";
import { GoogleButton } from "../features/auth/components/GoogleButton";
import { MeshBackground } from "../features/auth/components/MeshBackground";
import { LoginHero } from "../features/auth/components/LoginHero";
import { authClient } from "../lib/auth-client";
import { Button } from "../shared/components/ui/Button";
import { LogoMark } from "../shared/components/ui/Logo";
import { Segmented } from "../shared/components/ui/Segmented";
import { ThemeToggleButton } from "../shared/components/ui/ThemeToggle";

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

function IconInput({ id, label, icon: Icon, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { id: string; label: string; icon: typeof Mail }) {
  return (
    <label htmlFor={id} className="flex flex-col gap-1.5">
      <span className="text-[13px] font-semibold text-text-secondary">{label}</span>
      <span className="group flex h-12 items-center gap-2.5 rounded-xl border border-border-ui bg-panel-2 px-3.5 text-text-secondary transition-[border-color,box-shadow] focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary/15 lg:h-11">
        <Icon size={18} className="shrink-0 transition-colors group-focus-within:text-primary" />
        <input id={id} className="h-full min-w-0 flex-1 bg-transparent text-[16px] text-text-primary outline-none placeholder:text-text-secondary/60 lg:text-[15px]" {...props} />
      </span>
    </label>
  );
}

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
    <div className="flex h-dvh w-full overflow-hidden bg-panel">
      <LoginHero />

      <section className="relative flex flex-1 items-center justify-center overflow-y-auto p-4 sm:p-8">
        {/* Celular e tablet: o fundo vivo fica atrás do formulário, que vira um cartão. */}
        <MeshBackground className="lg:hidden" />
        <ThemeToggleButton className="absolute right-4 top-4 z-10 sm:right-8 sm:top-8" />

        <motion.form
          onSubmit={handleSubmit}
          animate={shake}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
          className="relative flex w-full max-w-[400px] flex-col gap-5 rounded-2xl border border-border-ui bg-panel/90 p-5 shadow-float backdrop-blur-xl sm:p-6 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none"
        >
          <div className="lg:hidden">
            <LogoMark size={40} />
          </div>

          <div className="flex flex-col gap-2">
            <AnimatePresence mode="wait" initial={false}>
              <motion.h2
                key={mode}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="text-[28px] font-extrabold tracking-[-0.02em] text-text-primary sm:text-[32px]"
              >
                {signup ? "Crie sua conta" : "Bem-vindo de volta"}
              </motion.h2>
            </AnimatePresence>
            <p className="text-[15px] text-text-secondary">
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
            <div className="flex flex-col gap-4">
              <GoogleButton loading={googleLoading} onClick={handleGoogle} />
              <div className="flex items-center gap-3 text-[13px] text-text-secondary">
                <span className="h-px flex-1 bg-border-ui" />
                ou com e-mail
                <span className="h-px flex-1 bg-border-ui" />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4">
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
            <IconInput id="email" label="E-mail" icon={Mail} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@empresa.com.br" autoComplete="email" />
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
              autoComplete={signup ? "new-password" : "current-password"}
            />
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
            Ao continuar, você concorda com os Termos de Uso e a Política de Privacidade.
          </p>
        </motion.form>
      </section>
    </div>
  );
}
