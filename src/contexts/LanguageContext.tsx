import { createContext, useContext, useState, ReactNode } from "react";

export type Language = "ms" | "en";

interface Translations {
  // Header
  mainTitle: string;
  mainSubtitle: string;
  
  // Form
  formTitle: string;
  photoLabel: string;
  required: string;
  clickToSelect: string;
  maxSize: string;
  autoGrayscale: string;
  fullNameLabel: string;
  fullNamePlaceholder: string;
  genderLabel: string;
  genderMale: string;
  genderFemale: string;
  birthDateLabel: string;
  deathDateLabel: string;
  organizationLabel: string;
  organizationPlaceholder: string;
  messageLabel: string;
  messagePlaceholder: string;
  fromLabel: string;
  fromPlaceholder: string;
  themeLabel: string;
  themeClassic: string;
  themeRetro: string;
  generateButton: string;
  
  // Toast messages
  toastSizeError: string;
  toastRequiredError: string;
  toastSuccess: string;
  
  // Preview
  previewTitle: string;
  previewDescription: string;
  downloadButton: string;
  downloadingButton: string;
  
  // Info sections
  infoMesejTitle: string;
  infoMesejDesc: string;
  infoEnglishTitle: string;
  infoEnglishDesc: string;
  infoWhatsappTitle: string;
  infoWhatsappDesc: string;
  infoTemplateTitle: string;
  infoTemplateDesc: string;
  readGuide: string;
  
  // Footer
  footerText: string;
}

const translations: Record<Language, Translations> = {
  ms: {
    mainTitle: "Ucapan Takziah dengan Doa & Ingatan",
    mainSubtitle: "Abadikan kasih dan kenangan dalam helaian doa serta penghormatan terakhir.",
    formTitle: "Maklumat Takziah",
    photoLabel: "📸 Upload Gambar Allahyarham / Almarhumah",
    required: "*",
    clickToSelect: "Klik untuk pilih gambar",
    maxSize: "Maksimum 5MB",
    autoGrayscale: "Gambar akan ditukar kepada hitam putih secara automatik.",
    fullNameLabel: "🧍‍♂️ Nama Penuh",
    fullNamePlaceholder: "Cth: Ahmad bin Abdullah",
    genderLabel: "⚧ Gelaran",
    genderMale: "Allahyarham",
    genderFemale: "Almarhumah",
    birthDateLabel: "📅 Tarikh Lahir",
    deathDateLabel: "📅 Tarikh Meninggal",
    organizationLabel: "🏢 Organisasi / Jawatan (Pilihan)",
    organizationPlaceholder: "Cth: Pensyarah Universiti Malaya",
    messageLabel: "💬 Ucapan Takziah (Pilihan)",
    messagePlaceholder: "Cth: Takziah daripada keluarga...",
    fromLabel: "✍️ Daripada",
    fromPlaceholder: "Cth: Keluarga Ahmad",
    themeLabel: "🎨 Tema Poster",
    themeClassic: "Klasik",
    themeRetro: "Retro",
    generateButton: "🎨 Jana Poster",
    toastSizeError: "Saiz gambar terlalu besar. Maksimum 5MB.",
    toastRequiredError: "Sila isi semua ruangan yang diwajibkan.",
    toastSuccess: "Poster berjaya dijana!",
    previewTitle: "Pratonton Poster",
    previewDescription: "Poster akan dipaparkan di sini setelah anda jana.",
    downloadButton: "Muat Turun sebagai JPEG",
    downloadingButton: "Memuat turun...",
    infoMesejTitle: "🤲 Mesej Takziah Islam",
    infoMesejDesc: "Doa dan ucapan takziah mengikut sunnah yang sesuai untuk disampaikan kepada keluarga si mati.",
    infoEnglishTitle: "🌍 English Condolences",
    infoEnglishDesc: "Professional and respectful condolence messages in English for workplace or multicultural settings.",
    infoWhatsappTitle: "📱 Ucapan WhatsApp",
    infoWhatsappDesc: "Mesej takziah ringkas dan padat untuk dihantar melalui WhatsApp, SMS, dan Telegram.",
    infoTemplateTitle: "🎨 Template & Format",
    infoTemplateDesc: "Panduan lengkap mengenai saiz, format, dan piawaian poster takziah yang sesuai.",
    readGuide: "Baca Panduan →",
    footerText: "© 2025 Penjana Poster Takziah Islam. Semoga Allah merahmati arwah yang telah pergi.",
  },
  en: {
    mainTitle: "Islamic Condolence Messages with Prayers & Remembrance",
    mainSubtitle: "Eternalize love and memories in prayers and final tributes.",
    formTitle: "Condolence Information",
    photoLabel: "📸 Upload Photo of the Deceased",
    required: "*",
    clickToSelect: "Click to select image",
    maxSize: "Maximum 5MB",
    autoGrayscale: "Image will be automatically converted to grayscale.",
    fullNameLabel: "🧍‍♂️ Full Name",
    fullNamePlaceholder: "E.g: Ahmad bin Abdullah",
    genderLabel: "⚧ Title",
    genderMale: "Allahyarham (Male)",
    genderFemale: "Almarhumah (Female)",
    birthDateLabel: "📅 Birth Date",
    deathDateLabel: "📅 Date of Passing",
    organizationLabel: "🏢 Organization / Position (Optional)",
    organizationPlaceholder: "E.g: University of Malaya Lecturer",
    messageLabel: "💬 Condolence Message (Optional)",
    messagePlaceholder: "E.g: Condolences from the family...",
    fromLabel: "✍️ From",
    fromPlaceholder: "E.g: Ahmad's Family",
    themeLabel: "🎨 Poster Theme",
    themeClassic: "Classic",
    themeRetro: "Retro",
    generateButton: "🎨 Generate Poster",
    toastSizeError: "Image size too large. Maximum 5MB.",
    toastRequiredError: "Please fill in all required fields.",
    toastSuccess: "Poster generated successfully!",
    previewTitle: "Poster Preview",
    previewDescription: "The poster will be displayed here after you generate it.",
    downloadButton: "Download as JPEG",
    downloadingButton: "Downloading...",
    infoMesejTitle: "🤲 Islamic Condolence Messages",
    infoMesejDesc: "Prayers and condolence messages according to Sunnah that are appropriate to convey to the family of the deceased.",
    infoEnglishTitle: "🌍 English Condolences",
    infoEnglishDesc: "Professional and respectful condolence messages in English for workplace or multicultural settings.",
    infoWhatsappTitle: "📱 WhatsApp Messages",
    infoWhatsappDesc: "Brief and concise condolence messages to send via WhatsApp, SMS, and Telegram.",
    infoTemplateTitle: "🎨 Template & Format",
    infoTemplateDesc: "Complete guide on sizes, formats, and standards for appropriate condolence posters.",
    readGuide: "Read Guide →",
    footerText: "© 2025 Islamic Condolence Poster Generator. May Allah have mercy on the departed souls.",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>("ms");

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: translations[language],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
