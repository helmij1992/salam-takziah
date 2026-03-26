import { createContext, useContext, useState, ReactNode } from "react";

export type Language = "ms" | "en";
type HomePlanId = "basic" | "pro" | "enterprise";

interface HomePlanTranslation {
  id: HomePlanId;
  name: string;
  tier: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  buttonText: string;
  popular: boolean;
}

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
  homePlanPopularBadge: string;
  homePlans: HomePlanTranslation[];
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
    homeHeroTitle: "Cipta Poster Takziah sebagai Tanda Penghormatan",
    homeHeroSubtitle: "Pemergian insan tersayang meninggalkan kenangan dan kerinduan yang mendalam. Iringi pemergiannya dengan doa yang tulus, semoga Allah mencucuri rahmat ke atas rohnya dan menempatkannya dalam kalangan orang beriman. Sebagai tanda kasih, ingatan dan penghormatan terakhir.",
    homeHeroCreateButton: "Cipta Poster Anda",
    homeHeroExamplesButton: "Lihat Contoh",
    homeFeaturesTitle: "Mengapa Pilih Salam Takziah?",
    homeFeaturesSubtitle: "Alat profesional yang direka khas untuk poster takziah Islam",
    homeFeature1Title: "Mudah Digunakan",
    homeFeature1Desc: "Cipta poster takziah yang cantik dalam beberapa minit dengan antara muka intuitif kami",
    homeFeature2Title: "Ciri Malaysia & Islamik",
    homeFeature2Desc: "Termasuk elemen batik, motif Melayu dan reka bentuk khat bagi gaya lokal yang berkarakter",
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

    homePlanPopularBadge: "Paling Popular",
    homePlans: [
      {
        id: "basic",
        name: "Basic Memorial",
        tier: "Percuma",
        price: "RM 0",
        period: "selamanya",
        description: "Sesuai untuk pengguna kasual dan pencipta kali pertama",
        features: [
          "5 poster sebulan",
          "Format klasik (4:3)",
          "Tema asas (Klasik & Retro)",
          "Resolusi standard (1080p)",
          "Muat naik gambar & skala kelabu",
          "Medan borang asas",
          "Doa Islamik standard",
          "Muat turun dengan tanda air",
          "Sokongan asas (FAQ)",
        ],
        buttonText: "Mula Percuma",
        popular: false,
      },
      {
        id: "pro",
        name: "Professional Memorial",
        tier: "Premium",
        price: "RM 39.90",
        period: "sebulan",
        description: "Untuk pengguna biasa, keluarga, dan organisasi kecil",
        features: [
          "Semua dalam Percuma +",
          "Poster tanpa had",
          "Semua format media sosial",
          "Tema premium & corak",
          "Resolusi tinggi (4K)",
          "Ucapan takziah tersuai",
          "Pengubahsuaian lanjutan",
          "Ciptaan berkumpulan (sehingga 10)",
          "Simpanan awan & draf",
          "Sokongan e-mel keutamaan",
          "Buang tanda air",
          "Pelbagai format eksport",
        ],
        buttonText: "Mula Percubaan Premium",
        popular: true,
      },
      {
        id: "enterprise",
        name: "Enterprise Memorial",
        tier: "Diamond",
        price: "RM 99.90",
        period: "sebulan",
        description: "Untuk rumah pengebumian dan organisasi besar",
        features: [
          "Semua dalam Premium +",
          "Penjenamaan tanpa logo",
          "Templat organisasi tersuai",
          "Akses API & integrasi",
          "Analitik lanjutan",
          "Pemprosesan berkumpulan tanpa had",
          "Sokongan telefon 24/7",
          "Khat Arab tersuai",
          "Penciptaan memorial video",
          "Sokongan pelbagai bahasa",
          "Kerjasama pasukan",
          "Ciri perkongsian lanjutan",
        ],
        buttonText: "Hubungi Jualan",
        popular: false,
      },
    ],
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
    homeFeature2Title: "Malaysia & Islamic Style",
    homeFeature2Desc: "Includes batik accents, Malay motifs and Arabic calligraphy-ready layouts",
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

    homePlanPopularBadge: "Most Popular",
    homePlans: [
      {
        id: "basic",
        name: "Basic Memorial",
        tier: "Free",
        price: "RM 0",
        period: "forever",
        description: "Best for casual users and first-time creators",
        features: [
          "5 posters per month",
          "Classic format (4:3)",
          "Basic themes (Classic & Retro)",
          "Standard resolution (1080p)",
          "Photo upload & grayscale",
          "Basic form fields",
          "Standard Islamic prayers",
          "Watermarked downloads",
          "Basic support (FAQ)",
        ],
        buttonText: "Get Started Free",
        popular: false,
      },
      {
        id: "pro",
        name: "Professional Memorial",
        tier: "Premium",
        price: "RM 39.90",
        period: "month",
        description: "For regular users, families, and small organizations",
        features: [
          "Everything in Free +",
          "Unlimited posters",
          "All social media formats",
          "Premium themes & patterns",
          "High-resolution (4K)",
          "Custom condolence messages",
          "Advanced customization",
          "Batch creation (up to 10)",
          "Cloud storage & drafts",
          "Priority email support",
          "Remove watermarks",
          "Multiple export formats",
        ],
        buttonText: "Start Premium Trial",
        popular: true,
      },
      {
        id: "enterprise",
        name: "Enterprise Memorial",
        tier: "Diamond",
        price: "RM 99.90",
        period: "month",
        description: "For funeral homes and larger organizations",
        features: [
          "Everything in Premium +",
          "White-label branding",
          "Custom organization templates",
          "API access & integrations",
          "Advanced analytics",
          "Unlimited batch processing",
          "24/7 phone support",
          "Custom Arabic calligraphy",
          "Video memorial creation",
          "Multi-language support",
          "Team collaboration",
          "Advanced sharing features",
        ],
        buttonText: "Contact Sales",
        popular: false,
      },
    ],
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
