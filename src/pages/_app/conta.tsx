import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { api, apiErrorMessage } from "../../api/instance";
import { IconInput } from "../../features/auth/components/IconInput";
import { authClient } from "../../lib/auth-client";
import { Header } from "../../shared/components/layout/Header";
import { Button } from "../../shared/components/ui/Button";
import { Sheet } from "../../shared/components/ui/Sheet";
import { toast } from "../../shared/components/ui/toast-store";
import { inputClass } from "../../shared/components/ui/styles";
import { ArrowRight, Loader2, Lock, Trash2 } from "../../shared/icons";

export const Route = createFileRoute("/_app/conta")({
  component: AccountPage,
});

const CARD = "flex flex-col gap-3 rounded-2xl border border-border-ui/70 bg-panel p-4 shadow-card";
const CONFIRM_WORD = "EXCLUIR";

/** Erro com o texto já pronto para mostrar (o apiErrorMessage só conhece as respostas da nossa API). */
class AccountError extends Error {}
const errorText = (err: unknown) => (err instanceof AccountError ? err.message : apiErrorMessage(err));

function PasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const queryClient = useQueryClient();
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");

  const save = useMutation({
    mutationFn: async () => {
      if (!hasPassword) {
        await api.post("/me/password", { newPassword: password });
        return;
      }
      const { error } = await authClient.changePassword({ currentPassword: current, newPassword: password, revokeOtherSessions: true });
      if (error) throw new AccountError(error.code === "INVALID_PASSWORD" ? "A senha atual está incorreta." : "Não foi possível trocar a senha. Tente novamente.");
    },
    onSuccess: () => {
      setCurrent("");
      setPassword("");
      setConfirmation("");
      toast.success(hasPassword ? "Senha trocada. Os outros aparelhos foram desconectados." : "Senha criada. Agora você também entra com o e-mail.");
      return queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
    onError: (err) => toast.error(errorText(err)),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmation) {
      toast.error("As senhas não são iguais.");
      return;
    }
    save.mutate();
  };

  return (
    <form onSubmit={submit} className={CARD}>
      <div>
        <h2 className="text-[16px] font-bold text-text-primary">{hasPassword ? "Trocar a senha" : "Criar uma senha"}</h2>
        <p className="text-[13.5px] text-text-secondary">
          {hasPassword ? "Ao trocar, os outros aparelhos são desconectados." : "Você entra com o Google. Com uma senha, também pode entrar com o e-mail."}
        </p>
      </div>
      {hasPassword && (
        <IconInput id="current-password" label="Senha atual" icon={Lock} type="password" required value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" />
      )}
      <IconInput id="new-password" label="Nova senha" icon={Lock} type="password" required minLength={8} maxLength={128} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo de 8 caracteres" autoComplete="new-password" />
      <IconInput id="confirm-password" label="Repita a nova senha" icon={Lock} type="password" required minLength={8} maxLength={128} value={confirmation} onChange={(e) => setConfirmation(e.target.value)} autoComplete="new-password" />
      <Button type="submit" loading={save.isPending} className="self-start">
        {hasPassword ? "Trocar a senha" : "Criar a senha"}
      </Button>
    </form>
  );
}

function DeleteAccount({ hasPassword }: { hasPassword: boolean }) {
  const [open, setOpen] = useState(false);
  const [word, setWord] = useState("");
  const [password, setPassword] = useState("");

  const remove = useMutation({
    mutationFn: async () => {
      const { error } = await authClient.deleteUser(hasPassword ? { password } : {});
      if (!error) return;
      if (error.code === "INVALID_PASSWORD") throw new AccountError("A senha está incorreta.");
      if (error.code === "SESSION_EXPIRED") throw new AccountError("Por segurança, saia e entre de novo antes de excluir a conta.");
      throw new AccountError("Não foi possível excluir a conta. Tente novamente.");
    },
    // Recarrega de propósito: limpa a sessão e tudo o que ficou em memória.
    onSuccess: () => window.location.assign("/login"),
    onError: (err) => toast.error(errorText(err)),
  });

  const close = () => {
    setOpen(false);
    setWord("");
    setPassword("");
  };

  return (
    <section className={CARD}>
      <div>
        <h2 className="text-[16px] font-bold text-text-primary">Excluir a conta</h2>
        <p className="text-[13.5px] text-text-secondary">Apaga a sua conta, a sua bio, os bots, os leads e os resultados. Não dá para desfazer.</p>
      </div>
      <Button variant="danger" icon={Trash2} className="self-start" onClick={() => setOpen(true)}>
        Excluir a minha conta
      </Button>
      <Sheet
        open={open}
        title="Excluir a conta"
        onClose={close}
        busy={remove.isPending}
        onSubmit={(e) => {
          e.preventDefault();
          remove.mutate();
        }}
        footer={
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={close} disabled={remove.isPending}>
              Cancelar
            </Button>
            <Button type="submit" variant="danger" loading={remove.isPending} disabled={word !== CONFIRM_WORD}>
              Excluir para sempre
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-3">
          <p className="text-[14px] text-text-secondary">A sua bio sai do ar na hora, e os links e QR Codes que você já divulgou param de funcionar.</p>
          {hasPassword && <IconInput id="delete-password" label="Sua senha" icon={Lock} type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />}
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold text-text-secondary">Digite {CONFIRM_WORD} para confirmar</span>
            <input className={inputClass} value={word} onChange={(e) => setWord(e.target.value)} autoCapitalize="characters" autoComplete="off" />
          </label>
        </div>
      </Sheet>
    </section>
  );
}

function AccountPage() {
  const { data: session } = authClient.useSession();
  const { data: providers, isLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const { data, error } = await authClient.listAccounts();
      if (error) throw new Error("Não foi possível carregar a conta.");
      return data.map((a) => a.providerId);
    },
  });

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <Header title="Minha conta" subtitle={session?.user.email} />
      <div className="mx-auto flex w-full max-w-xl flex-col gap-3 px-3 py-4 md:px-6 md:py-6">
        <Link to="/boas-vindas" search={{ editar: true }} className={`${CARD} flex-row items-center justify-between hover:bg-panel-hover`}>
          <span>
            <span className="block text-[16px] font-bold text-text-primary">Perfil e negócio</span>
            <span className="block text-[13.5px] text-text-secondary">Sua foto, seu nome e os dados do seu negócio.</span>
          </span>
          <ArrowRight size={18} className="shrink-0 text-text-secondary" />
        </Link>
        {isLoading || !providers ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-primary" />
          </div>
        ) : (
          <>
            <PasswordForm hasPassword={providers.includes("credential")} />
            <DeleteAccount hasPassword={providers.includes("credential")} />
          </>
        )}
      </div>
    </div>
  );
}
