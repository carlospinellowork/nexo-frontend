import { ArrowRight, Mail, MessageCircle, Sparkles } from "lucide-react"
import { useChatBuilderStore } from "../store/chat-builder-store"

export function WidgetPreview() {
  const { getActiveSettings } = useChatBuilderStore()
  const {
    mainColor,
    position,
    botName,
    borderRadius,
    buttonIcon,
    welcomeMessage,
    headerBackgroundColor,
    headerTextColor,
    userBubbleColor,
    botBubbleColor,
    botTextColor
  } = getActiveSettings()

  const radiusClasses = {
    none: "rounded-none",
    medium: "rounded-2xl",
    full: "rounded-full"
  } as const

  const icons = {
    default: MessageCircle,
    sparkles: Sparkles,
    message: Mail
  } as const

  const Icon = icons[buttonIcon as keyof typeof icons] || MessageCircle

  return (
    <div className="flex-1 bg-bg-end/50 relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '24px 24px' }} />

      <div className="text-center z-0">
        <span className="text-text-secondary/10 font-black text-6xl uppercase tracking-[0.3em] select-none block">
          Preview
        </span>
        <span className="text-text-secondary/5 font-bold text-xl uppercase tracking-[0.2em] select-none mt-2 block">
          Ambiente do Site
        </span>
      </div>

      <div className={`absolute bottom-10 ${position === 'right' ? 'right-10' : 'left-10'} flex flex-col items-end gap-5 w-full max-w-[320px]`}>

        <div className={`bg-panel border border-border-ui shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700 w-full overflow-hidden transition-all ${radiusClasses[(borderRadius === 'full' ? 'medium' : borderRadius) as keyof typeof radiusClasses]}`}>
          <div
            style={{ backgroundColor: headerBackgroundColor, color: headerTextColor }}
            className="p-4 flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider">{botName}</p>
              <p className="text-[10px] opacity-70">Online agora</p>
            </div>
          </div>

          <div className="p-4 space-y-3 bg-bg-start/50">
            <div className="flex flex-col items-start gap-1">
              <div
                style={{ backgroundColor: botBubbleColor, color: botTextColor }}
                className={`p-3 text-xs shadow-sm max-w-[85%] ${radiusClasses.medium} rounded-bl-none`}
              >
                {welcomeMessage || "Olá! Como posso ajudar você hoje?"}
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <div
                style={{ backgroundColor: userBubbleColor, color: '#fff' }}
                className={`p-3 text-xs shadow-sm max-w-[85%] ${radiusClasses.medium} rounded-br-none`}
              >
                Gostaria de saber mais sobre o plano Pro.
              </div>
            </div>
          </div>

          <div className="p-3 border-t border-border-ui flex gap-2 bg-white/5">
            <div className="flex-1 h-8 bg-bg-start border border-border-ui rounded-full px-3 flex items-center">
              <span className="text-[10px] text-text-secondary/50 font-medium">Digite uma mensagem...</span>
            </div>
            <div
              style={{ backgroundColor: mainColor }}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white"
            >
              <ArrowRight size={14} />
            </div>
          </div>
        </div>

        <button
          style={{ backgroundColor: mainColor }}
          className={`w-16 h-16 flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all text-white group relative ${radiusClasses[borderRadius as keyof typeof radiusClasses]}`}
        >
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-inherit" />
          <Icon size={28} className="drop-shadow-md" />
        </button>
      </div>
    </div>
  )
}