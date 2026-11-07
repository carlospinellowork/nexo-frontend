/**
 * Dúvidas frequentes do painel, na ordem da jornada (Etapa 12.6). Respostas curtas, só com o que o Nexo faz hoje.
 * Mudou uma tela? Confira a resposta aqui. `to` leva direto à tela da resposta.
 */
export interface HelpTopic {
  q: string;
  a: string;
  to?: string;
  toLabel?: string;
}

export interface HelpGroup {
  title: string;
  topics: HelpTopic[];
}

export const HELP_GROUPS: HelpGroup[] = [
  {
    title: "Sua bio",
    topics: [
      { q: "Como crio a minha bio?", a: "Em Minha Bio, escolha o tipo do seu negócio, o nome e o WhatsApp. Ela fica pronta em 1 minuto e você ajusta depois.", to: "/minha-bio", toLabel: "Abrir Minha Bio" },
      { q: "Como coloco o link no Instagram?", a: "Em Minha Bio, toque em Instagram: o Nexo copia o link e abre o Instagram. Cole em Editar perfil, no campo Links. O texto da bio do Instagram não deixa link clicável.", to: "/minha-bio", toLabel: "Abrir Minha Bio" },
      { q: "Mudei a bio e o cliente não viu. Por quê?", a: "As mudanças vão para o ar quando você toca em Publicar. Salvar guarda sem mostrar ao cliente." },
      { q: "Como deixo a bio com a cara do meu negócio?", a: "Na aba Visual da Minha Bio: escolha um dos temas, as cores ou um tema tirado da sua foto. Todos são grátis." },
    ],
  },
  {
    title: "A conversa na bio",
    topics: [
      { q: "Como faço a bio abrir numa conversa?", a: "Na aba Bot da Minha Bio, ligue Abrir a bio na conversa e publique. Quem chega é conduzido em etapas e pode ver todos os links quando quiser.", to: "/minha-bio", toLabel: "Abrir Minha Bio" },
      { q: "Quais conversas prontas existem?", a: "Agendar, fazer pedido, pedir orçamento, contratar, tirar dúvida e escolher um produto. Escolha uma na aba Bot e edite os textos." },
      { q: "O Nexo se conecta ao meu WhatsApp?", a: "Não, e não precisa. A conversa acontece na sua bio. Quando o cliente quer falar com você, o seu WhatsApp abre com a mensagem pronta. Sem custo por mensagem e sem risco para o seu número." },
      { q: "Como respondo automático quem me chama no WhatsApp?", a: "Use a saudação do WhatsApp Business (recurso grátis do próprio aplicativo) com o link da sua bio. O guia com o texto pronto fica na aba Bot da Minha Bio." },
    ],
  },
  {
    title: "Agenda",
    topics: [
      { q: "Como o cliente marca horário sozinho?", a: "Cadastre os serviços (Agenda, aba Serviços) e o horário em que você atende (aba Horários). Depois escolha a conversa Agendar na aba Bot da Minha Bio. O cliente só vê os horários livres.", to: "/agenda", toLabel: "Abrir a Agenda" },
      { q: "Posso aprovar cada reserva antes?", a: "Sim. Em Agenda, aba Horários, escolha confirmar à mão. Aí a reserva chega como pendente e você confirma no dia." },
      { q: "Como fecho um dia ou um feriado?", a: "Em Agenda, aba Horários, use Bloquear dias. Se já houver reserva no período, o Nexo avisa." },
      { q: "Como remarco, cancelo ou lembro o cliente?", a: "Toque na pessoa no dia da agenda. No computador, dá para arrastar para outro horário. Ao remarcar ou cancelar, o Nexo oferece avisar o cliente pelo WhatsApp com a mensagem pronta. O botão Lembrar faz o mesmo antes do horário." },
    ],
  },
  {
    title: "Divulgar e acompanhar",
    topics: [
      { q: "Como faço um QR Code para o balcão?", a: "Em QR Codes, crie um para a sua bio e baixe em PNG, SVG ou no cartão para imprimir. Dá para trocar o destino depois sem reimprimir.", to: "/qr-codes", toLabel: "Abrir QR Codes" },
      { q: "Como sou avisado de cada cliente?", a: "No Início, toque em Ligar no aviso Ser avisado na hora. No iPhone, primeiro adicione o Nexo à Tela de Início pelo Safari." },
      { q: "Onde vejo quem entrou em contato?", a: "Em Leads ficam os contatos que chegaram pela bio. Dá para buscar e exportar uma planilha.", to: "/leads", toLabel: "Abrir Leads" },
      { q: "Quanto custa?", a: "Hoje, nada: o Nexo está em testes e tudo está liberado. Quando a cobrança começar, o plano Grátis continua grátis para sempre, e quem já usa ganha o preço de fundador no Pro." },
    ],
  },
];

const normalize = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

/** Busca nas perguntas e respostas, sem diferenciar acentos. */
export function searchHelp(query: string): HelpGroup[] {
  const words = normalize(query).split(/\s+/).filter((w) => w.length > 1);
  if (!words.length) return HELP_GROUPS;
  return HELP_GROUPS.map((g) => ({ ...g, topics: g.topics.filter((t) => words.every((w) => normalize(`${t.q} ${t.a}`).includes(w))) })).filter((g) => g.topics.length);
}
