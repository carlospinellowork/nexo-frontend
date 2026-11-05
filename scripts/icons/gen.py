"""
Gera os ícones do Nexo (MingCute, contorno + preenchido), um arquivo por ícone, mais o index.ts.

Uso (no nexo-frontend):
  python3 scripts/icons/gen.py node_modules/@iconify-json/mingcute/icons.json src/shared/icons/index.tsx NomeNovo,OutroNome
No site (nexo/nexo-site), troque o destino por src/components/icons/index.tsx.

Os ícones que já existem em <destino>/i continuam. Para um ícone novo, ponha o nome (estilo Lucide) e o nome da
MingCute no MAP abaixo (veja os nomes em https://www.mingcute.com) e rode de novo.
"""
import json, re, glob, sys
D = json.load(open(sys.argv[1]))['icons']
MAP = {
 'Linkedin':'linkedin','Threads':'threads','Pinterest':'pinterest','Github':'github','Discord':'discord','Behance':'behance',
 'AlignLeft':'align-left','AlignRight':'align-right','ArrowDown':'arrow-down','ArrowDownRight':'arrow-right-down','ArrowLeft':'arrow-left',
 'ArrowRight':'arrow-right','ArrowUp':'arrow-up','ArrowUpRight':'arrow-right-up','AtSign':'at','Award':'award','BatteryFull':'battery',
 'Bell':'notification','BellOff':'notification-off','BellRing':'bell-ringing','BookOpen':'book-2','Bot':'robot','Briefcase':'briefcase',
 'Building2':'building-2','Calendar':'calendar','CalendarCheck':'calendar-day','Camera':'camera','Car':'car','ChartLine':'chart-line',
 'Check':'check','CheckCircle2':'check-circle','ChevronDown':'down','ChevronLeft':'left','ChevronRight':'right','ChevronsUpDown':'selector-vertical',
 'Circle':'radiobox','CircleCheck':'check-circle','CircleDot':'dot-circle','Clock':'time','Code2':'code','Compass':'compass','Copy':'copy-2',
 'CornerDownRight':'corner-down-right','Download':'download-2','Dumbbell':'barbell','ExternalLink':'external-link','Eye':'eye-2','EyeOff':'eye-close',
 'FileCode2':'file-code','FileText':'document','FlaskConical':'flask','Gauge':'dashboard-3','GitBranch':'git-branch','GitGraph':'git-merge',
 'Globe':'world-2','GraduationCap':'mortarboard','GripVertical':'dots-vertical','Headset':'service','Heart':'heart','HelpCircle':'question',
 'Home':'home-4','House':'home-4','Image':'pic','ImagePlus':'pic-2','Info':'information','Instagram':'instagram','KeyRound':'key-2',
 'LayoutTemplate':'layout','Library':'book-6','Lightbulb':'bulb','Link':'link','Link2':'link','ListChecks':'list-check','Loader2':'loading',
 'Lock':'lock','LogOut':'exit','Mail':'mail','MapPin':'location','Menu':'menu','MessageCircle':'chat-1','MessageSquare':'message-3',
 'MessageSquareHeart':'heart-hand','MessageSquarePlus':'comment','MessagesSquare':'chat-3','Minus':'minus-circle','Monitor':'computer',
 'MonitorSmartphone':'device','Moon':'moon','MousePointerClick':'cursor-3','Music2':'tiktok','Package':'package','Paintbrush':'brush',
 'PanelsTopLeft':'layout-left','PartyPopper':'celebrate','Pencil':'edit-2','Phone':'phone','Play':'play','Plug':'plugin','Plus':'add',
 'Printer':'print','QrCode':'qrcode','Redo2':'forward-2','RefreshCw':'refresh-2','Repeat2':'repeat','Rocket':'rocket','RotateCcw':'anticlockwise',
 'Route':'route','Save':'save-2','ScanLine':'scan','Scissors':'scissors','Search':'search','Send':'send-plane','Settings2':'settings-3',
 'Share':'share-forward','Share2':'share-2','ShieldAlert':'safe-alert','ShieldCheck':'safe-shield-2','ShieldOff':'forbid-circle','ShoppingBag':'shopping-bag-1',
 'ShoppingCart':'shopping-cart-1','Shuffle':'shuffle','Signal':'signal','SlidersHorizontal':'settings-6','Smartphone':'cellphone','Sparkles':'sparkles',
 'Square':'square','SquareDot':'dot-grid','Star':'star','Stethoscope':'stethoscope','Store':'store','Sun':'sun','Trash2':'delete-2',
 'TriangleAlert':'warning','Truck':'truck','Undo2':'back-2','Unplug':'unlink','Upload':'upload-2','User':'user-3','UserPlus':'user-add',
 'UserRound':'user-3','Users':'group','Utensils':'fork-knife','Variable':'braces','Wand2':'magic-2','Wifi':'wifi','Workflow':'mind-map',
 'Wrench':'tool','X':'close','XCircle':'close-circle','Youtube':'youtube','Zap':'flash',
 # site
 'AlertTriangle':'warning','BadgeCheck':'certificate','BadgePercent':'coupon','BarChart3':'chart-bar','Calculator':'counter','CalendarClock':'calendar-time-add',
 'CheckCheck':'checks','Clapperboard':'clapperboard','Coffee':'teacup','Footprints':'foot','Headphones':'headphone','Hourglass':'sandglass',
 'MessageCircleQuestion':'question-2','Mic':'mic','Repeat':'repeat','Scale':'balance','Shirt':'t-shirt','Tag':'tag','ThumbsUp':'thumb-up',
 'TicketPercent':'ticket',
 # extras úteis
 'WhatsApp':'whatsapp','TikTok':'tiktok','Lipstick':'lipstick','UserStar':'user-star','XSocial':'social-x','Spotify':'spotify','Telegram':'telegram','Facebook':'facebook','Palette':'palette',
}
names = set(MAP)
def body(k):
    b = D[k]['body']
    # Tira o retângulo transparente de 24x24 que a MingCute usa como moldura.
    b = re.sub(r'<path d="M24 0v24H0V0z[^"]*"/>', '', b)
    return b
