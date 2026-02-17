import { useChatBuilderStore } from "../store/chat-builder-store";


export function SettingsPanel() {
  const { getActiveSettings, setSettings } = useChatBuilderStore()
  const {
    name,
    botName,
    welcomeMessage,
    mainColor,
    position,
    borderRadius,
    buttonIcon,
    headerBackgroundColor,
    headerTextColor,
    userBubbleColor,
    botBubbleColor,
    botTextColor
  } = getActiveSettings()

  return (
    <div className="w-80 border-r border-border-ui bg-bg-start p-6 flex flex-col gap-6 overflow-y-auto">
      <h2 className="text-xs font-black uppercase tracking-[0.2em] text-text-primary opacity-80">
        Customização
      </h2>

      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="chat_config_name" className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
            Nome da Configuração
          </label>
          <input
            type="text"
            id="chat_config_name"
            value={name}
            onChange={(e) => setSettings("name", e.target.value)}
            className="bg-panel border border-border-ui rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none focus:border-primary transition-all placeholder:text-text-secondary/30 font-bold"
            placeholder="Ex: Chat Suporte"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="nome_do_bot" className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
            Nome do Bot
          </label>
          <input
            type="text"
            id="nome_do_bot"
            value={botName}
            onChange={(e) => setSettings("botName", e.target.value)}
            className="bg-panel border border-border-ui rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none focus:border-primary transition-all placeholder:text-text-secondary/30"
            placeholder="Ex: Nexo Assistant"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="welcome_message" className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
            Mensagem de Boas-vindas
          </label>
          <textarea
            id="welcome_message"
            value={welcomeMessage}
            onChange={(e) => setSettings("welcomeMessage", e.target.value)}
            className="bg-panel border border-border-ui rounded-xl px-4 py-3 text-sm text-text-primary outline-none focus:border-primary transition-all placeholder:text-text-secondary/30 resize-none h-24"
            placeholder="Ex: Olá! Como posso ajudar você hoje?"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="cor_principal" className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
            Cor Principal
          </label>
          <div className="flex gap-2">
            <div className="relative w-10 h-10 shrink-0">
              <input
                type="color"
                id="cor_principal"
                value={mainColor}
                onChange={(e) => setSettings("mainColor", e.target.value)}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              />
              <div
                className="w-full h-full rounded-xl border border-white/10 shadow-inner"
                style={{ backgroundColor: mainColor }}
              />
            </div>
            <input
              value={mainColor.toUpperCase()}
              onChange={(e) => setSettings("mainColor", e.target.value)}
              className="flex-1 bg-panel border border-border-ui rounded-xl px-4 py-2 text-xs text-text-primary font-mono outline-none focus:border-primary transition-all uppercase"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-border-ui/30 pt-4">
          <label className="text-[10px] font-black text-text-primary uppercase tracking-widest opacity-60 mb-2">
            Cores do Cabeçalho
          </label>
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Fundo</label>
              <div className="flex gap-2">
                <input type="color" value={headerBackgroundColor} onChange={(e) => setSettings("headerBackgroundColor", e.target.value)} className="w-10 h-10 rounded-xl bg-transparent border-none cursor-pointer" />
                <input value={headerBackgroundColor.toUpperCase()} onChange={(e) => setSettings("headerBackgroundColor", e.target.value)} className="flex-1 bg-panel border border-border-ui rounded-xl px-4 py-2 text-xs text-text-primary font-mono outline-none" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Texto</label>
              <div className="flex gap-2">
                <input type="color" value={headerTextColor} onChange={(e) => setSettings("headerTextColor", e.target.value)} className="w-10 h-10 rounded-xl bg-transparent border-none cursor-pointer" />
                <input value={headerTextColor.toUpperCase()} onChange={(e) => setSettings("headerTextColor", e.target.value)} className="flex-1 bg-panel border border-border-ui rounded-xl px-4 py-2 text-xs text-text-primary font-mono outline-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-border-ui/30 pt-4">
          <label className="text-[10px] font-black text-text-primary uppercase tracking-widest opacity-60 mb-2">
            Cores das Mensagens
          </label>
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Bolha Usuário</label>
              <div className="flex gap-2">
                <input type="color" value={userBubbleColor} onChange={(e) => setSettings("userBubbleColor", e.target.value)} className="w-10 h-10 rounded-xl bg-transparent border-none cursor-pointer" />
                <input value={userBubbleColor.toUpperCase()} onChange={(e) => setSettings("userBubbleColor", e.target.value)} className="flex-1 bg-panel border border-border-ui rounded-xl px-4 py-2 text-xs text-text-primary font-mono outline-none" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Bolha Bot</label>
              <div className="flex gap-2">
                <input type="color" value={botBubbleColor} onChange={(e) => setSettings("botBubbleColor", e.target.value)} className="w-10 h-10 rounded-xl bg-transparent border-none cursor-pointer" />
                <input value={botBubbleColor.toUpperCase()} onChange={(e) => setSettings("botBubbleColor", e.target.value)} className="flex-1 bg-panel border border-border-ui rounded-xl px-4 py-2 text-xs text-text-primary font-mono outline-none" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Texto Bot</label>
              <div className="flex gap-2">
                <input type="color" value={botTextColor} onChange={(e) => setSettings("botTextColor", e.target.value)} className="w-10 h-10 rounded-xl bg-transparent border-none cursor-pointer" />
                <input value={botTextColor.toUpperCase()} onChange={(e) => setSettings("botTextColor", e.target.value)} className="flex-1 bg-panel border border-border-ui rounded-xl px-4 py-2 text-xs text-text-primary font-mono outline-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="position" className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
            Posição na Tela
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['left', 'right'] as const).map((pos) => (
              <button
                key={pos}
                type="button"
                onClick={() => setSettings("position", pos)}
                className={`py-2 text-[10px] font-bold uppercase rounded-xl border transition-all ${position === pos
                  ? 'bg-primary/10 border-primary text-primary shadow-lg shadow-primary/10'
                  : 'bg-panel border-border-ui text-text-secondary hover:text-text-primary hover:bg-panel-hover'
                  }`}
              >
                {pos === 'left' ? 'Esquerda' : 'Direita'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="borderRadius" className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
            Arredondamento
          </label>
          <select
            id="borderRadius"
            value={borderRadius}
            onChange={(e) => setSettings("borderRadius", e.target.value as any)}
            className="bg-panel border border-border-ui rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none focus:border-primary appearance-none cursor-pointer"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '14px' }}
          >
            <option value="none">Nenhum (Square)</option>
            <option value="medium">Médio (Arredondado)</option>
            <option value="full">Completo (Círculo)</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="buttonIcon" className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
            Ícone do Botão
          </label>
          <select
            id="buttonIcon"
            value={buttonIcon}
            onChange={(e) => setSettings("buttonIcon", e.target.value as any)}
            className="bg-panel border border-border-ui rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none focus:border-primary appearance-none cursor-pointer"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '14px' }}
          >
            <option value="default">💬 Balão de Chat</option>
            <option value="sparkles">✨ Brilho (AI)</option>
            <option value="message">✉️ Mensagem</option>
          </select>
        </div>
      </div>
    </div>
  )
}