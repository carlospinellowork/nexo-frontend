import { createFileRoute } from "@tanstack/react-router";
import { Globe, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { API_ORIGIN } from "../../api/instance";
import { useGetPublicLandingPage } from "../../api/queries/useGetPublicLandingPage";
import { LandingRenderer } from "../../features/landing/components/LandingRenderer";

export const Route = createFileRoute("/p/$slug")({
  component: PublicLandingPage,
});

declare global {
  interface Window {
    NexoChat?: { open: () => void; close: () => void };
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

function PublicLandingPage() {
  const { slug } = Route.useParams();
  const { data: page, isLoading, isError } = useGetPublicLandingPage(slug);
  useChatWidget(page?.chat?.id);

  useEffect(() => {
    if (!page) return;
    document.title = page.settings.seoTitle || page.title;
    setMeta("description", page.settings.seoDescription || page.description || "");
  }, [page]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <Loader2 size={32} className="animate-spin text-slate-400" />
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
        onChat={() => window.NexoChat?.open()}
      />
    </div>
  );
}
