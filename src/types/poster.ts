export interface PosterData {
  photo: string | null;
  fullName: string;
  gender: "allahyarham" | "almarhumah";
  birthDate: string;
  deathDate: string;
  organization?: string;
  message?: string;
  from: string;
  theme: "classic" | "retro";
}
