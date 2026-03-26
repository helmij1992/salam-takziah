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
  formatLabel: string;
  formatClassic: string;
  formatInstagramSquare: string;
  formatInstagramLandscape: string;
  formatInstagramPortrait: string;
  formatFacebook: string;
  formatInstagramStory: string;
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

  // Homepage
  homeHeroTitle: string;
  homeHeroSubtitle: string;
  homeHeroCreateButton: string;
  homeHeroExamplesButton: string;
  homeFeaturesTitle: string;
  homeFeaturesSubtitle: string;
  homeFeature1Title: string;
  homeFeature1Desc: string;
  homeFeature2Title: string;
  homeFeature2Desc: string;
  homeFeature3Title: string;
  homeFeature3Desc: string;
  homePricingTitle: string;
  homePricingSubtitle: string;
  homeTrialText: string;
  homeSavingsText: string;
  homeCtaTitle: string;
  homeCtaSubtitle: string;
  homeCtaButton: string;
  homeFooterTagline: string;
  homeNavCreate: string;
  homeNavTemplates: string;
  homeNavPricing: string;
  homeNavHelp: string;
  homeNavContact: string;
  homeNavStatus: string;
  homeNavAbout: string;
  homeNavBlog: string;
  homeNavPrivacy: string;
  homeNavProduct: string;
  homeNavSupport: string;
  homeNavCompany: string;
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
    formatLabel: "📱 Format Poster",
    formatClassic: "Klasik (4:3)",
    formatInstagramSquare: "Instagram - Kuasa (1:1)",
    formatInstagramLandscape: "Instagram - Mendatar (1.91:1)",
    formatInstagramPortrait: "Instagram - Tegak (4:5)",
    formatFacebook: "Facebook (1.91:1)",
    formatInstagramStory: "Instagram Story (9:16)",
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

    // Homepage translations
    homeHeroTitle: "Cipta Poster Takziah yang Cantik",
    homeHeroSubtitle: "Hormati orang tersayang dengan poster takziah Islam yang direka secara profesional. Sempurna untuk perkongsian media sosial dan perkhidmatan pengebumian.",
    homeHeroCreateButton: "Cipta Poster Anda",
    homeHeroExamplesButton: "Lihat Contoh",
    homeFeaturesTitle: "Mengapa Pilih Salam Takziah?",
    homeFeaturesSubtitle: "Alat profesional yang direka khas untuk poster takziah Islam",
    homeFeature1Title: "Mudah Digunakan",
    homeFeature1Desc: "Cipta poster takziah yang cantik dalam beberapa minit dengan antara muka intuitif kami",
    homeFeature2Title: "Sedia Media Sosial",
    homeFeature2Desc: "Dioptimumkan untuk format Instagram, Facebook, dan semua platform media sosial utama",
    homeFeature3Title: "Kualiti Tinggi",
    homeFeature3Desc: "Poster gred profesional dengan resolusi 4K dan tema premium",
    homePricingTitle: "Pilih Pelan Anda",
    homePricingSubtitle: "Mulakan secara percuma dan naik taraf mengikut keperluan anda. Semua pelan termasuk ciri teras kami.",
    homeTrialText: "Semua pelan termasuk percubaan percuma 14 hari untuk Premium dan Diamond",
    homeSavingsText: "Langganan tahunan jimat 17% • Batal bila-bila masa • Tiada yuran persediaan",
    homeCtaTitle: "Bersedia untuk Cipta Poster Pertama Anda?",
    homeCtaSubtitle: "Sertai beribu keluarga yang mempercayai Salam Takziah untuk keperluan memorial mereka",
    homeCtaButton: "Mulakan Mencipta Sekarang",
    homeFooterTagline: "Mencipta memorial yang bermakna dengan teknologi dan belas kasihan.",
    homeNavCreate: "Cipta Poster",
    homeNavTemplates: "Templat",
    homeNavPricing: "Harga",
    homeNavHelp: "Pusat Bantuan",
    homeNavContact: "Hubungi Kami",
    homeNavStatus: "Status",
    homeNavAbout: "Tentang",
    homeNavBlog: "Blog",
    homeNavPrivacy: "Privasi",
    homeNavProduct: "Produk",
    homeNavSupport: "Sokongan",
    homeNavCompany: "Syarikat",
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
    formatLabel: "📱 Poster Format",
    formatClassic: "Classic (4:3)",
    formatInstagramSquare: "Instagram - Square (1:1)",
    formatInstagramLandscape: "Instagram - Landscape (1.91:1)",
    formatInstagramPortrait: "Instagram - Portrait (4:5)",
    formatFacebook: "Facebook (1.91:1)",
    formatInstagramStory: "Instagram Story (9:16)",
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

    // Homepage translations
    homeHeroTitle: "Create Beautiful Condolence Posters",
    homeHeroSubtitle: "Honor loved ones with professionally designed Islamic condolence posters. Perfect for social media sharing and memorial services.",
    homeHeroCreateButton: "Create Your Poster",
    homeHeroExamplesButton: "View Examples",
    homeFeaturesTitle: "Why Choose Salam Takziah?",
    homeFeaturesSubtitle: "Professional tools designed specifically for Islamic condolence posters",
    homeFeature1Title: "Easy to Use",
    homeFeature1Desc: "Create beautiful condolence posters in minutes with our intuitive interface",
    homeFeature2Title: "Social Media Ready",
    homeFeature2Desc: "Optimized formats for Instagram, Facebook, and all major social platforms",
    homeFeature3Title: "High Quality",
    homeFeature3Desc: "Professional-grade posters with 4K resolution and premium themes",
    homePricingTitle: "Choose Your Plan",
    homePricingSubtitle: "Start free and upgrade as your needs grow. All plans include our core features.",
    homeTrialText: "All plans include a 14-day free trial for Premium and Diamond tiers",
    homeSavingsText: "Yearly subscriptions save 17% • Cancel anytime • No setup fees",
    homeCtaTitle: "Ready to Create Your First Poster?",
    homeCtaSubtitle: "Join thousands of families who trust Salam Takziah for their memorial needs",
    homeCtaButton: "Start Creating Now",
    homeFooterTagline: "Creating meaningful memorials with technology and compassion.",
    homeNavCreate: "Create Poster",
    homeNavTemplates: "Templates",
    homeNavPricing: "Pricing",
    homeNavHelp: "Help Center",
    homeNavContact: "Contact Us",
    homeNavStatus: "Status",
    homeNavAbout: "About",
    homeNavBlog: "Blog",
    homeNavPrivacy: "Privacy",
    homeNavProduct: "Product",
    homeNavSupport: "Support",
    homeNavCompany: "Company",
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
