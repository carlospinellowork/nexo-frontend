import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Compass,
  HelpCircle,
  Lightbulb,
  MessageCircle,
  Play,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { startTour } from "./driver-service";
import type { TourKey } from "./tour-store";

interface HelpButtonProps {
  tourKey: TourKey;
  screenTitle?: string;
}

const GUIDES = [
  {
    id: "first-bot",
    title: "Como montar seu primeiro bot em 3 minutos",
    icon: Sparkles,
    badge: "Essencial",
    summary:
      "Aprenda o ciclo básico: Início, Pergunta, Botões de opção, Resposta e Falar com humano.",
    content: [
      "1. Todo fluxo começa no bloco 'Início'.",
      "2. Adicione um bloco 'Pergunta' para solicitar o nome do cliente e salve na variável 'nome'.",
      "3. Use um bloco 'Botões de opção' com serviços (ex.: Orçamento, Dúvidas, Suporte).",
      "4. Conecte cada botão à sua resposta específica usando o botão '+' na saída da opção.",
      "5. Interpole dados usando {{nome}} para criar um atendimento personalizado.",
    ],
  },
  {
    id: "whatsapp-buttons",
    title: "Como funcionam os botões no WhatsApp",
    icon: MessageCircle,
    badge: "WhatsApp Oficial",
    summary:
      "Regras oficiais da Cloud API da Meta: até 3 botões rápidos, mais de 3 viram lista.",
    content: [
      "Até 3 opções: aparecem como botões interativos clicáveis diretamente no WhatsApp.",
      "Mais de 3 opções (até 10): o Nexo converte automaticamente para um menu de lista elegante.",
      "Rótulos de botão podem ter até 24 caracteres (limite oficial do WhatsApp).",
      "O cliente pode tocar no botão ou digitar o número/texto da opção.",
    ],
  },
  {
    id: "ai-agent",
    title: "Configurando o Agente de IA com Conhecimento",
    icon: Zap,
    badge: "Inteligência",
    summary:
      "Deixe a IA responder dúvidas institucionais com base nas regras e manuais da sua empresa.",
    content: [
      "No bloco 'Agente de IA', cole as instruções da empresa e a base de conhecimento (preços, serviços, horários).",
      "A IA só responde o que estiver no seu conhecimento e nunca inventa dados.",
      "Se o cliente pedir um atendente ou ficar insatisfeito, a IA sai pela porta 'handoff' e transfere para a equipe.",
    ],
  },
  {
    id: "landing-pages",
    title: "Landing Pages com Bot Integrado",
    icon: Compass,
    badge: "Vendas",
    summary:
      "Crie páginas de alta conversão conversando com a IA e publicando em um clique.",
    content: [
      "Descreva o seu ramo na criação por IA e ela monta capa, serviços, diferenciais e depoimentos.",
      "Escolha o tema que mais combina com o seu público (como o Espresso & Champagne de luxo).",
      "Vincule o fluxo do seu bot para que o widget de chat no canto da página atenda seus visitantes.",
    ],
  },
];

export function HelpButton({ tourKey, screenTitle }: HelpButtonProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [selectedGuideId, setSelectedGuideId] = useState<string>("first-bot");

  const currentGuide = GUIDES.find((g) => g.id === selectedGuideId) || GUIDES[0];

  return (
    <>
      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-1.5 rounded-xl border border-border-ui bg-panel-2 px-3 py-1.5 text-xs font-semibold text-text-secondary transition-all hover:border-primary/40 hover:bg-panel-hover hover:text-text-primary"
          title="Ajuda e Tutoriais"
        >
          <HelpCircle size={15} className="text-primary" />
          <span className="hidden sm:inline">Ajuda</span>
        </button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 6 }}
                className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl border border-border-ui bg-panel p-2 shadow-float"
              >
                <div className="px-3 py-2 border-b border-border-ui/60">
                  <p className="text-xs font-bold text-text-primary">
                    Central de Ajuda {screenTitle ? `— ${screenTitle}` : ""}
                  </p>
                  <p className="text-[11px] text-text-secondary">
                    Tutoriais guiados e dicas práticas
                  </p>
                </div>

                <div className="mt-1 space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      startTour(tourKey, true);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-text-primary hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <Play size={14} className="text-primary" />
                    <span>Fazer tour guiado desta tela</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setGuideModalOpen(true);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-text-primary hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <BookOpen size={14} className="text-accent-strong" />
                    <span>Dicas & Como montar seu bot</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Modal Completo de Guias e Dicas */}
      <AnimatePresence>
        {guideModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="flex h-[560px] w-full max-w-3xl overflow-hidden rounded-3xl border border-border-ui bg-panel shadow-float"
            >
              {/* Lateral com lista de tópicos */}
              <div className="w-1/3 border-r border-border-ui bg-panel-2/50 p-4 flex flex-col">
                <div className="flex items-center gap-2 px-2 pb-4 border-b border-border-ui">
                  <Lightbulb size={18} className="text-warning" />
                  <span className="font-bold text-sm text-text-primary">
                    Guia Prático Nexo
                  </span>
                </div>

                <div className="mt-3 flex-1 overflow-y-auto space-y-1.5">
                  {GUIDES.map((g) => {
                    const isSelected = g.id === selectedGuideId;
                    const IconComp = g.icon;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setSelectedGuideId(g.id)}
                        className={`flex w-full items-center justify-between rounded-xl p-2.5 text-left text-xs font-semibold transition-all ${
                          isSelected
                            ? "bg-primary text-white shadow-sm"
                            : "text-text-secondary hover:bg-panel-hover hover:text-text-primary"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <IconComp size={15} />
                          <span className="truncate">{g.title}</span>
                        </div>
                        <ChevronRight size={13} className="shrink-0 opacity-70" />
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setGuideModalOpen(false);
                    startTour(tourKey, true);
                  }}
                  className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/10 py-2.5 text-xs font-bold text-primary hover:bg-primary hover:text-white transition-colors"
                >
                  <Play size={13} />
                  <span>Ver Tour Interativo</span>
                </button>
              </div>

              {/* Conteúdo do Tópico Selecionado */}
              <div className="flex-1 p-6 flex flex-col justify-between overflow-y-auto">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary uppercase tracking-wider">
                        {currentGuide.badge}
                      </span>
                      <h3 className="mt-2 text-xl font-bold text-text-primary">
                        {currentGuide.title}
                      </h3>
                      <p className="mt-1 text-xs text-text-secondary leading-relaxed">
                        {currentGuide.summary}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setGuideModalOpen(false)}
                      className="rounded-full p-1.5 text-text-secondary hover:bg-panel-2"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="mt-6 space-y-3">
                    {currentGuide.content.map((point, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 rounded-2xl border border-border-ui bg-panel-2/60 p-3.5"
                      >
                        <CheckCircle2
                          size={16}
                          className="mt-0.5 shrink-0 text-success-strong"
                        />
                        <p className="text-xs text-text-primary leading-relaxed">
                          {point}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 border-t border-border-ui pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setGuideModalOpen(false)}
                    className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white hover:bg-primary-strong transition-colors"
                  >
                    Entendi
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
