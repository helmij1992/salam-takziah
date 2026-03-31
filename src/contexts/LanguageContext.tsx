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

interface HomeExampleTranslation {
  id: "family" | "community" | "corporate";
  label: string;
  title: string;
  description: string;
  fullName: string;
  organization: string;
  from: string;
  theme: "classic" | "retro" | "premium";
  format: "classic" | "instagram-square" | "facebook";
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
  themePremium: string;
  premiumTemplateLabel: string;
  premiumTemplateSignature: string;
  premiumTemplateOfficial: string;
  premiumTemplateOfficialLight: string;
  premiumTemplateOfficialNight: string;
  premiumTemplateOfficialEmerald: string;
  premiumTemplateHint: string;
  companyLogoLabel: string;
  companyLogoHint: string;
  formatLabel: string;
  formatClassic: string;
  formatInstagramSquare: string;
  formatInstagramLandscape: string;
  formatInstagramPortrait: string;
  formatFacebook: string;
  formatInstagramStory: string;
  generateButton: string;
  backToDashboard: string;
  
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
  homeExamplesTitle: string;
  homeExamplesSubtitle: string;
  homeExamplesUseButton: string;
  homeExamplesPreviewLabel: string;
  homePricingSummaryLabel: string;
  homePricingSummaryValue: string;
  homeExamplesSummaryValue: string;
  homeQualitySummaryValue: string;
  homeExamples: HomeExampleTranslation[];
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
  homeLoginButton: string;
  homeRegisterButton: string;
  homePlanPopularBadge: string;
  homePlans: HomePlanTranslation[];
  homeEnterpriseDialogTitle: string;
  homeEnterpriseDialogSubtitle: string;
  homeEnterpriseDialogIntro: string;
  homeEnterpriseDialogFeature1: string;
  homeEnterpriseDialogFeature2: string;
  homeEnterpriseDialogFeature3: string;
  homeEnterpriseDialogFeature4: string;
  homeEnterpriseDialogResponseLabel: string;
  homeEnterpriseDialogResponseValue: string;
  homeEnterpriseDialogPrimary: string;
  homeEnterpriseDialogSecondary: string;
  freeTierNoticeTitle: string;
  freeTierNoticeDescription: string;
  freeTierRemaining: string;
  freeTierLimitReached: string;
  freeTierClassicOnly: string;
  freeTierBasicFieldsOnly: string;
  freeTierWatermarkNotice: string;
  freeTierMessageLocked: string;
  freeTierOrganizationLocked: string;
  freeTierFromLocked: string;
  freeTierDownloadNotice: string;
  premiumTierNoticeTitle: string;
  premiumTierNoticeDescription: string;
  premiumTierExportNotice: string;
  premiumTierThemeNotice: string;
  diamondTierNoticeTitle: string;
  diamondTierNoticeDescription: string;
  diamondTierWhiteLabelLabel: string;
  diamondTierWhiteLabelDescription: string;
  diamondTierOrgTemplateNotice: string;
  diamondTierShareNotice: string;
  sharePosterButton: string;
  sharePosterUnsupported: string;
  downloadPngButton: string;
  dashboardPlanLabel: string;
  dashboardPlanFree: string;
  dashboardPlanPremium: string;
  dashboardPlanDiamond: string;
  dashboardPlanSuperadmin: string;
  dashboardFeaturesLabel: string;
  dashboardEnterprisePendingLabel: string;
  authBrandTagline: string;
  authShellHeadline: string;
  authShellSubtitle: string;
  authHighlightSecurityTitle: string;
  authHighlightSecurityDesc: string;
  authHighlightMemorialTitle: string;
  authHighlightMemorialDesc: string;
  authHighlightResumeTitle: string;
  authHighlightResumeDesc: string;
  authLoginEyebrow: string;
  authLoginTitle: string;
  authLoginSubtitle: string;
  authLoginEmailLabel: string;
  authLoginEmailPlaceholder: string;
  authLoginPasswordLabel: string;
  authLoginPasswordPlaceholder: string;
  authLoginPasswordHint: string;
  authLoginRedirectHint: string;
  authLoginButton: string;
  authLoginLoading: string;
  authLoginSwitchPrompt: string;
  authLoginSwitchLabel: string;
  authRegisterEyebrow: string;
  authRegisterTitle: string;
  authRegisterSubtitle: string;
  authRegisterEmailLabel: string;
  authRegisterEmailPlaceholder: string;
  authRegisterPasswordLabel: string;
  authRegisterPasswordPlaceholder: string;
  authRegisterPasswordHint: string;
  authRegisterConfirmLabel: string;
  authRegisterConfirmPlaceholder: string;
  authRegisterPlanHint: string;
  authRegisterButton: string;
  authRegisterLoading: string;
  authRegisterSwitchPrompt: string;
  authRegisterSwitchLabel: string;
  authOrDivider: string;
  authGoogleButton: string;
  authGoogleLoading: string;
  authGoogleErrorTitle: string;
  authGoogleErrorDesc: string;
  authRateLimitTitle: string;
  authRateLimitDesc: string;
  authToastMissingLoginTitle: string;
  authToastMissingLoginDesc: string;
  authToastLoginFailedTitle: string;
  authToastLoginSuccessTitle: string;
  authToastLoginSuccessDesc: string;
  authToastMissingRegisterTitle: string;
  authToastMissingRegisterDesc: string;
  authToastPasswordMismatchTitle: string;
  authToastPasswordMismatchDesc: string;
  authToastRegisterFailedTitle: string;
  authToastRegisterSuccessTitle: string;
  authToastRegisterSuccessDesc: string;
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
    themePremium: "Premium",
    premiumTemplateLabel: "🏛️ Templat Premium",
    premiumTemplateSignature: "Premium Signature",
    premiumTemplateOfficial: "Premium Rasmi Dengan Logo",
    premiumTemplateOfficialLight: "Rasmi Cerah",
    premiumTemplateOfficialNight: "Rasmi Gelap",
    premiumTemplateOfficialEmerald: "Rasmi Zamrud",
    premiumTemplateHint: "Pilih gaya premium standard atau salah satu templat rasmi dengan logo organisasi di bahagian atas.",
    companyLogoLabel: "🏢 Logo Organisasi",
    companyLogoHint: "Logo ini akan dipaparkan di bahagian atas untuk templat rasmi Premium.",
    formatLabel: "📱 Format Poster",
    formatClassic: "Klasik (4:3)",
    formatInstagramSquare: "Instagram - Kuasa (1:1)",
    formatInstagramLandscape: "Instagram - Mendatar (1.91:1)",
    formatInstagramPortrait: "Instagram - Tegak (4:5)",
    formatFacebook: "Facebook (1.91:1)",
    formatInstagramStory: "Instagram Story (9:16)",
    generateButton: "🎨 Jana Poster",
    backToDashboard: "Kembali ke Dashboard",
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
    homeHeroTitle: "Abadikan Kenangan, Ciptakan Penghormatan Terakhir",
    homeHeroSubtitle: "Adapun pemergian insan yang dikasihi meninggalkan kenangan yang tiada terperi. Maka diiringi dengan doa yang tulus, moga Allah mencucuri rahmat ke atas rohnya. Sebagai tanda kasih dan ingatan yang akhir adanya.",
    homeHeroCreateButton: "Cipta Poster Anda",
    homeHeroExamplesButton: "Lihat Contoh",
    homeExamplesTitle: "Contoh Poster Yang Boleh Anda Mulakan",
    homeExamplesSubtitle: "Pilih gaya memorial yang sesuai dengan keluarga, komuniti, atau organisasi anda, kemudian terus sunting dalam pembina poster.",
    homeExamplesUseButton: "Guna Contoh Ini",
    homeExamplesPreviewLabel: "Pratonton gaya",
    homeExamples: [
      {
        id: "family",
        label: "Keluarga",
        title: "Takziah Klasik Untuk Keluarga",
        description: "Sesuai untuk waris terdekat yang mahukan susun atur tenang, kemas, dan penuh hormat.",
        fullName: "Allahyarham Haji Abdul Rahman bin Ismail",
        organization: "Kampung Seri Damai",
        from: "Daripada seluruh ahli keluarga",
        theme: "classic",
        format: "classic",
      },
      {
        id: "community",
        label: "Komuniti",
        title: "Memorial Retro Untuk Masjid & Komuniti",
        description: "Pilihan yang lebih hangat untuk pengumuman jemaah, persatuan, dan komuniti setempat.",
        fullName: "Almarhumah Puan Hajah Zainab binti Salleh",
        organization: "Masjid Al-Ikhlas, Shah Alam",
        from: "AJK Masjid dan komuniti setempat",
        theme: "retro",
        format: "instagram-square",
      },
      {
        id: "corporate",
        label: "Organisasi",
        title: "Penghormatan Premium Untuk Organisasi",
        description: "Untuk sekolah, syarikat, atau institusi yang perlukan pengumuman memorial yang lebih formal.",
        fullName: "Allahyarham Professor Dato' Dr. Mohd Firdaus",
        organization: "Universiti Wawasan Malaysia",
        from: "Pejabat Naib Canselor",
        theme: "premium",
        format: "facebook",
      },
    ],
    homePricingSummaryLabel: "Pelan tersedia",
    homePricingSummaryValue: "2 pelan",
    homeExamplesSummaryValue: "3 gaya",
    homeQualitySummaryValue: "HD hingga 4K",
    homeFeaturesTitle: "Mengapa Pilih Salam Takziah?",
    homeFeaturesSubtitle: "Alat profesional yang direka khas untuk poster takziah Islam",
    homeFeature1Title: "Mudah Digunakan",
    homeFeature1Desc: "Cipta poster takziah yang cantik dalam beberapa minit dengan antara muka intuitif kami",
    homeFeature2Title: "Ciri Malaysia & Islamik",
    homeFeature2Desc: "Termasuk elemen batik, motif Melayu dan reka bentuk khat bagi gaya lokal yang berkarakter",
    homeFeature3Title: "Resolusi Tinggi",
    homeFeature3Desc: "Poster berkualiti profesional dengan resolusi tinggi dan tema premium",
    homePricingTitle: "Pilih Pelan Anda",
    homePricingSubtitle: "Mulakan secara percuma dan naik taraf mengikut keperluan anda. Semua pelan termasuk ciri teras kami.",
    homeTrialText: "Pelan Premium termasuk percubaan percuma 14 hari",
    homeSavingsText: "Langganan tahunan jimat 17% • Batal bila-bila masa • Tiada yuran persediaan",
    homeCtaTitle: "Bersedia untuk Cipta Poster Pertama Anda?",
    homeCtaSubtitle: "Sertai beribu keluarga yang mempercayai Salam Takziah untuk keperluan memorial mereka",
    homeCtaButton: "Mulakan Mencipta Sekarang",
    homeFooterTagline: "Maka tersebutlah kisah dan memori, diabadikan dengan daya cipta serta belas hati yang mendalam.",
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
    homeLoginButton: "Log Masuk",
    homeRegisterButton: "Daftar",

