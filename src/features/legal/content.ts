/**
 * Termos de uso e política de privacidade do Nexo (fase de testes). Texto fiel ao que o produto faz hoje:
 * mude junto quando mudar o que o Nexo coleta, guarda ou compartilha. Antes de clientes pagantes: revisão jurídica.
 */

export const LEGAL = {
  responsible: "Carlos Pinello, pessoa física",
  city: "Poá, SP",
  email: "suportenexo@gmail.com",
  updatedAt: "31 de outubro de 2026",
};

export interface LegalSection {
  title: string;
  paragraphs?: string[];
  items?: string[];
}

export const PRIVACY: LegalSection[] = [
  {
    title: "Quem somos",
    paragraphs: [
      `O Nexo é um serviço em fase de testes, operado por ${LEGAL.responsible}, de ${LEGAL.city}. Para qualquer assunto sobre os seus dados, escreva para ${LEGAL.email}.`,
      "Esta política explica, em linguagem simples, quais dados o Nexo trata, para quê, com quem compartilha e como você pode exercer os seus direitos pela Lei Geral de Proteção de Dados (LGPD, Lei 13.709/2018).",
    ],
  },
  {
    title: "Dois papéis diferentes",
    items: [
      "Dados de quem usa o painel do Nexo (você, que cria a bio, o bot ou a página): o Nexo é o controlador.",
      "Dados dos visitantes das bios e páginas e de quem conversa com os bots: quem decide coletá-los é o negócio dono da bio ou do bot, que é o controlador. O Nexo trata esses dados em nome dele, como operador.",
    ],
  },
  {
    title: "O que coletamos de quem usa o painel",
    items: [
      "Conta: nome, e-mail e senha (guardada só como código protegido, nunca em texto). Se você entrar com o Google, recebemos nome, e-mail e foto; os tokens do Google ficam cifrados.",
      "Perfil: avatar (iniciais com uma cor ou uma foto pequena que você envia), o perfil do negócio que você conta no \"conhecer você\" (público, marca, segmento, cidade, onde está e objetivo).",
      "Conteúdo que você cria: bios, páginas, bots, fluxos, QR Codes e as configurações deles.",
      "Segurança do login: endereço IP e navegador de cada sessão, para proteger a sua conta.",
      "Canais conectados (WhatsApp, Instagram, Telegram): os tokens de acesso ficam cifrados e nunca aparecem na tela nem nos registros do sistema.",
    ],
  },
  {
    title: "O que coletamos dos visitantes e clientes finais",
    items: [
      "Conversas com o bot: as mensagens trocadas e as respostas que o bot guarda (por exemplo, o nome).",
      "Contato informado pelo próprio visitante na conversa (nome, telefone ou e-mail), que vira um lead para o negócio.",
      "Cliques nos links da bio e leituras de QR Code: só contamos. Para não contar a mesma pessoa duas vezes no mesmo dia, usamos um código anônimo feito a partir do endereço de internet com um segredo que troca todo dia e nunca é guardado. O endereço de internet não é salvo, e esse código é apagado em até um dia.",
    ],
  },
  {
    title: "Para que usamos",
    items: [
      "Prestar o serviço: mostrar a bio e as páginas, fazer o bot responder, entregar os leads e os números ao negócio.",
      "Segurança: evitar abuso, golpes e acessos indevidos (inclusive limitar a quantidade de pedidos).",
      "Melhorar o Nexo na fase de testes, com dados agregados.",
      "Bases legais: execução do contrato com quem usa o painel, legítimo interesse (segurança e melhoria) e, quando for o caso, o consentimento. Para os dados dos visitantes, a base legal é definida pelo negócio controlador.",
    ],
  },
  {
    title: "Com quem compartilhamos",
    paragraphs: ["Não vendemos dados. Usamos estes fornecedores para o Nexo funcionar, que podem tratar dados fora do Brasil (Estados Unidos), com contratos e medidas de segurança próprios:"],
    items: [
      "Vercel: hospedagem do painel e do site.",
      "Render: servidor da aplicação.",
      "Neon: banco de dados.",
      "Groq: quando um bot usa um bloco de inteligência artificial, a conversa daquele trecho é enviada para gerar a resposta.",
      "Google: só para quem escolhe entrar com o Google.",
      "Meta (WhatsApp e Instagram) e Telegram: só quando o negócio conecta esses canais; as mensagens passam por essas plataformas.",
    ],
  },
  {
    title: "Por quanto tempo guardamos",
    items: [
      "Dados da conta e o conteúdo criado: enquanto a conta existir. Ao pedir a exclusão, apagamos em até 30 dias, salvo o que a lei obrigar a manter.",
      "Leads e conversas: enquanto o negócio mantiver a conta, ou até ele apagá-los (o painel tem a exclusão de lead a pedido do titular).",
      "Código anônimo de cliques e leituras de QR: até um dia.",
    ],
  },
  {
    title: "Seus direitos",
    paragraphs: [
      `Você pode pedir confirmação de que tratamos seus dados, acesso, correção, anonimização, portabilidade, exclusão, informação sobre compartilhamento e revogar o consentimento. Escreva para ${LEGAL.email}; respondemos em até 15 dias.`,
      "Se você é visitante de uma bio ou cliente de um negócio que usa o Nexo, o pedido vai primeiro para esse negócio, que é quem decide sobre os seus dados. Se não conseguir falar com ele, escreva para nós que ajudamos.",
    ],
  },
  {
    title: "Segurança",
    items: [
      "Conexão sempre cifrada (https).",
      "Senhas protegidas e tokens de canais, do Google e senhas de Wi-Fi dos QR Codes cifrados no banco.",
      "Cada conta só enxerga os próprios dados.",
      "Nenhum sistema é 100% seguro: se acontecer um incidente que possa trazer risco, avisamos os afetados e a ANPD como a lei manda.",
    ],
  },
  {
    title: "Cookies e armazenamento no navegador",
    paragraphs: [
      "Usamos só o necessário: o cookie de sessão que mantém você logado e preferências guardadas no seu navegador (tema claro ou escuro, avisos dispensados). Não usamos cookies de propaganda nem de rastreamento de terceiros.",
    ],
  },
  {
    title: "Crianças e adolescentes",
    paragraphs: ["O painel do Nexo é para maiores de 18 anos ou para negócios. Não coletamos de propósito dados de menores no painel."],
  },
  {
    title: "Mudanças nesta política",
    paragraphs: ["Esta política pode mudar, principalmente enquanto o Nexo está em testes. Quando a mudança for importante, avisamos no painel ou por e-mail."],
  },
];

