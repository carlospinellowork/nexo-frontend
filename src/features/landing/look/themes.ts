import type { Background, BgPattern, ButtonShape, ButtonStyle, FontId, ThemeCategory, ThemeDef } from "./types";

/*
 * Temas prontos das bios. Os ids ficam iguais em nexo-backend/src/domain/landing/themes.ts (a API valida o tema).
 * Para criar um tema: acrescente aqui e o id lá. Nada de nome ou logotipo de marca: "Playlist" lembra um app de
 * música, "Boneca" o rosa-choque, sem copiar ninguém.
 */

const solid = (c: string): Background => ({ type: "solid", colors: [c] });
const grad = (colors: string[], angle = 160): Background => ({ type: "gradient", colors, angle });
const mesh = (colors: string[]): Background => ({ type: "mesh", colors });
const pattern = (base: string, ink: string, p: BgPattern): Background => ({ type: "pattern", colors: [base, ink], pattern: p });
const btn = (bg: string, text: string, style: ButtonStyle, shape: ButtonShape) => ({ bg, text, style, shape });
const cta = (bg: string, text: string) => ({ bg, text });

interface Colors {
  text: string;
  muted: string;
  accent: string;
  card: string;
  border: string;
  star?: string;
}

const theme = (
  id: string,
  name: string,
  description: string,
  category: ThemeCategory,
  bg: Background,
  colors: Colors,
  button: ThemeDef["button"],
  primary: ThemeDef["cta"],
  font: FontId,
): ThemeDef => ({ id, name, description, category, bg, ...colors, button, cta: primary, font });

const glassLight = "rgb(255 255 255 / 0.16)";
const glassLine = "rgb(255 255 255 / 0.3)";

