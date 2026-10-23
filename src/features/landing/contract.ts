/**
 * Contrato das landing pages — espelho de nexo-backend/src/domain/landing/contract.ts.
 * O backend valida (Zod); aqui ficam os tipos e os limites usados nos campos do editor.
 */

export const LANDING_THEMES = ["modern-blue", "espresso-champagne", "midnight-dark", "clean-slate"] as const;
export type LandingTheme = (typeof LANDING_THEMES)[number];

export const SECTION_TYPES = ["hero", "services", "features", "testimonials", "faq", "cta", "footer"] as const;
export type SectionType = (typeof SECTION_TYPES)[number];

export const LANDING_ICONS = [
  "Sparkles",
  "Zap",
  "ShieldCheck",
  "Award",
  "Star",
  "CheckCircle2",
  "Users",
  "Phone",
  "Globe",
  "Heart",
  "Clock",
  "Calendar",
  "MapPin",
  "Truck",
  "Wrench",
  "Stethoscope",
  "GraduationCap",
  "Home",
  "Briefcase",
  "Scissors",
  "Camera",
  "Utensils",
  "Car",
  "Dumbbell",
] as const;
export type LandingIcon = (typeof LANDING_ICONS)[number];

/** Tamanhos máximos (os mesmos do Zod no backend). */
export const MAX = {
  badge: 80,
  headline: 180,
  subheadline: 400,
  sectionTitle: 120,
  sectionSubtitle: 300,
  ctaText: 50,
  itemTitle: 80,
  itemDescription: 300,
  highlight: 50,
  statNumber: 30,
  statLabel: 60,
  author: 80,
  testimonial: 400,
  question: 160,
  answer: 800,
  ctaHeadline: 160,
  ctaSubheadline: 350,
  note: 120,
  companyName: 80,
  tagline: 200,
  copyright: 120,
  services: 8,
  features: 6,
  testimonials: 6,
  faq: 10,
} as const;

export interface HeroData {
  badge?: string;
  headline: string;
  subheadline?: string;
  ctaText: string;
  ctaAction: "chat" | "scroll" | "link";
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  imageUrl?: string;
}
export interface ServiceItem {
  id: string;
  icon: LandingIcon;
  title: string;
  description: string;
  highlight?: string;
}
export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  statNumber?: string;
  statLabel?: string;
}
export interface TestimonialItem {
  id: string;
  author: string;
  role?: string;
  company?: string;
  content: string;
  rating: number;
  avatarUrl?: string;
}
export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}
interface ListData<T> {
  badge?: string;
  title: string;
  subtitle?: string;
  items: T[];
}
export interface CtaData {
  headline: string;
  subheadline?: string;
  ctaText: string;
  ctaAction: "chat" | "link";
  ctaLink?: string;
  note?: string;
}
export interface FooterData {
  companyName: string;
  tagline?: string;
  copyright?: string;
  links?: { label: string; url: string }[];
}

interface SectionBase<T extends SectionType, D> {
  id: string;
  type: T;
  enabled: boolean;
  data: D;
}
export type LandingSection =
  | SectionBase<"hero", HeroData>
  | SectionBase<"services", ListData<ServiceItem>>
  | SectionBase<"features", ListData<FeatureItem>>
  | SectionBase<"testimonials", ListData<TestimonialItem>>
  | SectionBase<"faq", ListData<FaqItem>>
  | SectionBase<"cta", CtaData>
  | SectionBase<"footer", FooterData>;

export interface LandingPageSettings {
  showChatWidget: boolean;
  seoTitle?: string;
  seoDescription?: string;
  fontHeading: "inter" | "serif" | "outfit";
}

export const SECTION_LABELS: Record<SectionType, string> = {
  hero: "Capa",
  services: "Serviços",
  features: "Diferenciais",
  testimonials: "Depoimentos",
  faq: "Perguntas frequentes",
  cta: "Chamada final",
  footer: "Rodapé",
};

export const THEME_INFO: Record<LandingTheme, { name: string; description: string; colors: [string, string, string] }> = {
  "espresso-champagne": { name: "Espresso e Champagne", description: "Luxo e alto padrão", colors: ["#140F0D", "#E6C687", "#F5EBE1"] },
  "modern-blue": { name: "Azul moderno", description: "Serviços e comércio", colors: ["#0A0E1A", "#0A6CFF", "#FFFFFF"] },
  "midnight-dark": { name: "Meia-noite", description: "Tecnologia", colors: ["#090D16", "#7C5CFF", "#E2E8F0"] },
  "clean-slate": { name: "Claro e sóbrio", description: "Saúde, educação, consultorias", colors: ["#F8FAFC", "#0F172A", "#475569"] },
};

export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Página como o painel recebe. */
export interface LandingPageRecord {
  id: string;
  chatId: string | null;
  chat: { id: string; name: string } | null;
  title: string;
  slug: string;
  description: string | null;
  theme: LandingTheme;
  sections: LandingSection[];
  settings: LandingPageSettings;
  customDomain: string | null;
  publishedAt: string | null;
  hasUnpublishedChanges: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Página publicada, como o visitante recebe. */
export interface PublicLandingPage {
  title: string;
  slug: string;
  description: string | null;
  theme: LandingTheme;
  sections: LandingSection[];
  settings: LandingPageSettings;
  chat: { id: string; name: string } | null;
}
