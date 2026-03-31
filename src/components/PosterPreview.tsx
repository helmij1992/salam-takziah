import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PosterData } from "@/types/poster";
import { Download } from "lucide-react";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface PosterPreviewProps {
  data: PosterData | null;
  isFreeTier: boolean;
  isPaidTier: boolean;
  isDiamondTier: boolean;
  onDownload?: (data: PosterData, fileType: "jpeg" | "png") => boolean | Promise<boolean>;
}

const PosterPreview = ({ data, isFreeTier, isPaidTier, isDiamondTier, onDownload }: PosterPreviewProps) => {
  const { t, language } = useLanguage();
  const posterRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [grayscalePhoto, setGrayscalePhoto] = useState<string | null>(null);

  // Define aspect ratios and dimensions for each format
  const formatConfig = {
    classic: { aspectRatio: "4/3", minHeight: "600px", maxHeight: "800px", photoSize: "w-32 h-32 md:w-40 md:h-40" },
    "instagram-square": { aspectRatio: "1/1", minHeight: "500px", maxHeight: "600px", photoSize: "w-24 h-24 md:w-32 md:h-32" },
    "instagram-landscape": { aspectRatio: "1.91/1", minHeight: "400px", maxHeight: "500px", photoSize: "w-20 h-20 md:w-28 md:h-28" },
    "instagram-portrait": { aspectRatio: "4/5", minHeight: "600px", maxHeight: "750px", photoSize: "w-28 h-28 md:w-36 md:h-36" },
    facebook: { aspectRatio: "1.91/1", minHeight: "400px", maxHeight: "500px", photoSize: "w-20 h-20 md:w-28 md:h-28" },
    "instagram-story": { aspectRatio: "9/16", minHeight: "820px", maxHeight: "1120px", photoSize: "w-44 h-44 md:w-60 md:h-60" },
  };

  const currentFormat = data?.format || "classic";
  const config = formatConfig[currentFormat as keyof typeof formatConfig] || formatConfig.classic;

  useEffect(() => {
    if (data?.photo) {
      convertToGrayscale(data.photo);
    }
  }, [data?.photo]);

  const convertToGrayscale = (imageSrc: string) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg;
        data[i + 1] = avg;
        data[i + 2] = avg;
      }

      ctx.putImageData(imageData, 0, 0);
      setGrayscalePhoto(canvas.toDataURL());
    };
    img.src = imageSrc;
  };

  const handleDownload = async (type: "jpeg" | "png") => {
    if (!posterRef.current || !data) return;

    setIsDownloading(true);
    try {
      const canvas = await html2canvas(posterRef.current, {
        scale: isFreeTier ? 1.35 : 2,
        backgroundColor: "#0a0a0a",
        logging: false,
      });

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, type === "png" ? "image/png" : "image/jpeg", type === "png" ? undefined : 0.95);
      });

      if (!blob) {
        toast.error(language === "ms" ? "Gagal menjana poster." : "Failed to generate poster.");
        return;
      }

      if (onDownload) {
        const canProceed = await onDownload(data, type);
        if (!canProceed) {
          toast.error(language === "ms" ? "Had muat turun bulanan untuk pelan Free telah digunakan." : "The Free plan monthly download limit has been reached.");
          return;
        }
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Takziah-${data.fullName.replace(/\s+/g, "-")}-${data.format}.${type === "png" ? "png" : "jpg"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success(language === "ms" ? "Poster berjaya dimuat turun!" : "Poster downloaded successfully!");
    } catch (error) {
      console.error("Error downloading poster:", error);
      toast.error(language === "ms" ? "Gagal memuat turun poster. Sila cuba lagi." : "Failed to download poster. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!posterRef.current || !data || !navigator.share) {
      toast.error(t.sharePosterUnsupported);
      return;
    }

    setIsDownloading(true);
    try {
      const canvas = await html2canvas(posterRef.current, {
        scale: 2,
        backgroundColor: "#0a0a0a",
        logging: false,
      });

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((nextBlob) => resolve(nextBlob), "image/png");
      });

      if (!blob) {
        toast.error(language === "ms" ? "Gagal menjana poster." : "Failed to generate poster.");
        return;
      }

      const file = new File([blob], `Takziah-${data.fullName.replace(/\s+/g, "-")}.png`, { type: "image/png" });
      await navigator.share({
        title: data.fullName,
        text: data.organization || data.fullName,
        files: [file],
      });
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        console.error("Error sharing poster:", error);
        toast.error(t.sharePosterUnsupported);
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === "ms" ? "ms-MY" : "en-MY", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t.previewTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-96 bg-poster-bg rounded-lg p-8 space-y-4">
            <p
              className="text-3xl md:text-4xl text-poster-gold font-arabic leading-relaxed text-center"
              style={{ fontFamily: "Scheherazade New, serif", fontWeight: 700 }}
            >
              إِنَّا لِلّٰهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ
            </p>
            <p className="text-base text-poster-white/90 italic font-medium text-center">
              Innā lillāhi wa innā ilayhi rāji'ūn
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              {t.previewDescription}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const accentColor = data.theme === "classic" ? "text-poster-gold" : "text-poster-white";
  const genderTitle = data.gender === "allahyarham"
    ? "Allahyarham"
    : "Almarhumah";
  const defaultPrayerLineOne = language === "ms"
    ? "Ya Allah, ampunilah dia, rahmatilah dia, maafkanlah dia, muliakanlah kematiannya, lapangkanlah kuburnya, dan jadikanlah syurga sebagai ganti tempat tinggalnya."
    : "O Allah, forgive them, have mercy on them, pardon them, honor their passing, widen their grave, and grant Paradise as their eternal home.";
  const defaultPrayerLineTwo = language === "ms"
    ? `Semoga roh ${genderTitle} dicucuri rahmat dan ditempatkan di sisi-Mu bersama para solihin.`
    : `May the soul of ${genderTitle} be showered with mercy and placed among the righteous.`;
  const amenText = language === "ms" ? "Aamiin Ya Rabbal 'Alamin." : "Ameen, Lord of all worlds.";
  const fromLabel = language === "ms" ? "Daripada:" : "From:";
  const posterBackgroundClass =
    data.theme === "premium"
      ? "bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.22),_transparent_42%),linear-gradient(180deg,_#18120f_0%,_#090909_100%)]"
      : "bg-poster-bg";
  const premiumTemplate = data.premiumTemplate === "official" ? "official-light" : data.premiumTemplate;
  const isOfficialPremiumTemplate = isPaidTier && data.theme === "premium" && premiumTemplate === "official-light";
  const isOfficialNightPremiumTemplate = isPaidTier && data.theme === "premium" && premiumTemplate === "official-night";
  const isOfficialEmeraldPremiumTemplate = isPaidTier && data.theme === "premium" && premiumTemplate === "official-emerald";
  const isInstagramStory = currentFormat === "instagram-story";
  const showBrandWatermark = isFreeTier || (isDiamondTier && !data.whiteLabel);

  if (isOfficialPremiumTemplate) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t.previewTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            ref={posterRef}
            className="relative overflow-hidden rounded-lg shadow-lg"
            style={{
              aspectRatio: config.aspectRatio,
              minHeight: config.minHeight,
              maxHeight: config.maxHeight,
              background:
                "radial-gradient(circle at top, rgba(255,255,255,0.96), rgba(244,247,247,0.98) 40%, rgba(236,240,240,1) 100%)",
            }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(160,170,176,0.16),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(120,132,140,0.12),transparent_22%)]" />

            <div className="relative flex h-full flex-col items-center px-6 py-8 text-center md:px-10">
              {data.companyLogo && (
                <div className="mb-3 flex justify-center">
                  <img src={data.companyLogo} alt="Company logo" className="max-h-16 w-auto object-contain md:max-h-20" />
                </div>
              )}

              <p
                className="mb-2 text-2xl leading-relaxed text-black md:text-4xl"
                style={{ fontFamily: "Scheherazade New, serif", fontWeight: 700, direction: "rtl" }}
              >
                إِنَّا لِلّٰهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ
              </p>

              <div className="mt-4 flex flex-1 flex-col items-center justify-center">
                {grayscalePhoto && (
                  <div className="mb-5">
                    <img
                      src={grayscalePhoto}
                      alt={data.fullName}
                      className="h-44 w-36 rounded-[1.5rem] object-cover shadow-xl md:h-60 md:w-48"
                    />
                  </div>
                )}

                <h2 className="text-2xl font-bold uppercase tracking-tight text-black md:text-4xl">
                  {data.fullName}
                </h2>
                {data.organization && (
                  <p className="mt-2 text-base font-medium uppercase tracking-wide text-black/75 md:text-xl">
                    {data.organization}
                  </p>
                )}
                {(data.birthDate || data.deathDate) && (
                  <p className="mt-2 text-lg font-semibold text-black/80 md:text-2xl">
                    {[data.birthDate ? new Date(data.birthDate).getFullYear() : null, data.deathDate ? new Date(data.deathDate).getFullYear() : null].filter(Boolean).join(" - ")}
                  </p>
                )}
                <p className="mt-6 max-w-2xl text-sm italic leading-relaxed text-black/75 md:text-lg">
                  {data.message || defaultPrayerLineTwo}
                </p>
              </div>

              {data.from && (
                <div className="mt-6 w-full max-w-2xl rounded-[2rem] bg-black px-6 py-4 text-white shadow-lg">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] md:text-sm">{fromLabel}</p>
                  <p className="mt-2 text-sm font-semibold uppercase leading-relaxed md:text-lg">{data.from}</p>
                </div>
              )}
            </div>

            {showBrandWatermark && (
              <div className="pointer-events-none absolute bottom-4 left-4">
                <div className="rounded-md border border-black/10 bg-white/70 px-3 py-1 text-[10px] font-medium tracking-[0.18em] text-black/60 shadow-sm backdrop-blur-sm">
                  ©SalamTakziah
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            {isFreeTier && <p className="text-xs text-muted-foreground">{t.freeTierDownloadNotice}</p>}
            {isPaidTier && <p className="text-xs text-muted-foreground">{t.premiumTierExportNotice}</p>}
            <div className={`grid gap-2 ${isPaidTier ? "sm:grid-cols-2" : "grid-cols-1"}`}>
              <Button onClick={() => handleDownload("jpeg")} disabled={isDownloading} className="w-full" size="lg">
                <Download className="mr-2 h-4 w-4" />
                {isDownloading ? t.downloadingButton : t.downloadButton}
              </Button>
              {isPaidTier && (
                <Button onClick={() => handleDownload("png")} disabled={isDownloading} className="w-full" size="lg" variant="secondary">
                  <Download className="mr-2 h-4 w-4" />
                  {isDownloading ? t.downloadingButton : t.downloadPngButton}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isOfficialNightPremiumTemplate) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t.previewTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            ref={posterRef}
            className="relative overflow-hidden rounded-lg shadow-lg"
            style={{
              aspectRatio: config.aspectRatio,
              minHeight: config.minHeight,
              maxHeight: config.maxHeight,
              background:
                "radial-gradient(circle at 75% 20%, rgba(54,191,207,0.30), transparent 22%), radial-gradient(circle at 82% 32%, rgba(92,212,226,0.16), transparent 24%), linear-gradient(180deg, #071019 0%, #0b1925 48%, #04070b 100%)",
            }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_26%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.04),transparent_20%)]" />

            <div className="relative flex h-full flex-col items-center px-6 py-8 text-center text-white md:px-10">
              {data.companyLogo && (
                <div className="mb-4 flex justify-center">
                  <img src={data.companyLogo} alt="Company logo" className="max-h-16 w-auto object-contain md:max-h-20" />
                </div>
              )}

              <p
                className="mb-2 text-2xl leading-relaxed text-white md:text-4xl"
                style={{ fontFamily: "Scheherazade New, serif", fontWeight: 700, direction: "rtl" }}
              >
                إِنَّا لِلّٰهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ
              </p>

              <h1
                className="mt-3 text-4xl italic leading-none text-white md:text-6xl"
                style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 600 }}
              >
                Salam Takziah
              </h1>

              <div className="mt-6 flex flex-1 flex-col items-center justify-center">
                {grayscalePhoto && (
                  <div className="mb-6">
                    <img
                      src={grayscalePhoto}
                      alt={data.fullName}
                      className="h-40 w-40 rounded-full border-4 border-white/80 object-cover shadow-2xl md:h-56 md:w-56"
                    />
                  </div>
                )}

                <h2 className="text-2xl font-bold uppercase tracking-tight text-white md:text-4xl">
                  {data.fullName}
                </h2>
                {data.organization && (
                  <p className="mt-1 text-base text-white/80 md:text-xl">
                    {data.organization}
                  </p>
                )}
                <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/90 md:text-lg">
                  {data.message || defaultPrayerLineTwo}
                </p>
              </div>

              {data.from && (
                <div className="mt-6 w-full max-w-2xl text-center text-white">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/60 md:text-sm">{fromLabel}</p>
                  <p className="mt-3 text-sm font-semibold uppercase leading-relaxed md:text-lg">{data.from}</p>
                </div>
              )}
            </div>

            {showBrandWatermark && (
              <div className="pointer-events-none absolute bottom-4 left-4">
                <div className="rounded-md border border-white/10 bg-black/25 px-3 py-1 text-[10px] font-medium tracking-[0.18em] text-white/70 shadow-sm backdrop-blur-sm">
                  ©SalamTakziah
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            {isFreeTier && <p className="text-xs text-muted-foreground">{t.freeTierDownloadNotice}</p>}
            {isPaidTier && <p className="text-xs text-muted-foreground">{t.premiumTierExportNotice}</p>}
            <div className={`grid gap-2 ${isPaidTier ? "sm:grid-cols-2" : "grid-cols-1"}`}>
              <Button onClick={() => handleDownload("jpeg")} disabled={isDownloading} className="w-full" size="lg">
                <Download className="mr-2 h-4 w-4" />
                {isDownloading ? t.downloadingButton : t.downloadButton}
              </Button>
              {isPaidTier && (
                <Button onClick={() => handleDownload("png")} disabled={isDownloading} className="w-full" size="lg" variant="secondary">
                  <Download className="mr-2 h-4 w-4" />
                  {isDownloading ? t.downloadingButton : t.downloadPngButton}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isOfficialEmeraldPremiumTemplate) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t.previewTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            ref={posterRef}
            className="relative overflow-hidden rounded-lg shadow-lg"
            style={{
              aspectRatio: config.aspectRatio,
              minHeight: config.minHeight,
              maxHeight: config.maxHeight,
              background:
                "radial-gradient(circle at top, rgba(181, 223, 204, 0.95), rgba(18, 67, 57, 0.98) 42%, rgba(7, 26, 22, 1) 100%)",
            }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(188,242,221,0.16),transparent_24%)]" />

            <div className="relative flex h-full flex-col items-center px-6 py-8 text-center text-white md:px-10">
              {data.companyLogo && (
                <div className="mb-4 flex justify-center">
                  <img src={data.companyLogo} alt="Company logo" className="max-h-16 w-auto object-contain md:max-h-20" />
                </div>
              )}

              <p
                className="mb-2 text-2xl leading-relaxed text-[#f8f3d8] md:text-4xl"
                style={{ fontFamily: "Scheherazade New, serif", fontWeight: 700, direction: "rtl" }}
              >
                إِنَّا لِلّٰهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ
              </p>

              <div className="mt-5 flex flex-1 flex-col items-center justify-center">
                {grayscalePhoto && (
                  <div className="mb-6">
                    <img
                      src={grayscalePhoto}
                      alt={data.fullName}
                      className="h-40 w-40 rounded-[2rem] border-4 border-white/60 object-cover shadow-2xl md:h-56 md:w-56"
                    />
                  </div>
                )}

                <p className="text-sm uppercase tracking-[0.28em] text-emerald-100/80 md:text-base">
                  Salam Takziah
                </p>
                <h2 className="mt-3 text-2xl font-bold uppercase tracking-tight text-white md:text-4xl">
                  {data.fullName}
                </h2>
                {data.organization && (
                  <p className="mt-2 text-base font-medium text-emerald-50/80 md:text-xl">
                    {data.organization}
                  </p>
                )}
                {(data.birthDate || data.deathDate) && (
                  <p className="mt-3 text-lg font-semibold text-emerald-100/80 md:text-2xl">
                    {[data.birthDate ? new Date(data.birthDate).getFullYear() : null, data.deathDate ? new Date(data.deathDate).getFullYear() : null].filter(Boolean).join(" - ")}
                  </p>
                )}
                <p className="mt-6 max-w-2xl text-sm leading-relaxed text-white/90 md:text-lg">
                  {data.message || defaultPrayerLineTwo}
                </p>
              </div>

              {data.from && (
                <div className="mt-6 w-full max-w-2xl rounded-[1.75rem] border border-white/20 bg-white/10 px-5 py-4 text-center backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-[0.24em] text-emerald-100/70 md:text-sm">{fromLabel}</p>
                  <p className="mt-3 text-sm font-semibold uppercase leading-relaxed text-white md:text-lg">{data.from}</p>
                </div>
              )}
            </div>

            {showBrandWatermark && (
              <div className="pointer-events-none absolute bottom-4 left-4">
                <div className="rounded-md border border-white/10 bg-black/25 px-3 py-1 text-[10px] font-medium tracking-[0.18em] text-white/70 shadow-sm backdrop-blur-sm">
                  ©SalamTakziah
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            {isFreeTier && <p className="text-xs text-muted-foreground">{t.freeTierDownloadNotice}</p>}
            {isPaidTier && <p className="text-xs text-muted-foreground">{t.premiumTierExportNotice}</p>}
            <div className={`grid gap-2 ${isPaidTier ? "sm:grid-cols-2" : "grid-cols-1"}`}>
              <Button onClick={() => handleDownload("jpeg")} disabled={isDownloading} className="w-full" size="lg">
                <Download className="mr-2 h-4 w-4" />
                {isDownloading ? t.downloadingButton : t.downloadButton}
              </Button>
              {isPaidTier && (
                <Button onClick={() => handleDownload("png")} disabled={isDownloading} className="w-full" size="lg" variant="secondary">
                  <Download className="mr-2 h-4 w-4" />
                  {isDownloading ? t.downloadingButton : t.downloadPngButton}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.previewTitle}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Poster */}
        <div
          ref={posterRef}
          className={`relative flex flex-col text-center overflow-hidden rounded-lg shadow-lg ${posterBackgroundClass}`}
          style={{
            fontFamily: "Inter, sans-serif",
            aspectRatio: config.aspectRatio,
            minHeight: config.minHeight,
            maxHeight: config.maxHeight,
          }}
        >
          {isPaidTier && data.companyLogo && (
            <div className={`flex-shrink-0 px-4 ${isInstagramStory ? "pt-6 md:pt-8" : "pt-4"}`}>
              <div className="flex justify-center">
                <img
                  src={data.companyLogo}
                  alt="Company logo"
                  className={`${isInstagramStory ? "max-h-16 md:max-h-20" : "max-h-10 md:max-h-14"} w-auto object-contain opacity-95`}
                />
              </div>
            </div>
          )}

          {/* Header Section with Arabic Text */}
          <div className={`flex-shrink-0 px-4 ${isInstagramStory ? "pt-6 pb-6 md:pt-8 md:pb-7" : "pt-4 pb-3"}`}>
            <p
              className={`${isInstagramStory ? "text-3xl md:text-5xl" : "text-lg md:text-xl"} ${accentColor} font-arabic mb-1 leading-relaxed`}
              style={{
                fontFamily: "Scheherazade New, serif",
                fontWeight: 700,
                direction: "rtl"
              }}
            >
              إِنَّا لِلّٰهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ
            </p>
            <p className={`${isInstagramStory ? "mt-4 text-base md:text-xl" : "mt-2 text-xs md:text-sm"} text-poster-white/90 italic font-medium`}>
              Innā lillāhi wa innā ilayhi rāji'ūn
            </p>
          </div>

          {/* Main Content Area - Flexible */}
          <div className={`flex-1 flex flex-col items-center justify-center px-4 min-h-0 ${isInstagramStory ? "py-8 md:py-10" : "py-2"}`}>
            {/* Photo */}
            {grayscalePhoto && (
              <div className={`${isInstagramStory ? "mb-7 md:mb-8" : "mb-2 md:mb-3"} flex-shrink-0`}>
                <img
                  src={grayscalePhoto}
                  alt={data.fullName}
                  className={`${config.photoSize} object-cover rounded-full border-4 border-poster-white/20 shadow-2xl ${isInstagramStory ? "ring-4 ring-poster-white/5" : ""}`}
                />
              </div>
            )}

            {/* Name and Title */}
            <div className={`${isInstagramStory ? "mb-5 md:mb-6" : "mb-2 md:mb-3"} flex-shrink-0`}>
              <p className={`${isInstagramStory ? "text-xl md:text-2xl" : "text-sm md:text-base"} ${accentColor} mb-1.5 font-medium`}>
                {genderTitle}
              </p>
              <h2 className={`${isInstagramStory ? "text-2xl md:text-4xl leading-tight" : "text-lg md:text-xl"} font-bold text-poster-white mb-1.5`}>
                {data.fullName}
              </h2>
              {data.organization && (
                <p className={`${isInstagramStory ? "text-sm md:text-lg" : "text-xs md:text-sm"} italic text-poster-white/70`}>
                  {data.organization}
                </p>
              )}
            </div>

            {/* Dates */}
            {(data.birthDate && data.deathDate) && (
              <p className={`${isInstagramStory ? "text-sm md:text-lg mb-5 md:mb-6" : "text-xs md:text-sm mb-2 md:mb-3"} text-poster-white/60 flex-shrink-0`}>
                ({formatDate(data.birthDate)} – {formatDate(data.deathDate)})
              </p>
            )}

            {/* Prayer or Custom Message - Flexible */}
            <div className={`flex-1 flex flex-col justify-center overflow-hidden ${isInstagramStory ? "mb-5 max-w-[29rem] px-4" : "mb-2 max-w-2xl"}`}>
              {data.message ? (
                <p className={`${isInstagramStory ? "text-base md:text-xl leading-relaxed" : "text-xs md:text-sm"} text-poster-white/90 px-2`}>
                  {data.message}
                </p>
              ) : (
                <div className={`${isInstagramStory ? "space-y-3" : "space-y-1"}`}>
                  <p
                    className={`${isInstagramStory ? "text-lg md:text-2xl" : "text-xs md:text-sm"} ${accentColor} font-arabic`}
                    style={{ fontFamily: "Scheherazade New, serif" }}
                  >
                    بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
                  </p>
                  <p className={`${isInstagramStory ? "text-base md:text-xl leading-relaxed" : "text-xs md:text-sm"} text-poster-white/90`}>
                    {defaultPrayerLineOne}
                  </p>
                  <p className={`${isInstagramStory ? "text-base md:text-xl leading-relaxed" : "text-xs md:text-sm"} text-poster-white/90`}>
                    {defaultPrayerLineTwo}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer Section - Fixed at bottom */}
          <div className={`flex-shrink-0 px-4 ${isInstagramStory ? "pb-8 md:pb-10" : "pb-4"}`}>
            {/* Aamiin */}
            <div className={`${isInstagramStory ? "mb-3" : "mb-2"}`}>
              <p className={`${isInstagramStory ? "text-base md:text-2xl" : "text-xs md:text-sm"} ${accentColor} italic font-medium`}>
                {amenText}
              </p>
            </div>

            {/* From */}
            {data.from && (
              <div className="border-t border-poster-white/30 pt-2">
                <p className={`${isInstagramStory ? "text-sm md:text-lg" : "text-xs md:text-sm"} text-poster-white/90`}>
                  <span className={`${accentColor} font-semibold`}>{fromLabel}</span> {data.from}
                </p>
              </div>
            )}
          </div>

          {/* Decorative Corner Elements */}
          <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-poster-gold/30"></div>
          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-poster-gold/30"></div>
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-poster-gold/30"></div>
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-poster-gold/30"></div>

          {data.theme === "premium" && (
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <div className="absolute inset-6 rounded-[2rem] border border-poster-gold/30" />
              <div className="absolute inset-x-8 top-10 h-px bg-gradient-to-r from-transparent via-poster-gold/60 to-transparent" />
              <div className="absolute inset-x-8 bottom-10 h-px bg-gradient-to-r from-transparent via-poster-gold/40 to-transparent" />
            </div>
          )}

          {showBrandWatermark && (
            <div className="pointer-events-none absolute bottom-4 left-4">
              <div className="rounded-md border border-poster-white/15 bg-black/30 px-3 py-1 text-[10px] font-medium tracking-[0.18em] text-poster-white/70 shadow-sm backdrop-blur-sm">
                ©SalamTakziah
              </div>
            </div>
          )}
        </div>

        {/* Download Button */}
        <div className="space-y-2">
          {isFreeTier && <p className="text-xs text-muted-foreground">{t.freeTierDownloadNotice}</p>}
          {isPaidTier && <p className="text-xs text-muted-foreground">{t.premiumTierExportNotice}</p>}
          {isDiamondTier && <p className="text-xs text-muted-foreground">{t.diamondTierShareNotice}</p>}
          <div className={`grid gap-2 ${isPaidTier ? "sm:grid-cols-2" : "grid-cols-1"}`}>
            <Button onClick={() => handleDownload("jpeg")} disabled={isDownloading} className="w-full" size="lg">
              <Download className="mr-2 h-4 w-4" />
              {isDownloading ? t.downloadingButton : t.downloadButton}
            </Button>
            {isPaidTier && (
              <Button onClick={() => handleDownload("png")} disabled={isDownloading} className="w-full" size="lg" variant="secondary">
                <Download className="mr-2 h-4 w-4" />
                {isDownloading ? t.downloadingButton : t.downloadPngButton}
              </Button>
            )}
          </div>
          {isDiamondTier && (
            <Button onClick={handleShare} disabled={isDownloading} className="w-full" variant="outline" size="lg">
              {isDownloading ? t.downloadingButton : t.sharePosterButton}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PosterPreview;
