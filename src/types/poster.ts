export type PosterFormat = "classic" | "instagram-square" | "instagram-landscape" | "instagram-portrait" | "facebook" | "instagram-story";
export type PosterTheme = "classic" | "retro" | "premium";

export interface PosterData {
  photo: string | null;
  fullName: string;
  gender: "allahyarham" | "almarhumah";
  birthDate: string;
  deathDate: string;
  organization?: string;
  message?: string;
  from: string;
  theme: PosterTheme;
  format: PosterFormat;
  whiteLabel: boolean;
}