import os
_dir = os.path.join(os.path.dirname(sys.argv[2]), 'i')
existing = {f[:-3] for f in os.listdir(_dir) if f.endswith('.ts')} if os.path.isdir(_dir) else set()
wanted = {n for n in (sys.argv[3].split(',') if len(sys.argv) > 3 else []) if n}
unknown = wanted - names
if unknown: sys.exit('sem correspondência no MAP: ' + ', '.join(sorted(unknown)))
used = sorted(existing | wanted | {'WhatsApp','Spotify','Telegram','Facebook','Palette'})
# Só os novos são gerados (os que já existem ficam como estão: a MingCute pode ter mudado o nome de algum).
new = [n for n in used if n not in existing]
missing = [n for n in new if f'{MAP[n]}-line' not in D or f'{MAP[n]}-fill' not in D]
if missing: sys.exit('faltando: ' + ', '.join(f'{n}->{MAP[n]}' for n in missing))
head = """/**
 * Ícones do Nexo: MingCute Icon (https://www.mingcute.com, licença Apache 2.0), com traço arredondado no estilo
 * dos ícones do iPhone. Cada ícone tem o contorno (padrão) e o preenchido (`filled`), usado no item ativo do menu.
 *
 * GERADO por um script a partir de @iconify-json/mingcute: para incluir um ícone, adicione o nome no mapa do
 * script e gere de novo (ver docs/ICONES.md no repositório nexo). Os nomes seguem os do Lucide, que o Nexo usava antes.
 */
import { forwardRef, type ForwardRefExoticComponent, type RefAttributes, type SVGProps } from "react";

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "ref" | "dangerouslySetInnerHTML"> {
  size?: number | string;
  /** Aceito por compatibilidade; a MingCute tem traço fixo. */
  strokeWidth?: number | string;
  /** Versão preenchida (item ativo). */
  filled?: boolean;
}

export type IconComponent = ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;

function icon(name: string, line: string, fill: string): IconComponent {
  const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon({ size = 24, strokeWidth, filled = false, className, ...rest }, ref) {
    void strokeWidth;
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden={rest["aria-label"] ? undefined : true}
        focusable="false"
        className={className ? `nx-icon ${className}` : "nx-icon"}
        {...rest}
        dangerouslySetInnerHTML={{ __html: filled ? fill : line }}
      />
    );
  });
  Icon.displayName = name;
  return Icon;
}

"""
import os
base=os.path.dirname(sys.argv[2])
os.makedirs(os.path.join(base,'i'), exist_ok=True)
core=head.replace('function icon(', 'export function icon(')
open(os.path.join(base,'core.tsx'),'w').write(core)
idx=['/* Gerado: um arquivo por ícone (em ./i) para cada tela levar só os ícones que usa. */','export type { IconComponent, IconProps } from "./core";']
for n in used:
  if n in new:
    open(os.path.join(base,'i',n+'.ts'),'w').write(f'import {{ icon }} from "../core";\n\nexport const {n} = /* @__PURE__ */ icon("{n}", {json.dumps(body(MAP[n]+"-line"))}, {json.dumps(body(MAP[n]+"-fill"))});\n')
  idx.append(f'export {{ {n} }} from "./i/{n}";')
open(sys.argv[2].replace('.tsx','.ts'),'w').write('\n'.join(idx)+'\n')
print(len(used), 'ícones')
