# nexo-frontend

Painel do Nexo: React 19 + Vite 6 + TanStack Router (rotas por arquivo) + TanStack Query +
Zustand + @xyflow/react + Tailwind 4 + better-auth client.
Visão geral e contrato dos nós: `../CLAUDE.md`.

## Comandos

```bash
npm run dev          # http://localhost:5173 (backend em :3000)
npx tsc -b           # typecheck
npx eslint .         # lint (o hook roda em cada arquivo editado)
npm run build
```

Variável opcional: `VITE_API_URL` (padrão `http://localhost:3000/api`).

## Organização

```
src/pages/                 rotas (TanStack Router); _app/layout.tsx = área logada
src/routeTree.gen.ts       GERADO — nunca edite
src/api/instance.ts        axios + header X-Workspace-Id + apiErrorMessage()
src/api/queries|mutations  um hook por arquivo; queryKey sempre inclui o workspaceId
src/features/flow/         contract.ts (espelho do backend), nodes/, components/, store
src/features/chatBuilder/  aparência do widget e código de instalação
src/features/integrations/ definição dos canais (channels.ts) e ChannelCard
src/features/landing/      contract.ts (tipos e limites), LandingRenderer, SectionEditor, ThemePicker, icons.ts
src/features/bio/          Minha Bio; JourneyEditor (modelos e edição da jornada sem o editor de fluxo), JourneyGreetingGuide (saudação do WhatsApp Business)
src/features/landing/journey/  bio em modo jornada: useJourney (estado), transports (rota pública ou simulador na prévia), JourneyView
src/features/tour/         tour guiado (driver.js) e HelpButton; títulos com ícone do `shared/icons`
src/features/workspaces/   seletor e store (só o id ativo)
src/shared/                layout, ui (PromptDialog, Toaster/toast, ChatSelect, EmptyState), hooks/useActiveChat
src/shared/navigation.ts   menu do painel (NAV_GROUPS: Presença, Assistente, Acompanhar); tela nova entra aqui
src/shared/components/ui/tones.ts  cor dos ícones e destaques das áreas: desde 31/10/2026 é UMA cor só (o roxo da marca) para todas; não crie cor por área
src/features/qr/           QR Codes: QrFormSheet (criar/editar por tipo), QrDetailSheet (baixar PNG/SVG, gráfico), PrintCard (@media print)
src/shared/components/ui/Sheet.tsx  o modal do Nexo (único): centralizado no computador com a altura do conteúdo (até 86% da tela), sobe de baixo no celular; aceita onSubmit (vira <form>) e busy
src/features/profile/      "conhecer você": UserAvatar (foto ou iniciais na cor), avatar.ts (cores), resizeImage (recorta 256 px em JPEG);
                           a tela é pages/boas-vindas.tsx (primeiro login; editar pelo avatar do menu, ?editar=1). GET/PUT /api/me
src/pages/_app/conta.tsx    "Minha conta": trocar ou criar a senha e excluir a conta (exclusão apaga os espaços em que a pessoa está sozinha)
src/lib/reportError.ts      avisa o /admin dos erros do navegador; shared/components/ErrorScreens.tsx = telas de erro e de página não encontrada
src/features/feedback/      "Dar opinião" (menu); pages/_app/admin.tsx = Acompanhamento da fase de testes (só admin, via /api/me isAdmin)
src/shared/hooks/useWorkspaceRole.ts  papel do usuário no workspace ativo (esconder ações de Admin para Membro)
src/features/auth/         AuthShell (moldura das telas de acesso), IconInput, LoginHero e GoogleButton; o botão do Google e o "Esqueci minha senha" (pages/redefinir-senha.tsx) só aparecem se GET /auth-providers devolver google / passwordReset: true
```

## Regras

- **O servidor é a fonte da verdade.** O Zustand guarda só preferências (workspace e chat
  ativos) e rascunhos em edição (`dirty`). Não persista dados de domínio no localStorage.
- Mutations retornam a promise de `invalidateQueries` no `onSuccess`, para que o `mutateAsync` só resolva com o cache atualizado.
- Não use `alert()`, `prompt()` ou `confirm()` para fluxos novos: use `toast`, `PromptDialog`
  e `apiErrorMessage(err)`. O `confirm()` só é aceito para ações destrutivas simples.
- Estado de "carregando" que nasce num `useEffect` (ex.: o simulador) deve ser controlado com
  `useState` local, não com `mutation.isPending`: no StrictMode o observer da mutation é
  desinscrito e o `isPending` fica preso.
- Bloco novo no editor: skill `/novo-tipo-de-no`. Todos os tipos usam o `BlockNode`; o visual
  (nome, ícone, cor, grupo) vem de `features/flow/catalog.ts` e as saídas de `nodeOutputs()` no contract.
- Editor: `BlockLibrary` (esquerda), `NodePropertiesPanel` e `TestPanel` (direita), `AiBar` (rodapé).
  Toda mudança no fluxo passa pelo `flow.store` para entrar no histórico de desfazer.
- Conversas de teste usam `useSimulatorSession` (página do simulador e painel do editor).
- Landing pages: `LandingRenderer` usa container queries (`@2xl:`, `@5xl:`), não `sm:`/`lg:`, para a
  prévia de celular funcionar. A página pública (`/p/$slug`) busca com `fetch` sem credenciais e
  instala o widget real; botões de conversa chamam `window.NexoChat.open()`.

## Design system (premium, estilo iOS — ver `../docs/VISAO.md`)