export const THEMES: ThemeDef[] = [
  // Clássicos (os quatro primeiros temas do Nexo; servem também para as landing pages)
  theme("midnight-dark", "Meia-noite", "Escuro com destaque roxo", "classicos", solid("#090D16"),
    { text: "#F1F5F9", muted: "#94A3B8", accent: "#A78BFA", card: "#0F172A", border: "#1E293B", star: "#A78BFA" },
    btn("#0F172A", "#E2E8F0", "filled", "rounded"), cta("linear-gradient(90deg,#0A6CFF,#7C5CFF)", "#FFFFFF"), "inter"),
  theme("modern-blue", "Azul moderno", "Serviços e comércio", "classicos", solid("#0A0E1A"),
    { text: "#FFFFFF", muted: "#CBD5E1", accent: "#60A5FA", card: "#121829", border: "#1E293B", star: "#FBBF24" },
    btn("#182035", "#FFFFFF", "filled", "rounded"), cta("#0A6CFF", "#FFFFFF"), "inter"),
  theme("espresso-champagne", "Espresso e Champagne", "Luxo e alto padrão", "classicos", solid("#140F0D"),
    { text: "#F5EBE1", muted: "#C5B5A5", accent: "#E6C687", card: "#1E1714", border: "#332621", star: "#E6C687" },
    btn("#241B17", "#F5EBE1", "filled", "rounded"), cta("#E6C687", "#140F0D"), "inter"),
  theme("clean-slate", "Claro e sóbrio", "Saúde, educação, consultorias", "classicos", solid("#F8FAFC"),
    { text: "#0F172A", muted: "#475569", accent: "#0F172A", card: "#FFFFFF", border: "#E2E8F0", star: "#F59E0B" },
    btn("#FFFFFF", "#1E293B", "filled", "rounded"), cta("#0F172A", "#FFFFFF"), "inter"),

  // Claros
  theme("papel", "Papel", "Minimalista, letra de revista", "claros", solid("#FAF7F2"),
    { text: "#1F1B16", muted: "#6B6157", accent: "#1F1B16", card: "#FFFFFF", border: "#E7DFD3" },
    btn("#FAF7F2", "#1F1B16", "outline", "square"), cta("#1F1B16", "#FAF7F2"), "dm-serif"),
  theme("neve", "Neve", "Branco limpo e botões pretos", "claros", solid("#FFFFFF"),
    { text: "#111111", muted: "#6B7280", accent: "#111111", card: "#F5F5F5", border: "#E5E7EB" },
    btn("#111111", "#FFFFFF", "filled", "pill"), cta("#111111", "#FFFFFF"), "outfit"),
  theme("areia", "Areia", "Tons de terra", "claros", solid("#EFE6D8"),
    { text: "#3A2A1E", muted: "#7A6656", accent: "#C4663F", card: "#F7F0E6", border: "#E0D3C1" },
    btn("#C4663F", "#FFF8F0", "filled", "rounded"), cta("#3A2A1E", "#EFE6D8"), "playfair"),
  theme("menta", "Menta", "Verde fresquinho", "claros", grad(["#E8F7EF", "#D1F2E1"], 180),
    { text: "#0F3D2A", muted: "#3F6B57", accent: "#1F8A5B", card: "rgb(255 255 255 / 0.7)", border: "#BFE6D1" },
    btn("#1F8A5B", "#0F3D2A", "soft", "pill"), cta("#1F8A5B", "#FFFFFF"), "nunito"),
  theme("ceu", "Céu", "Azul clarinho", "claros", grad(["#E0F2FE", "#F0F9FF"], 180),
    { text: "#0C2D48", muted: "#3C5A75", accent: "#0284C7", card: "#FFFFFF", border: "#CDE7F8" },
    btn("#FFFFFF", "#0C2D48", "filled", "pill"), cta("#0284C7", "#FFFFFF"), "nunito"),
  theme("lavanda", "Lavanda", "Lilás delicado", "claros", solid("#F3EEFF"),
    { text: "#2E1065", muted: "#6D5A9C", accent: "#7C3AED", card: "#FFFFFF", border: "#E4D9FF" },
    btn("#7C3AED", "#FFFFFF", "filled", "pill"), cta("#2E1065", "#FFFFFF"), "outfit"),
  theme("pessego", "Pêssego", "Degradê suave e quente", "claros", grad(["#FFE4D6", "#FFD1DC"], 150),
    { text: "#4A1F1A", muted: "#8A5A52", accent: "#F2665A", card: "rgb(255 255 255 / 0.65)", border: "#FFC9BD" },
    btn("#FFFFFF", "#4A1F1A", "glass", "pill"), cta("#F2665A", "#FFFFFF"), "nunito"),
  theme("limao", "Limão", "Contorno forte, cara de pôster", "claros", solid("#F4FCD0"),
    { text: "#111111", muted: "#4B5320", accent: "#111111", card: "#FFFFFF", border: "#111111" },
    btn("#D9F99D", "#111111", "hard", "square"), cta("#111111", "#F4FCD0"), "space-grotesk"),
  theme("jardim", "Jardim", "Verde com bolinhas", "claros", pattern("#F1F8E9", "#7CB342", "dots"),
    { text: "#1B3A12", muted: "#4D6B40", accent: "#558B2F", card: "#FFFFFF", border: "#DCEDC8" },
    btn("#558B2F", "#FFFFFF", "filled", "pill"), cta("#1B3A12", "#FFFFFF"), "nunito"),
  theme("ouro-rose", "Ouro rosé", "Rosado e sofisticado", "claros", grad(["#F6D5C8", "#E8B4A0"], 170),
    { text: "#4A2A22", muted: "#7D5A4E", accent: "#9C4A3A", card: "rgb(255 255 255 / 0.55)", border: "rgb(255 255 255 / 0.8)" },
    btn("#FFFFFF", "#4A2A22", "filled", "pill"), cta("#4A2A22", "#FFFFFF"), "playfair"),

  // Escuros
  theme("grafite", "Grafite", "Escuro com botões de vidro", "escuros", grad(["#1F1F22", "#0E0E10"], 180),
    { text: "#F4F4F5", muted: "#A1A1AA", accent: "#E4E4E7", card: "rgb(255 255 255 / 0.06)", border: "rgb(255 255 255 / 0.1)" },
    btn("#27272A", "#F4F4F5", "glass", "rounded"), cta("#F4F4F5", "#111111"), "inter"),
  theme("playlist", "Playlist", "Preto e verde, cara de app de música", "escuros", solid("#121212"),
    { text: "#FFFFFF", muted: "#B3B3B3", accent: "#1ED760", card: "#181818", border: "#282828", star: "#1ED760" },
    btn("#1F1F1F", "#FFFFFF", "filled", "pill"), cta("#1ED760", "#000000"), "outfit"),
  theme("cinema", "Sessão de cinema", "Preto e vermelho de tela grande", "escuros", grad(["#000000", "#1A0003"], 180),
    { text: "#FFFFFF", muted: "#B3B3B3", accent: "#E50914", card: "#141414", border: "#2A2A2A" },
    btn("#1C1C1C", "#FFFFFF", "filled", "square"), cta("#E50914", "#FFFFFF"), "bebas"),
  theme("neon", "Neon", "Contornos que brilham", "escuros", solid("#0A0118"),
    { text: "#F5F3FF", muted: "#A99BD1", accent: "#22D3EE", card: "rgb(34 211 238 / 0.06)", border: "rgb(236 72 153 / 0.45)" },
    btn("#0A0118", "#F0ABFC", "outline", "pill"), cta("linear-gradient(90deg,#EC4899,#22D3EE)", "#0A0118"), "space-grotesk"),
  theme("floresta", "Floresta", "Verde-escuro e dourado", "escuros", solid("#0F2A1D"),
    { text: "#F1EBDD", muted: "#B7C2B0", accent: "#D9B26F", card: "#143524", border: "#22452F" },
    btn("#143524", "#F1EBDD", "filled", "rounded"), cta("#D9B26F", "#0F2A1D"), "playfair"),
  theme("oceano-noturno", "Oceano noturno", "Azul profundo e turquesa", "escuros", grad(["#0B1E3F", "#04101F"], 180),
    { text: "#E6F1FF", muted: "#8FA8C7", accent: "#2DD4BF", card: "rgb(255 255 255 / 0.05)", border: "rgb(45 212 191 / 0.2)" },
    btn("#0E2747", "#E6F1FF", "filled", "rounded"), cta("#2DD4BF", "#04101F"), "inter"),
  theme("vinho", "Vinho", "Bordô e rosé", "escuros", solid("#2A0A12"),
    { text: "#F8E8E4", muted: "#C9A3A0", accent: "#E8B4A0", card: "#3A1019", border: "#4D1A24" },
    btn("#3A1019", "#F8E8E4", "filled", "pill"), cta("#E8B4A0", "#2A0A12"), "playfair"),
  theme("aurora", "Aurora", "Luzes do norte que se mexem", "escuros", mesh(["#050816", "#16A34A", "#7C3AED", "#0EA5E9"]),
    { text: "#F0FDF4", muted: "#BBD3C6", accent: "#86EFAC", card: "rgb(255 255 255 / 0.08)", border: "rgb(255 255 255 / 0.14)" },
    btn("#FFFFFF", "#F0FDF4", "glass", "rounded"), cta("#F0FDF4", "#050816"), "outfit"),
  theme("galaxia", "Galáxia", "Céu estrelado", "escuros", pattern("#070417", "#FFFFFF", "stars"),
    { text: "#EDE9FE", muted: "#A5A1C9", accent: "#C084FC", card: "rgb(255 255 255 / 0.06)", border: "rgb(192 132 252 / 0.25)" },
    btn("#160E33", "#EDE9FE", "filled", "pill"), cta("linear-gradient(90deg,#8B5CF6,#EC4899)", "#FFFFFF"), "space-grotesk"),
  theme("carbono", "Carbono", "Quadriculado e laranja", "escuros", pattern("#161616", "#FFFFFF", "grid"),
    { text: "#FAFAFA", muted: "#A3A3A3", accent: "#FF6B00", card: "#1F1F1F", border: "#FAFAFA" },
    btn("#FF6B00", "#111111", "hard", "square"), cta("#FAFAFA", "#111111"), "space-grotesk"),
  theme("estudio", "Estúdio", "Escuro com grão de filme", "escuros", pattern("#1A1A1A", "#FFFFFF", "noise"),
    { text: "#F5F5F5", muted: "#A8A8A8", accent: "#F5F5F5", card: "rgb(255 255 255 / 0.05)", border: "rgb(255 255 255 / 0.15)" },
    btn("#F5F5F5", "#F5F5F5", "glass", "pill"), cta("#F5F5F5", "#1A1A1A"), "dm-serif"),

  // Coloridos
  theme("por-do-sol", "Pôr do sol", "Laranja, rosa e roxo", "coloridos", grad(["#F58529", "#DD2A7B", "#8134AF"]),
    { text: "#FFFFFF", muted: "rgb(255 255 255 / 0.82)", accent: "#FFE08A", card: glassLight, border: glassLine },
    btn("#FFFFFF", "#FFFFFF", "glass", "pill"), cta("#FFFFFF", "#8134AF"), "outfit"),
  theme("tropical", "Tropical", "Verde-água e amarelo", "coloridos", grad(["#B8F5E1", "#FFF3B0"], 180),
    { text: "#0B3B33", muted: "#3E6B60", accent: "#00A389", card: "rgb(255 255 255 / 0.7)", border: "rgb(0 163 137 / 0.2)" },
    btn("#00A389", "#FFFFFF", "filled", "pill"), cta("#FF7A59", "#FFFFFF"), "nunito"),
  theme("algodao-doce", "Algodão-doce", "Nuvem pastel que se mexe", "coloridos", mesh(["#FDF2F8", "#F9A8D4", "#A5F3FC", "#C4B5FD"]),
    { text: "#4A1D5C", muted: "#7E5A8F", accent: "#DB2777", card: "rgb(255 255 255 / 0.6)", border: "rgb(255 255 255 / 0.8)" },
    btn("#FFFFFF", "#4A1D5C", "glass", "pill"), cta("#DB2777", "#FFFFFF"), "fredoka"),
  theme("citrico", "Cítrico", "Laranja vibrante", "coloridos", solid("#FF8A00"),
    { text: "#FFFFFF", muted: "#FFE7C7", accent: "#FFFFFF", card: "rgb(255 255 255 / 0.18)", border: "rgb(255 255 255 / 0.35)" },
    btn("#FFFFFF", "#C2410C", "filled", "rounded"), cta("#3B1600", "#FFFFFF"), "outfit"),
  theme("azul-eletrico", "Azul elétrico", "Azul forte e amarelo", "coloridos", solid("#2E3BFF"),
    { text: "#FFFFFF", muted: "#C7CBFF", accent: "#FFE600", card: "rgb(255 255 255 / 0.12)", border: "#FFFFFF" },
    btn("#FFFFFF", "#2E3BFF", "hard", "square"), cta("#FFE600", "#1A1F99"), "space-grotesk"),
  theme("conversa", "Conversa", "O verde das mensagens", "coloridos", grad(["#075E54", "#128C7E"], 180),
    { text: "#FFFFFF", muted: "#CDEFE9", accent: "#25D366", card: "rgb(255 255 255 / 0.1)", border: "rgb(255 255 255 / 0.18)" },
    btn("#FFFFFF", "#075E54", "filled", "pill"), cta("#25D366", "#073B33"), "inter"),
  theme("roxo-digital", "Roxo digital", "Roxo de banco digital", "coloridos", solid("#820AD1"),
    { text: "#FFFFFF", muted: "#E3C8F7", accent: "#FFFFFF", card: "rgb(255 255 255 / 0.12)", border: "rgb(255 255 255 / 0.2)" },
    btn("#FFFFFF", "#820AD1", "filled", "pill"), cta("#2B0045", "#FFFFFF"), "outfit"),
  theme("arco-iris", "Arco-íris", "Todas as cores, bem clarinhas", "coloridos", grad(["#FFD6E0", "#FFF1C1", "#C9F7D9", "#C7E3FF", "#E3D3FF"], 180),
    { text: "#2B2B3A", muted: "#5E5E73", accent: "#7C3AED", card: "rgb(255 255 255 / 0.7)", border: "rgb(255 255 255 / 0.9)" },
    btn("#FFFFFF", "#2B2B3A", "filled", "pill"), cta("#2B2B3A", "#FFFFFF"), "fredoka"),
  theme("mar", "Mar", "Azul de praia", "coloridos", grad(["#00B4DB", "#0083B0"], 180),
    { text: "#FFFFFF", muted: "#D9F3FB", accent: "#FFFFFF", card: "rgb(255 255 255 / 0.14)", border: "rgb(255 255 255 / 0.28)" },
    btn("#FFFFFF", "#FFFFFF", "glass", "pill"), cta("#FFFFFF", "#006A8E"), "nunito"),
  theme("fogo", "Fogo", "Vermelho e laranja", "coloridos", grad(["#FF416C", "#FF4B2B"]),
    { text: "#FFFFFF", muted: "#FFE1DA", accent: "#FFE08A", card: "rgb(255 255 255 / 0.15)", border: "rgb(255 255 255 / 0.3)" },
    btn("#FFFFFF", "#C81D3A", "filled", "rounded"), cta("#3A0A12", "#FFFFFF"), "outfit"),
  theme("praia", "Praia", "Mar e areia", "coloridos", grad(["#7DD3FC", "#BAE6FD", "#FDE68A"], 180),
    { text: "#0C3B57", muted: "#2F5F7A", accent: "#0369A1", card: "rgb(255 255 255 / 0.6)", border: "rgb(255 255 255 / 0.85)" },
    btn("#FFFFFF", "#0C3B57", "glass", "pill"), cta("#F97316", "#FFFFFF"), "nunito"),

  // Divertidos
  theme("boneca", "Boneca", "Rosa-choque com corações", "divertidos", pattern("#FF4FA3", "#FFFFFF", "hearts"),
    { text: "#FFFFFF", muted: "#FFE3F1", accent: "#FFFFFF", card: "rgb(255 255 255 / 0.18)", border: "rgb(255 255 255 / 0.4)" },
    btn("#FFFFFF", "#E0157A", "filled", "pill"), cta("#8A0A4B", "#FFFFFF"), "pacifico"),
  theme("morango", "Morango", "Rosinha com moranguinhos", "divertidos", pattern("#FFE5EC", "#E63950", "strawberries"),
    { text: "#6B0F24", muted: "#A3485C", accent: "#E63950", card: "rgb(255 255 255 / 0.85)", border: "#FFC2D1" },
    btn("#E63950", "#FFFFFF", "filled", "rounded"), cta("#3BA55C", "#FFFFFF"), "fredoka"),
  theme("chiclete", "Chiclete", "Rosa com brilhos e contorno", "divertidos", pattern("#FF9ECF", "#FFFFFF", "sparkles"),
    { text: "#1A1A1A", muted: "#4D2A3D", accent: "#1A1A1A", card: "#FFFFFF", border: "#1A1A1A" },
    btn("#FFFFFF", "#1A1A1A", "hard", "pill"), cta("#7CF5FF", "#1A1A1A"), "fredoka"),
  theme("fliperama", "Fliperama", "Videogame dos anos 90", "divertidos", pattern("#1B1B3A", "#5B5BD6", "grid"),
    { text: "#F8F8FF", muted: "#A6A6D9", accent: "#FFD60A", card: "#24244D", border: "#FFD60A" },
    btn("#FFD60A", "#1B1B3A", "hard", "square"), cta("#FF4D6D", "#FFFFFF"), "press-start"),
  theme("anos-80", "Anos 80", "Pôr do sol de fita cassete", "divertidos", grad(["#1A0B2E", "#5B1A6B", "#D53369"], 180),
    { text: "#FFF1F8", muted: "#E3B7D6", accent: "#FFB86C", card: "rgb(255 255 255 / 0.07)", border: "#FF6EC7" },
    btn("#1A0B2E", "#FF6EC7", "outline", "square"), cta("linear-gradient(90deg,#FF6EC7,#FFB86C)", "#1A0B2E"), "bebas"),
  theme("quadro-negro", "Quadro-negro", "Giz e letra à mão", "divertidos", pattern("#2F3B35", "#FFFFFF", "noise"),
    { text: "#F5F5EE", muted: "#C9D1C9", accent: "#FFE66D", card: "rgb(255 255 255 / 0.06)", border: "rgb(245 245 238 / 0.6)" },
    btn("#2F3B35", "#F5F5EE", "outline", "rounded"), cta("#FFE66D", "#2F3B35"), "caveat"),
  theme("caderno", "Caderno", "Folha quadriculada", "divertidos", pattern("#FFFFFF", "#60A5FA", "grid"),
    { text: "#1E293B", muted: "#475569", accent: "#2563EB", card: "#FFFFFF", border: "#1E293B" },
    btn("#FFFFFF", "#1E293B", "hard", "rounded"), cta("#2563EB", "#FFFFFF"), "caveat"),
  theme("confeitaria", "Confeitaria", "Doce e bolinhas", "divertidos", pattern("#FFF4E6", "#C08552", "dots"),
    { text: "#5A3A22", muted: "#8C6A50", accent: "#C08552", card: "#FFFFFF", border: "#F0DCC5" },
    btn("#F8C8DC", "#5A3A22", "filled", "pill"), cta("#5A3A22", "#FFF4E6"), "fredoka"),
  theme("brinquedo", "Brinquedo", "Cores primárias e contorno", "divertidos", mesh(["#FFF8E7", "#FFD23F", "#3BCEAC", "#EE4266"]),
    { text: "#1F1F1F", muted: "#4A4A4A", accent: "#EE4266", card: "#FFFFFF", border: "#1F1F1F" },
    btn("#FFFFFF", "#1F1F1F", "hard", "rounded"), cta("#EE4266", "#FFFFFF"), "fredoka"),
  theme("ondas", "Ondas", "Azul com ondinhas", "divertidos", pattern("#E0F7FA", "#0097A7", "waves"),
    { text: "#003F47", muted: "#2E6970", accent: "#00838F", card: "#FFFFFF", border: "#B2EBF2" },
    btn("#00838F", "#FFFFFF", "filled", "pill"), cta("#FF7043", "#FFFFFF"), "nunito"),

  // Por negócio
  theme("barbearia", "Barbearia", "Escuro, listrado e dourado", "negocios", pattern("#1C1712", "#C9A227", "diagonal"),
    { text: "#F2E9DC", muted: "#B9AC98", accent: "#C9A227", card: "#231D17", border: "#3A3027" },
    btn("#231D17", "#F2E9DC", "filled", "square"), cta("#C9A227", "#1C1712"), "bebas"),
  theme("salao", "Salão", "Nude e rosa", "negocios", solid("#FBEFF1"),
    { text: "#4A1C2C", muted: "#8C6170", accent: "#C2185B", card: "#FFFFFF", border: "#F3D3DB" },
    btn("#FBEFF1", "#C2185B", "outline", "pill"), cta("#C2185B", "#FFFFFF"), "playfair"),
  theme("clinica", "Clínica", "Branco e verde-azulado", "negocios", solid("#F5FAFF"),
    { text: "#0F2E3D", muted: "#4E6B7A", accent: "#0EA5A4", card: "#FFFFFF", border: "#DCEFF5" },
    btn("#FFFFFF", "#0F2E3D", "filled", "rounded"), cta("#0EA5A4", "#FFFFFF"), "nunito"),
  theme("cafe", "Café", "Marrom e creme", "negocios", solid("#3B2A20"),
    { text: "#F3E5D0", muted: "#C7B29A", accent: "#E0B07D", card: "#463327", border: "#5A4334" },
    btn("#F3E5D0", "#3B2A20", "filled", "rounded"), cta("#E0B07D", "#3B2A20"), "dm-serif"),
  theme("academia", "Academia", "Preto e verde-limão", "negocios", solid("#0D0D0D"),
    { text: "#FFFFFF", muted: "#A3A3A3", accent: "#C6FF00", card: "#171717", border: "#C6FF00" },
    btn("#171717", "#FFFFFF", "filled", "square"), cta("#C6FF00", "#0D0D0D"), "bebas"),
  theme("pet", "Pet", "Amarelinho e bolinhas", "negocios", pattern("#FFF7E0", "#F59E0B", "dots"),
    { text: "#4A3000", muted: "#7A5A1F", accent: "#EA580C", card: "#FFFFFF", border: "#FDE3A7" },
    btn("#FFFFFF", "#4A3000", "filled", "pill"), cta("#EA580C", "#FFFFFF"), "fredoka"),
  theme("lanchonete", "Lanchonete", "Amarelo e vermelho", "negocios", solid("#FFC93C"),
    { text: "#2B0A00", muted: "#6B3A12", accent: "#D62828", card: "#FFF3CF", border: "#2B0A00" },
    btn("#D62828", "#FFFFFF", "hard", "rounded"), cta("#2B0A00", "#FFC93C"), "bebas"),
  theme("diamante", "Diamante", "Preto e dourado fino", "negocios", solid("#0A0A0A"),
    { text: "#FFFFFF", muted: "#A3A3A3", accent: "#D4AF37", card: "#121212", border: "rgb(212 175 55 / 0.5)" },
    btn("#0A0A0A", "#F5E6B8", "outline", "pill"), cta("#D4AF37", "#0A0A0A"), "playfair"),
  theme("cantina", "Cantina", "Toalha xadrez", "negocios", pattern("#FFFBF5", "#C1272D", "checker"),
    { text: "#3A1A12", muted: "#6E4A3E", accent: "#C1272D", card: "#FFFFFF", border: "#F1D9CF" },
    btn("#C1272D", "#FFFFFF", "filled", "rounded"), cta("#2E6B3F", "#FFFFFF"), "dm-serif"),
  theme("estetica", "Estética", "Branco, lilás e dourado", "negocios", grad(["#FFFFFF", "#F3E8FF"], 180),
    { text: "#3B2350", muted: "#76658A", accent: "#B08D57", card: "#FFFFFF", border: "#E9DDF5" },
    btn("#FFFFFF", "#3B2350", "filled", "pill"), cta("#3B2350", "#FFFFFF"), "playfair"),
];

export const DEFAULT_THEME = "modern-blue";
const BY_ID = new Map(THEMES.map((t) => [t.id, t]));

/** Tema pelo id; id desconhecido (ex.: tema removido) cai no padrão. */
export const getTheme = (id: string | null | undefined): ThemeDef => BY_ID.get(id ?? "") ?? BY_ID.get(DEFAULT_THEME)!;
export const THEME_IDS = THEMES.map((t) => t.id);