export const TERMS: LegalSection[] = [
  {
    title: "Sobre o Nexo e esta fase",
    paragraphs: [
      `O Nexo é um serviço para criar bios que conversam, bots de atendimento, páginas e QR Codes. Ele é operado por ${LEGAL.responsible}, de ${LEGAL.city}, contato ${LEGAL.email}.`,
      "O Nexo está em fase de testes e é gratuito nesta fase. Recursos podem mudar, sair do ar ou ter falhas. Fazemos o possível para não perder dados, mas não garantimos disponibilidade contínua. Se um dia for preciso apagar dados de teste, avisamos antes.",
    ],
  },
  {
    title: "Sua conta",
    items: [
      "Você precisa ter 18 anos ou mais (ou usar em nome de um negócio) e dar informações verdadeiras.",
      "Você é responsável pelo que acontece na sua conta. Guarde a sua senha e avise se suspeitar de uso indevido.",
      "Se você convidar outras pessoas para o seu espaço, elas veem os dados desse espaço conforme o papel que você der.",
    ],
  },
  {
    title: "O que você pode e não pode fazer",
    paragraphs: ["Use o Nexo de forma legal e honesta. É proibido usar o Nexo para:"],
    items: [
      "Golpes, phishing, links enganosos ou QR Codes que levem a páginas falsas.",
      "Spam, mensagens em massa sem pedido ou qualquer coisa contra as regras do WhatsApp, Instagram, Telegram, Mercado Livre e outras plataformas.",
      "Apostas, conteúdo ilegal, discriminatório, que viole direitos de outras pessoas ou propaganda enganosa (incluindo depoimentos e números inventados).",
      "Tentar acessar dados de outras contas, sobrecarregar o serviço ou contornar limites de segurança.",
    ],
  },
  {
    title: "Dados dos seus clientes",
    paragraphs: [
      "Quando a sua bio, página ou bot coleta dados de visitantes (nome, telefone, e-mail, mensagens), você é o controlador desses dados pela LGPD: precisa ter base legal para tratá-los, informar seus clientes e atender aos pedidos deles. O Nexo trata esses dados em seu nome, como descrito na Política de Privacidade.",
    ],
  },
  {
    title: "Seu conteúdo",
    paragraphs: [
      "O conteúdo que você cria continua sendo seu. Você nos autoriza a guardá-lo e exibi-lo só para fazer o serviço funcionar (por exemplo, mostrar a sua bio para quem a visita). Você garante que tem o direito de usar os textos, imagens e marcas que coloca no Nexo.",
    ],
  },
  {
    title: "Inteligência artificial",
    paragraphs: [
      "Alguns recursos usam inteligência artificial para responder clientes, escrever páginas ou montar fluxos. A IA pode errar. Revise o que ela produz antes de publicar e não use as respostas dela como orientação médica, jurídica ou financeira.",
    ],
  },
  {
    title: "Suspensão e encerramento",
    items: [
      "Podemos desativar conteúdos (como um QR Code ou uma bio) ou suspender contas que descumpram estes termos ou coloquem outras pessoas em risco, avisando quando possível.",
      `Você pode encerrar a sua conta quando quiser, pedindo pelo ${LEGAL.email}.`,
    ],
  },
  {
    title: "Responsabilidade",
    paragraphs: [
      "O Nexo é oferecido como está, nesta fase de testes. Não respondemos por perdas indiretas, por decisões tomadas com base nos números do painel, nem por regras e mudanças das plataformas de terceiros (WhatsApp, Instagram, marketplaces). Nada nestes termos limita direitos que a lei garante ao consumidor.",
    ],
  },
  {
    title: "Mudanças e lei aplicável",
    paragraphs: [
      "Estes termos podem mudar; quando a mudança for importante, avisamos no painel ou por e-mail. Vale a lei brasileira. Eventuais disputas seguem o foro definido pela lei, inclusive o do domicílio do consumidor quando for o caso.",
    ],
  },
];
