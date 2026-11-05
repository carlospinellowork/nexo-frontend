import { Globe } from "../../../shared/icons";
import { useEffect, useMemo, useState } from "react";
import { API_ORIGIN } from "../../../api/instance";
import { useGetPublicLandingPage } from "../../../api/queries/useGetPublicLandingPage";
import { LandingRenderer } from "../components/LandingRenderer";
import { publicChatTransport, publicJourneyTransport } from "../journey/transports";
import { useJourney } from "../journey/useJourney";
import { trackClick } from "../trackClick";

declare global {
  interface Window {
    NexoChat?: { open: (prefill?: string) => void; close: () => void };
  }
}

/** Instala o widget real do Nexo (o mesmo script que as empresas colam no próprio site). */
function useChatWidget(chatId: string | undefined) {
  useEffect(() => {
    if (!chatId || document.querySelector("script[data-nexo-landing]")) return;
    const script = document.createElement("script");
    script.src = `${API_ORIGIN}/nexo-chat.js`;
    script.async = true;
    script.dataset.id = chatId;
    script.dataset.nexoLanding = "";
    document.body.appendChild(script);
  }, [chatId]);
}

function setMeta(name: string, content: string) {
  let tag = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.name = name;
    document.head.appendChild(tag);
  }
  tag.content = content;
}

/** Página ou bio publicada, para visitantes (em /p/:slug e, no endereço curto das bios, em /:slug). */
export function PublicLandingPage({ slug }: { slug: string }) {
  const { data: page, isLoading, isError } = useGetPublicLandingPage(slug);
  const isBio = page?.settings.layout === "bio";
  const hasChatLink = Boolean(page?.sections.some((s) => s.type === "links" && s.data.items.some((i) => i.kind === "chat")));
  const journeyFirst = Boolean(page?.settings.journeyFirst && page.chat);
  const [opened, setOpened] = useState(false);
  const [question, setQuestion] = useState<string | null>(null);
  const chatId = page?.chat?.id;
  const transport = useMemo(() => {
    if (journeyFirst) return publicJourneyTransport(slug);
    return opened && chatId ? publicChatTransport(slug, chatId) : null;
  }, [journeyFirst, opened, chatId, slug]);
  const journey = useJourney(transport);
  const failed = journey.status === "failed";
  const inPage = Boolean(transport) && !failed;
  // Na bio, a conversa é na própria página. O botão flutuante fica para as páginas completas, para quando a conversa
  // não abre e para a bio sem nenhum link de assistente, que ficaria sem como chegar ao bot.
  useChatWidget(page && !inPage && (!isBio || failed || !hasChatLink) ? chatId : undefined);

  // Pergunta feita na busca, antes de a conversa existir: vai assim que ela abrir.
  const { ask, status: journeyStatus } = journey;
  useEffect(() => {
    if (!question || !inPage || journeyStatus !== "waiting") return;
    setQuestion(null);
    void ask(question);
  }, [question, inPage, journeyStatus, ask]);

  useEffect(() => {
    if (!page) return;
    document.title = page.settings.seoTitle || page.title;
    setMeta("description", page.settings.seoDescription || page.description || "");
  }, [page]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-start">
        <span className="flex gap-1.5" role="status" aria-label="Carregando">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary" style={{ animationDelay: `${i * 160}ms` }} />
          ))}
        </span>
      </div>
    );
  }

  if (isError || !page) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-white p-6 text-center text-slate-900">
        <Globe size={40} className="text-slate-300" />
        <h1 className="text-2xl font-bold tracking-tight">Página não encontrada</h1>
        <p className="max-w-sm text-slate-500">Este endereço não existe ou a página ainda não foi publicada.</p>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-y-auto">
      <LandingRenderer
        title={page.title}
        theme={page.theme}
        sections={page.sections}
        settings={page.settings}
        slug={page.slug}
        canAsk={!!page.chat}
        onChat={() => (isBio && chatId && !failed && hasChatLink ? setOpened(true) : window.NexoChat?.open())}
        onAsk={(q) => {
          if (isBio && chatId && !failed && hasChatLink) {
            setOpened(true);
            setQuestion(q);
          } else window.NexoChat?.open(q);
        }}
        journey={inPage ? journey : undefined}
        openStatus={page.openStatus}
        onItemClick={(itemId) => trackClick(page.slug, itemId)}
      />
    </div>
  );
}