    homePlanPopularBadge: "Paling Popular",
    homePlans: [
      {
        id: "basic",
        name: "Basic Memorial",
        tier: "Free",
        price: "RM 0",
        period: "selamanya",
        description: "Sesuai untuk pengguna kasual dan pencipta kali pertama",
        features: [
          "5 poster sebulan",
          "Classic (4:3) & Instagram Story (9:16)",
          "Tema asas (Classic & Retro)",
          "Resolusi standard (1080p)",
          "Muat naik foto & grayscale",
          "Medan borang asas",
          "Doa Islamik standard",
          "Muat turun dengan watermark",
          "Sokongan asas (FAQ)",
        ],
        buttonText: "Mula Percuma",
        popular: false,
      },
      {
        id: "pro",
        name: "Premium Memorial",
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
    ],
    homeEnterpriseDialogTitle: "Pasukan Enterprise Salam Takziah",
    homeEnterpriseDialogSubtitle: "Pakej Diamond sesuai untuk rumah pengebumian, organisasi besar, dan pasukan yang perlukan aliran kerja memorial yang lebih tersusun.",
    homeEnterpriseDialogIntro: "Kami bantu anda merancang onboarding, white-label branding, templat organisasi, dan keperluan operasi sebelum pelan Enterprise diaktifkan.",
    homeEnterpriseDialogFeature1: "Semakan keperluan organisasi dan aliran kerja semasa",
    homeEnterpriseDialogFeature2: "Cadangan setup white-label, templat, dan struktur pasukan",
    homeEnterpriseDialogFeature3: "Panduan migrasi dari proses manual ke dashboard memorial",
    homeEnterpriseDialogFeature4: "Susun demo ringkas untuk pasukan anda sebelum langganan bermula",
    homeEnterpriseDialogResponseLabel: "Jangkaan respons",
    homeEnterpriseDialogResponseValue: "Biasanya dalam 1 hari bekerja",
    homeEnterpriseDialogPrimary: "Daftar untuk Dihubungi",
    homeEnterpriseDialogSecondary: "Saya Sudah Ada Akaun",
    freeTierNoticeTitle: "Akses Pelan Free",
    freeTierNoticeDescription: "Pelan Free membenarkan jana poster tanpa had, tetapi muat turun dihadkan kepada 5 poster sebulan dengan format Classic dan Instagram Story, medan asas, dan tanda air.",
    freeTierRemaining: "Baki muat turun bulan ini: {count}/5",
    freeTierLimitReached: "Had 5 muat turun poster sebulan untuk pelan Free telah digunakan. Naik taraf untuk terus memuat turun poster.",
    freeTierClassicOnly: "Pelan Free menyokong format Classic (4:3) dan Instagram Story (9:16) sahaja.",
    freeTierBasicFieldsOnly: "Pelan Free hanya menyokong medan asas dan doa standard.",
    freeTierWatermarkNotice: "Muat turun pelan Free akan disertakan tanda air Salam Takziah.",
    freeTierMessageLocked: "Ucapan tersuai tersedia untuk pelan berbayar. Pelan Free menggunakan doa standard.",
    freeTierOrganizationLocked: "Medan organisasi tersedia untuk pelan berbayar.",
    freeTierFromLocked: "Medan 'Daripada' tersedia untuk pelan berbayar.",
    freeTierDownloadNotice: "Pelan Free memuat turun poster dengan tanda air.",
    premiumTierNoticeTitle: "Akses Pelan Premium",
    premiumTierNoticeDescription: "Pelan Premium membuka semua format sosial, tema premium, ucapan tersuai, output resolusi tinggi, dan muat turun tanpa tanda air.",
    premiumTierExportNotice: "Pelan Premium menyokong eksport JPEG dan PNG tanpa tanda air.",
    premiumTierThemeNotice: "Tema Premium termasuk gaya visual yang lebih mewah dengan corak lembut.",
    diamondTierNoticeTitle: "Akses Pelan Premium",
    diamondTierNoticeDescription: "Ciri Diamond atau Enterprise lama tidak lagi ditawarkan. Akaun lama kini menggunakan akses Premium.",
    diamondTierWhiteLabelLabel: "White-label branding",
    diamondTierWhiteLabelDescription: "Sembunyikan penjenamaan Salam Takziah untuk kegunaan organisasi anda.",
    diamondTierOrgTemplateNotice: "Tetapan organisasi lanjutan daripada pelan lama tidak lagi ditawarkan pada platform semasa.",
    diamondTierShareNotice: "Perkongsian poster terus bergantung pada sokongan peranti dan pelan semasa.",
    sharePosterButton: "Kongsi Poster",
    sharePosterUnsupported: "Perkongsian terus tidak disokong pada peranti ini. Sila muat turun poster dahulu.",
    downloadPngButton: "Muat Turun sebagai PNG",
    dashboardPlanLabel: "Pelan Semasa",
    dashboardPlanFree: "Free",
    dashboardPlanPremium: "Premium",
    dashboardPlanDiamond: "Premium",
    dashboardPlanSuperadmin: "Superadmin",
    dashboardFeaturesLabel: "Ciri Aktif",
    dashboardEnterprisePendingLabel: "Ciri Enterprise Lanjutan",
    authBrandTagline: "Ruang kerja memorial",
    authShellHeadline: "Cipta poster takziah dengan penuh hormat, dan sambung semula kerja anda bila-bila masa.",
    authShellSubtitle: "Log masuk untuk mengakses draf tersimpan, kerjasama pasukan, pautan jemputan, analitik, dan aliran kerja memorial anda di satu tempat yang selamat.",
    authHighlightSecurityTitle: "Akses akaun yang selamat",
    authHighlightSecurityDesc: "Draf, data ruang kerja, dan tetapan memorial anda kekal terikat pada akaun anda.",
    authHighlightMemorialTitle: "Direka untuk memorial yang bermakna",
    authHighlightMemorialDesc: "Cipta poster takziah yang sopan dan tersusun untuk keluarga serta organisasi.",
    authHighlightResumeTitle: "Sambung dari tempat terakhir",
    authHighlightResumeDesc: "Teruskan draf, batch, dan aliran kerja pasukan anda dari mana-mana sesi yang telah log masuk.",
    authLoginEyebrow: "Selamat kembali",
    authLoginTitle: "Log Masuk Salam Takziah",
    authLoginSubtitle: "Log masuk untuk sambung pembina poster, draf tersimpan, dan alat ruang kerja anda.",
    authLoginEmailLabel: "Alamat emel",
    authLoginEmailPlaceholder: "anda@contoh.com",
    authLoginPasswordLabel: "Kata laluan",
    authLoginPasswordPlaceholder: "Masukkan kata laluan anda",
    authLoginPasswordHint: "Minimum 8 aksara",
    authLoginRedirectHint: "Anda akan kembali ke ruang kerja selepas log masuk, termasuk halaman yang anda cuba buka tadi.",
    authLoginButton: "Log Masuk untuk Teruskan",
    authLoginLoading: "Sedang log masuk...",
    authLoginSwitchPrompt: "Belum ada akaun lagi?",
    authLoginSwitchLabel: "Cipta akaun di sini",
    authRegisterEyebrow: "Cipta akaun anda",
    authRegisterTitle: "Daftar Salam Takziah",
    authRegisterSubtitle: "Sediakan akaun anda untuk simpan draf, urus pelan, dan bekerjasama dalam kerja memorial.",
    authRegisterEmailLabel: "Alamat emel",
    authRegisterEmailPlaceholder: "anda@contoh.com",
    authRegisterPasswordLabel: "Kata laluan",
    authRegisterPasswordPlaceholder: "Cipta kata laluan yang kuat",
    authRegisterPasswordHint: "Gunakan sekurang-kurangnya 8 aksara",
    authRegisterConfirmLabel: "Sahkan kata laluan",
    authRegisterConfirmPlaceholder: "Ulang kata laluan anda",
    authRegisterPlanHint: "Akaun baru bermula dengan pelan Free dan boleh dinaik taraf kemudian apabila anda perlukan lebih banyak format, draf, dan ciri kolaborasi.",
    authRegisterButton: "Cipta Akaun",
    authRegisterLoading: "Sedang mencipta akaun...",
    authRegisterSwitchPrompt: "Sudah ada akaun?",
    authRegisterSwitchLabel: "Log masuk di sini",
    authOrDivider: "atau",
    authGoogleButton: "Teruskan dengan Google",
    authGoogleLoading: "Mengarahkan ke Google...",
    authGoogleErrorTitle: "Google SSO gagal",
    authGoogleErrorDesc: "Semak tetapan Google provider dan URL redirect di Supabase.",
    authRateLimitTitle: "Terlalu banyak cubaan",
    authRateLimitDesc: "Sila tunggu {time} sebelum mencuba lagi.",
    authToastMissingLoginTitle: "Sila isi emel dan kata laluan",
    authToastMissingLoginDesc: "Emel dan kata laluan diperlukan untuk log masuk.",
    authToastLoginFailedTitle: "Log masuk gagal",
    authToastLoginSuccessTitle: "Berjaya",
    authToastLoginSuccessDesc: "Selamat datang kembali, {email}",
    authToastMissingRegisterTitle: "Sila isi semua medan",
    authToastMissingRegisterDesc: "Emel, kata laluan dan pengesahan kata laluan diperlukan.",
    authToastPasswordMismatchTitle: "Kata laluan tidak sepadan",
    authToastPasswordMismatchDesc: "Sila pastikan kata laluan dan pengesahan adalah sama.",
    authToastRegisterFailedTitle: "Pendaftaran gagal",
    authToastRegisterSuccessTitle: "Daftar berjaya",
    authToastRegisterSuccessDesc: "Sila semak emel {email} untuk pautan pengesahan.",
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
    themePremium: "Premium",
    premiumTemplateLabel: "🏛️ Premium Template",
    premiumTemplateSignature: "Premium Signature",
    premiumTemplateOfficial: "Official Premium With Logo",
    premiumTemplateOfficialLight: "Official Light",
    premiumTemplateOfficialNight: "Official Night",
    premiumTemplateOfficialEmerald: "Official Emerald",
    premiumTemplateHint: "Choose the standard premium style or one of the official templates with your organization logo at the top.",
    companyLogoLabel: "🏢 Organization Logo",
    companyLogoHint: "This logo appears at the top when using the Premium official template.",
    formatLabel: "📱 Poster Format",
    formatClassic: "Classic (4:3)",
    formatInstagramSquare: "Instagram - Square (1:1)",
    formatInstagramLandscape: "Instagram - Landscape (1.91:1)",
    formatInstagramPortrait: "Instagram - Portrait (4:5)",
    formatFacebook: "Facebook (1.91:1)",
    formatInstagramStory: "Instagram Story (9:16)",
    generateButton: "🎨 Generate Poster",
    backToDashboard: "Back to Dashboard",
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
    homeExamplesTitle: "Sample Memorial Poster Styles You Can Start With",
    homeExamplesSubtitle: "Choose a family, community, or organization-ready example, then open it directly in the poster builder.",
    homeExamplesUseButton: "Use This Example",
    homeExamplesPreviewLabel: "Style gallery",
    homePricingSummaryLabel: "Available plans",
    homePricingSummaryValue: "2 plans",
    homeExamplesSummaryValue: "3 styles",
    homeQualitySummaryValue: "HD to 4K",
    homeExamples: [
      {
        id: "family",
        label: "Family",
        title: "Classic Family Memorial",
        description: "A calm and respectful layout for close family announcements and private remembrance posts.",
        fullName: "Allahyarham Haji Abdul Rahman bin Ismail",
        organization: "Seri Damai Community",
        from: "From the entire family",
        theme: "classic",
        format: "classic",
      },
      {
        id: "community",
        label: "Community",
        title: "Warm Community Memorial",
        description: "Well-suited for mosque notices, neighborhood groups, and community association tributes.",
        fullName: "Almarhumah Puan Hajah Zainab binti Salleh",
        organization: "Masjid Al-Ikhlas, Shah Alam",
        from: "From the mosque committee and local community",
        theme: "retro",
        format: "instagram-square",
      },
      {
        id: "corporate",
        label: "Organization",
        title: "Premium Organizational Tribute",
        description: "A more formal memorial style for schools, companies, and institutional announcements.",
        fullName: "Allahyarham Professor Dato' Dr. Mohd Firdaus",
        organization: "Wawasan University Malaysia",
        from: "Office of the Vice Chancellor",
        theme: "premium",
        format: "facebook",
      },
    ],
    homeFeaturesTitle: "Why Choose Salam Takziah?",
    homeFeaturesSubtitle: "Professional tools designed specifically for Islamic condolence posters",
    homeFeature1Title: "Easy to Use",
    homeFeature1Desc: "Create beautiful condolence posters in minutes with our intuitive interface",
    homeFeature2Title: "Malaysia & Islamic Style",
    homeFeature2Desc: "Includes batik accents, Malay motifs and Arabic calligraphy-ready layouts",
    homeFeature3Title: "High Resolution",
    homeFeature3Desc: "Professional-quality posters with high-resolution output and premium themes",
    homePricingTitle: "Choose Your Plan",
    homePricingSubtitle: "Start free and upgrade as your needs grow. All plans include our core features.",
    homeTrialText: "Premium includes a 14-day free trial",
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
    homeLoginButton: "Login",
    homeRegisterButton: "Register",

    homePlanPopularBadge: "Most Popular",
    homePlans: [
      {
        id: "basic",
        name: "Basic Memorial",
        tier: "Free",
        price: "RM 0",
        period: "selamanya",
        description: "Sesuai untuk pengguna kasual dan pencipta kali pertama",
        features: [
          "5 posters per month",
          "Classic (4:3) & Instagram Story (9:16)",
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
        name: "Premium Memorial",
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
    ],
    homeEnterpriseDialogTitle: "Salam Takziah Enterprise Team",
    homeEnterpriseDialogSubtitle: "The Diamond package is built for funeral homes, larger organizations, and teams that need a more structured memorial workflow.",
    homeEnterpriseDialogIntro: "We’ll help you plan onboarding, white-label branding, organization templates, and operational needs before Enterprise access is activated.",
    homeEnterpriseDialogFeature1: "Review your organization’s needs and current workflow",
    homeEnterpriseDialogFeature2: "Recommend white-label setup, templates, and team structure",
    homeEnterpriseDialogFeature3: "Guide your move from manual processes into the memorial dashboard",
    homeEnterpriseDialogFeature4: "Arrange a short demo for your team before subscription starts",
    homeEnterpriseDialogResponseLabel: "Expected response",
    homeEnterpriseDialogResponseValue: "Usually within 1 business day",
    homeEnterpriseDialogPrimary: "Register for Contact",
    homeEnterpriseDialogSecondary: "I Already Have an Account",
    freeTierNoticeTitle: "Free Plan Access",
    freeTierRemaining: "Downloads remaining this month: {count}/5",
    freeTierLimitReached: "You have reached the Free plan limit of 5 poster downloads this month. Upgrade to keep downloading posters.",
    freeTierNoticeDescription: "The Free plan lets you generate posters freely, but downloads are limited to 5 posters per month with Classic and Instagram Story formats, basic fields, and watermarked downloads.",
    freeTierClassicOnly: "The Free plan supports Classic (4:3) and Instagram Story (9:16) formats only.",
    freeTierBasicFieldsOnly: "The Free plan only supports basic form fields and standard prayers.",
    freeTierWatermarkNotice: "Free plan downloads include a Salam Takziah watermark.",
    freeTierMessageLocked: "Custom condolence messages are available on paid plans. The Free plan uses the standard prayer.",
    freeTierOrganizationLocked: "The organization field is available on paid plans.",
    freeTierFromLocked: "The 'From' field is available on paid plans.",
    freeTierDownloadNotice: "The Free plan downloads posters with a watermark.",
    premiumTierNoticeTitle: "Premium Plan Access",
    premiumTierNoticeDescription: "The Premium plan unlocks all social formats, premium themes, custom messages, high-resolution output, and downloads without watermarks.",
    premiumTierExportNotice: "The Premium plan supports both JPEG and PNG exports without watermarks.",
    premiumTierThemeNotice: "Premium themes include a more elevated visual style with subtle patterns.",
    diamondTierNoticeTitle: "Premium Plan Access",
    diamondTierNoticeDescription: "Legacy Diamond or Enterprise features are no longer offered. Older accounts now use Premium access.",
    diamondTierWhiteLabelLabel: "White-label branding",
    diamondTierWhiteLabelDescription: "Hide Salam Takziah branding for your organization-facing materials.",
    diamondTierOrgTemplateNotice: "Legacy organization-specific layout features are no longer offered on the current platform.",
    diamondTierShareNotice: "Direct poster sharing depends on device support and the current plan.",
    sharePosterButton: "Share Poster",
    sharePosterUnsupported: "Direct sharing is not supported on this device. Please download the poster first.",
    downloadPngButton: "Download as PNG",
    dashboardPlanLabel: "Current Plan",
    dashboardPlanFree: "Free",
    dashboardPlanPremium: "Premium",
    dashboardPlanDiamond: "Premium",
    dashboardPlanSuperadmin: "Superadmin",
    dashboardFeaturesLabel: "Active Features",
    dashboardEnterprisePendingLabel: "Advanced Enterprise Features",
    authBrandTagline: "Memorial workspace",
    authShellHeadline: "Compassionate poster creation, with your workspace ready when you are.",
    authShellSubtitle: "Sign in to access saved drafts, team collaboration, invite links, analytics, and your memorial workflow in one secure place.",
    authHighlightSecurityTitle: "Secure account access",
    authHighlightSecurityDesc: "Your drafts, workspace data, and memorial settings stay tied to your account.",
    authHighlightMemorialTitle: "Designed for meaningful memorials",
    authHighlightMemorialDesc: "Create respectful condolence posters with layouts that suit families and organizations.",
    authHighlightResumeTitle: "Pick up where you left off",
    authHighlightResumeDesc: "Continue editing drafts, batches, and team workflows from any signed-in session.",
    authLoginEyebrow: "Welcome back",
    authLoginTitle: "Login Salam Takziah",
    authLoginSubtitle: "Sign in to continue your poster builder, saved drafts, and workspace tools.",
    authLoginEmailLabel: "Email address",
    authLoginEmailPlaceholder: "you@example.com",
    authLoginPasswordLabel: "Password",
    authLoginPasswordPlaceholder: "Enter your password",
    authLoginPasswordHint: "Minimum 8 characters",
    authLoginRedirectHint: "You’ll return to your workspace after login, including the page you originally tried to open.",
    authLoginButton: "Login to Continue",
    authLoginLoading: "Signing in...",
    authLoginSwitchPrompt: "Don't have an account yet?",
    authLoginSwitchLabel: "Create one here",
    authRegisterEyebrow: "Create your account",
    authRegisterTitle: "Register Salam Takziah",
    authRegisterSubtitle: "Set up your account to save drafts, manage your plan, and collaborate on memorial work.",
    authRegisterEmailLabel: "Email address",
    authRegisterEmailPlaceholder: "you@example.com",
    authRegisterPasswordLabel: "Password",
    authRegisterPasswordPlaceholder: "Create a strong password",
    authRegisterPasswordHint: "Use at least 8 characters",
    authRegisterConfirmLabel: "Confirm password",
    authRegisterConfirmPlaceholder: "Repeat your password",
    authRegisterPlanHint: "New accounts start on the Free plan and can upgrade later when you need more formats, drafts, and collaboration features.",
    authRegisterButton: "Create Account",
    authRegisterLoading: "Creating account...",
    authRegisterSwitchPrompt: "Already have an account?",
    authRegisterSwitchLabel: "Login instead",
    authOrDivider: "or",
    authGoogleButton: "Continue with Google",
    authGoogleLoading: "Redirecting to Google...",
    authGoogleErrorTitle: "Google SSO failed",
    authGoogleErrorDesc: "Check your Google provider and redirect URL settings in Supabase.",
    authRateLimitTitle: "Too many attempts",
    authRateLimitDesc: "Please wait {time} before trying again.",
    authToastMissingLoginTitle: "Please enter your email and password",
    authToastMissingLoginDesc: "Email and password are required to sign in.",
    authToastLoginFailedTitle: "Login failed",
    authToastLoginSuccessTitle: "Success",
    authToastLoginSuccessDesc: "Welcome back, {email}",
    authToastMissingRegisterTitle: "Please fill in all fields",
    authToastMissingRegisterDesc: "Email, password, and password confirmation are required.",
    authToastPasswordMismatchTitle: "Passwords do not match",
    authToastPasswordMismatchDesc: "Please make sure the password and confirmation match.",
    authToastRegisterFailedTitle: "Registration failed",
    authToastRegisterSuccessTitle: "Registration successful",
    authToastRegisterSuccessDesc: "Please check {email} for the verification link.",
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
