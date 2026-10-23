import { driver, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";
import {
  Eye,
  FlaskConical,
  Globe,
  House,
  Library,
  MessageCircle,
  MonitorSmartphone,
  Paintbrush,
  Rocket,
  Send,
  SlidersHorizontal,
  Sparkles,
  Variable,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { useTourStore, type TourKey } from "./tour-store";

/** Passo do tour com um ícone Lucide ao lado do título. */
interface TourStep {
  element: string;
  icon: LucideIcon;
  title: string;
  description: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}

export const TOUR_STEPS: Record<TourKey, TourStep[]> = {
  flows: [
    {
      element: "#tour-flow-blocks",
      icon: Library,
      title: "Biblioteca de blocos",
      description:
        "Clique ou arraste um bloco para adicioná-lo à conversa: perguntas com validação, botões, imagens e IA.",
      side: "right",
      align: "start",
    },
    {
      element: "#tour-flow-canvas",
      icon: Workflow,
      title: "Construtor visual",
      description:
        "Ligue a saída de um bloco ao próximo. O botão + embaixo de cada saída adiciona o próximo bloco já conectado.",
      side: "bottom",
      align: "center",
    },
    {
      element: "#tour-flow-ai",
      icon: Sparkles,
      title: "Peça uma mudança à IA",
      description: "Escreva pedidos como \"pergunte o telefone antes de agendar\" e a IA ajusta os blocos. Dá para desfazer com Ctrl+Z.",
      side: "top",
      align: "center",
    },
    {
      element: "#tour-flow-test",
      icon: FlaskConical,
      title: "Teste ao vivo",
      description: "Converse com o bot ao lado do editor. Os blocos executados ficam destacados no fluxo.",
      side: "left",
      align: "start",
    },
    {
      element: "#tour-flow-actions",
      icon: Rocket,
      title: "Salvar e publicar",
      description:
        "Salvar guarda o rascunho. O bot só muda no WhatsApp, no Instagram, no Telegram e no site quando você clica em Publicar.",
      side: "bottom",
      align: "end",
    },
  ],

  landing: [
    {
      element: "#tour-landing-new",
      icon: Sparkles,
      title: "Criar com IA ou modelo",
      description: "Descreva o seu negócio em poucas frases e a IA escreve a página. Depois é só revisar e publicar.",
      side: "bottom",
      align: "end",
    },
    {
      element: "#tour-landing-cards",
      icon: Globe,
      title: "Suas páginas",
      description: "Veja quais páginas estão no ar ou em rascunho e abra o editor quando quiser.",
      side: "top",
      align: "center",
    },
  ],

  landing_builder: [
    {
      element: "#tour-builder-tabs",
      icon: SlidersHorizontal,
      title: "Painel de edição",
      description: "Edite os textos de cada seção, peça mudanças à IA e escolha o tema e o bot da página.",
      side: "right",
      align: "start",
    },
    {
      element: "#tour-builder-viewport",
      icon: MonitorSmartphone,
      title: "Computador ou celular",
      description: "Veja a página como os clientes vão ver em cada tipo de tela.",
      side: "bottom",
      align: "center",
    },
    {
      element: "#tour-builder-preview",
      icon: Eye,
      title: "Prévia ao vivo",
      description: "Cada mudança aparece aqui na hora. Na página publicada, o botão de chat abre o seu bot.",
      side: "left",
      align: "center",
    },
    {
      element: "#tour-builder-publish",
      icon: Rocket,
      title: "Publicar",
      description: "Coloca a página no ar no endereço /p/seu-link. Até lá, os visitantes não veem as mudanças.",
      side: "bottom",
      align: "end",
    },
  ],

  home: [
    {
      element: "#tour-home-stats",
      icon: House,
      title: "Bem-vindo ao Nexo",
      description: "Este é o seu ponto de partida: conversas, páginas, contatos e resultados num lugar só.",
      side: "bottom",
      align: "start",
    },
  ],

  simulate: [
    {
      element: "#tour-simulate-chat",
      icon: MessageCircle,
      title: "Simulador",
      description: "Usa o mesmo motor do WhatsApp e do site. Converse como se fosse um cliente.",
      side: "right",
      align: "center",
    },
    {
      element: "#tour-simulate-vars",
      icon: Variable,
      title: "Variáveis da conversa",
      description: "Veja o que o bot guardou, como {{nome}} e {{telefone}}, e o caminho percorrido.",
      side: "left",
      align: "start",
    },
  ],

  channels: [
    {
      element: "#tour-channels-cards",
      icon: Send,
      title: "Conecte seus canais",
      description: "Ative WhatsApp, Instagram Direct ou Telegram. Todos usam o mesmo fluxo publicado.",
      side: "bottom",
      align: "center",
    },
  ],

  appearance: [
    {
      element: "#tour-appearance-preview",
      icon: Paintbrush,
      title: "Aparência do chat",
      description: "Ajuste cores, nome e ícone do chat que aparece no seu site.",
      side: "left",
      align: "center",
    },
  ],
};

/** O driver.js aceita HTML no título: o ícone entra como SVG do Lucide. */
const iconTitle = (Icon: LucideIcon, title: string) =>
  `<span class="nx-tour-title">${renderToStaticMarkup(createElement(Icon, { size: 17, strokeWidth: 2.2 }))}<span>${title}</span></span>`;

export function startTour(tourKey: TourKey, force = false) {
  const store = useTourStore.getState();
  if (!force && store.hasSeenTour(tourKey)) return;

  // Só os passos cujos elementos estão na tela agora.
  const steps: DriveStep[] = TOUR_STEPS[tourKey]
    .filter((s) => document.querySelector(s.element))
    .map((s) => ({
      element: s.element,
      popover: { title: iconTitle(s.icon, s.title), description: s.description, side: s.side, align: s.align },
    }));
  if (steps.length === 0) return;

  const driverObj = driver({
    showProgress: true,
    animate: true,
    progressText: "{{current}} de {{total}}",
    nextBtnText: "Próximo",
    prevBtnText: "Anterior",
    doneBtnText: "Entendi",
    steps,
    onDestroyStarted: () => {
      store.markTourSeen(tourKey);
      driverObj.destroy();
    },
  });

  driverObj.drive();
}
