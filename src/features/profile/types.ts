/** Espelho de nexo-backend/src/domain/profile/contract.ts. */
export const AVATAR_COLORS = ["violet", "blue", "teal", "green", "amber", "orange", "pink", "graphite"] as const;
export type AvatarColor = (typeof AVATAR_COLORS)[number];

export const PRESENCE = ["instagram", "tiktok", "youtube", "whatsapp", "mercadolivre", "shopee", "store", "site"] as const;
export type Presence = (typeof PRESENCE)[number];

export const GOALS = ["whatsapp", "links", "autoreply", "sources"] as const;
export type Goal = (typeof GOALS)[number];

export type Audience = "creator" | "seller" | "business";

export interface BusinessProfile {
  audience?: Audience;
  brandName?: string;
  segment?: string;
  city?: string;
  presence: Presence[];
  goal?: Goal;
}

export interface Me {
  user: { id: string; name: string | null; email: string; avatarColor: AvatarColor | null; avatarImage: string | null; onboarded: boolean };
  workspace: { id: string; name: string; role: "OWNER" | "ADMIN" | "MEMBER"; profile: BusinessProfile };
}

export interface UpdateMe {
  name?: string;
  avatarColor?: AvatarColor;
  avatarImage?: string | null;
  business?: BusinessProfile;
  finishOnboarding?: boolean;
}