- **Tema claro e escuro**: os tokens ficam em `src/index.css` (`:root` e `.dark`) e são expostos ao
  Tailwind via `@theme inline`. Use só tokens semânticos, nunca hex solto nem `bg-white/5`:
  `bg-bg-start` (fundo), `bg-panel` (card), `bg-panel-2` (campo), `bg-panel-hover`,
  `border-border-ui`, `text-text-primary`, `text-text-secondary`, `primary`/`primary-strong`
  (roxo #6D4AFF), `accent` (amarelo #FFC400, para fundos e destaques, com `text-on-accent` por cima; nunca texto branco sobre amarelo) e `accent-strong` (amarelo escuro, para texto e ícone sobre fundo claro), `success|warning|danger` (+ `-strong` para texto
  sobre fundo tingido, ex.: `bg-success/14 text-success-strong`), `shadow-card`, `shadow-float`.
  As exceções são as cores do cliente (vindas de `settings`) e a prévia do widget/simulador.
- Preferência de tema: `features/theme/theme-store.ts` (sistema/claro/escuro, persistida).
  `index.html` aplica a classe `.dark` antes do primeiro paint.
- **Componentes base** em `src/shared/components/ui/`: `Button`/`IconButton`, `Segmented`,
  `Badge`, `Logo`/`LogoMark`, `ThemeToggleButton`/`ThemeSegmented`, `PromptDialog`, `Toaster`,
  `ChatSelect`, `EmptyState`, `Switch`, e as classes de campo em `styles.ts` (`inputClass`, `selectClass`,
  `textareaClass`). Reutilize-os antes de criar estilos novos.
- **Ícones: sempre MingCute pelo `src/shared/icons`** (traço arredondado, estilo iPhone). Os nomes seguem os do Lucide
  (`House`, `Link2`, `QrCode`...); `filled` dá a versão preenchida, usada no item ativo do menu e da barra inferior.
  Os arquivos em `src/shared/icons` são gerados: para um ícone novo, ponha o nome no `MAP` de `scripts/icons/gen.py`
  e rode `python3 scripts/icons/gen.py node_modules/@iconify-json/mingcute/icons.json src/shared/icons/index.tsx Nome`.
  Nunca use emoji como ícone, nem na UI nem nos textos padrão.
- **Animações: Framer Motion** (`motion/react`). Molas curtas (`stiffness ~400, damping ~30`),
  `whileTap` nos botões e `useReducedMotion` em animações contínuas.
  **Não use `AnimatePresence` com `exit` em volta de `<Outlet />`**: o elemento que sai também
  renderiza a rota nova e a página monta duas vezes (bug real que já duplicou sessões do simulador).
- Tipografia: **Onest** no texto (`--font-sans`) e **Bricolage Grotesque** em títulos (h1–h3) e números grandes
  (`--font-display`, classe `font-display`), via `@fontsource-variable`. As páginas dos clientes (`LandingRenderer`,
  classe `nx-landing`) ficam na Inter (`--font-inter`). Rótulos com 13px
  semibold em `text-text-secondary`; títulos com `tracking-tight`. Nada de rótulo de 10px em caixa alta.
- **Densidade** (direção visual aprovada em 31/10/2026): espaços 4 · 6 · 8 · 12 · 16 · 20; cantos redefinidos no
  `@theme` (`rounded-md` 8, `lg` 10, `xl` 12, `2xl` 14, `3xl` 16); controles com 36 px no computador e 44 px no
  celular (`h-11 md:h-9`). Prefira `p-3`/`p-4` em cartões; `p-6` só em áreas de destaque.
- **Botões**: `primary` (roxo com brilho e o fio amarelo do Nexo, classe `nx-btn-primary`), `gold` (só ações de
  crescimento: publicar, compartilhar; uma por tela), `secondary`, `outline`, `ghost`, `danger`. Não crie botões
  com classes soltas: use `Button`/`IconButton`.
- **Ícones animados**: o ícone faz o seu gesto no hover do elemento com a classe `nx-anim` (o `Button` e os itens do
  menu já têm). O gesto vem de `data-gesture` (`ring`, `pop`, `nudge`, `twinkle`, `spin`, `lift`, `scan`, `tilt`);
  o padrão de cada ícone fica em `ui/gestures.ts`. `nx-anim-once` faz o gesto uma vez ao montar (tela ativa).
- **Uma cor só**: ícones, chips e destaques usam o roxo da marca (`primary`), em todas as áreas. No menu, ícone neutro e
  o item ativo em roxo. Cor só para estado (sucesso, aviso, erro) e para a ação de crescimento (dourado).
- **Modais**: sempre `Sheet`. Nada de `fixed inset-0` novo com caixa própria.
- **Celular de prévia**: sempre `PhoneFrame` (`ui/PhoneFrame.tsx`): moldura, ilha, barra de status e botões laterais.
  Para páginas e bios, passe `statusBg={themeBg(theme)}` e `statusTone` por `themeIsDark(theme)` (contract da landing):
  o conteúdo começa abaixo da barra. Sem `statusBg`, o conteúdo passa por baixo dela (cabeçalho colorido do chat).
  Não desenhe celular à mão.
- **Barra de rolagem**: personalizada no painel inteiro (`index.css`, tokens `--nx-scroll`). Dentro do `PhoneFrame` ela
  some, como no aparelho.
- **Selo do Nexo** (`ui/NexoSeal.tsx`): `SealRosette` (logo; o `LogoMark` usa ela), `SealPill` ("feito com Nexo" no
  rodapé das bios), `SealStamp` ("verificado pelo Nexo"). CSS holográfico em `index.css` (`.nx-holo`). O site
  (`nexo-site/src/components/NexoSeal.tsx`) tem uma cópia: mude os dois juntos.
- **Fundo vivo** (`features/auth/components/MeshBackground.tsx`): luzes da marca num canvas com grão; usado no login.
