export type PosterFormat = "classic" | "instagram-square" | "instagram-landscape" | "instagram-portrait" | "facebook" | "instagram-story";
export type PosterTheme = "classic" | "retro" | "premium";
export type PremiumTemplate = "signature" | "official" | "official-light" | "official-night" | "official-emerald";

export interface PosterData {
  photo: string | null;
  companyLogo?: string | null;
  fullName: string;
  gender: "allahyarham" | "almarhumah";
  birthDate: string;
  deathDate: string;
  organization?: string;
  message?: string;
  from: string;
  theme: PosterTheme;
  premiumTemplate?: PremiumTemplate;
  format: PosterFormat;
  whiteLabel: boolean;
}
