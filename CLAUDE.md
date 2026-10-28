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
src/features/tour/         tour guiado (driver.js) e HelpButton; títulos com ícone Lucide
src/features/workspaces/   seletor e store (só o id ativo)
src/shared/                layout, ui (PromptDialog, Toaster/toast, ChatSelect, EmptyState), hooks/useActiveChat
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
- **Ícones: sempre Lucide** (`lucide-react`). Nunca use emoji como ícone, nem na UI nem nos textos padrão.
- **Animações: Framer Motion** (`motion/react`). Molas curtas (`stiffness ~400, damping ~30`),
  `whileTap` nos botões e `useReducedMotion` em animações contínuas.
  **Não use `AnimatePresence` com `exit` em volta de `<Outlet />`**: o elemento que sai também
  renderiza a rota nova e a página monta duas vezes (bug real que já duplicou sessões do simulador).
- Tipografia: Inter (via `@fontsource-variable/inter`). Rótulos com 13px semibold em
  `text-text-secondary`; títulos com `tracking-tight`. Nada de rótulo de 10px em caixa alta.
