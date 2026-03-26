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
}

const PosterPreview = ({ data }: PosterPreviewProps) => {
  const { t } = useLanguage();
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
    "instagram-story": { aspectRatio: "9/16", minHeight: "600px", maxHeight: "800px", photoSize: "w-24 h-24 md:w-32 md:h-32" },
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

  const handleDownload = async () => {
    if (!posterRef.current || !data) return;

    setIsDownloading(true);
    try {
      const canvas = await html2canvas(posterRef.current, {
        scale: 2,
        backgroundColor: "#0a0a0a",
        logging: false,
      });

      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error("Gagal menjana poster.");
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Takziah-${data.fullName.replace(/\s+/g, "-")}-${data.format}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        toast.success("Poster berjaya dimuat turun!");
      }, "image/jpeg", 0.95);
    } catch (error) {
      console.error("Error downloading poster:", error);
      toast.error("Gagal memuat turun poster. Sila cuba lagi.");
    } finally {
      setIsDownloading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ms-MY", {
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
  const genderTitle = data.gender === "allahyarham" ? "Allahyarham" : "Almarhumah";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.previewTitle}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Poster */}
        <div
          ref={posterRef}
          className="relative bg-poster-bg flex flex-col text-center overflow-hidden rounded-lg shadow-lg"
          style={{
            fontFamily: "Inter, sans-serif",
            aspectRatio: config.aspectRatio,
            minHeight: config.minHeight,
            maxHeight: config.maxHeight,
          }}
        >
          {/* Header Section with Arabic Text */}
          <div className="flex-shrink-0 pt-6 px-4 pb-3">
            <p
              className={`text-lg md:text-xl ${accentColor} font-arabic mb-1 leading-relaxed`}
              style={{
                fontFamily: "Scheherazade New, serif",
                fontWeight: 700,
                direction: "rtl"
              }}
            >
              إِنَّا لِلّٰهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ
            </p>
            <p className="text-xs md:text-sm text-poster-white/90 italic font-medium">
              Innā lillāhi wa innā ilayhi rāji'ūn
            </p>
          </div>

          {/* Main Content Area - Flexible */}
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-2 min-h-0">
            {/* Photo */}
            {grayscalePhoto && (
              <div className="mb-2 md:mb-3 flex-shrink-0">
                <img
                  src={grayscalePhoto}
                  alt={data.fullName}
                  className={`${config.photoSize} object-cover rounded-full border-4 border-poster-white/20 shadow-2xl`}
                />
              </div>
            )}

            {/* Name and Title */}
            <div className="mb-2 md:mb-3 flex-shrink-0">
              <p className={`text-sm md:text-base ${accentColor} mb-1 font-medium`}>
                {genderTitle}
              </p>
              <h2 className="text-lg md:text-xl font-bold text-poster-white mb-1">
                {data.fullName}
              </h2>
              {data.organization && (
                <p className="text-xs md:text-sm italic text-poster-white/70">
                  {data.organization}
                </p>
              )}
            </div>

            {/* Dates */}
            {(data.birthDate && data.deathDate) && (
              <p className="text-xs md:text-sm text-poster-white/60 mb-2 md:mb-3 flex-shrink-0">
                ({formatDate(data.birthDate)} – {formatDate(data.deathDate)})
              </p>
            )}

            {/* Prayer or Custom Message - Flexible */}
            <div className="flex-1 flex flex-col justify-center max-w-2xl mb-2 overflow-hidden">
              {data.message ? (
                <p className="text-xs md:text-sm text-poster-white/90 leading-relaxed px-2">
                  {data.message}
                </p>
              ) : (
                <div className="space-y-1">
                  <p
                    className={`text-xs md:text-sm ${accentColor} font-arabic`}
                    style={{ fontFamily: "Scheherazade New, serif" }}
                  >
                    بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
                  </p>
                  <p className="text-xs md:text-sm text-poster-white/90 leading-relaxed">
                    Ya Allah, ampunilah dia, rahmatilah dia, maafkanlah dia, muliakanlah kematiannya,
                    lapangkanlah kuburnya, dan jadikanlah syurga sebagai ganti tempat tinggalnya.
                  </p>
                  <p className="text-xs md:text-sm text-poster-white/90 leading-relaxed">
                    Semoga roh {genderTitle} dicucuri rahmat dan ditempatkan di sisi-Mu bersama para solihin.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer Section - Fixed at bottom */}
          <div className="flex-shrink-0 px-4 pb-4">
            {/* Aamiin */}
            <div className="mb-2">
              <p className={`text-xs md:text-sm ${accentColor} italic font-medium`}>
                Aamiin Ya Rabbal 'Alamin.
              </p>
            </div>

            {/* From */}
            {data.from && (
              <div className="border-t border-poster-white/30 pt-2">
                <p className="text-xs md:text-sm text-poster-white/90">
                  <span className={`${accentColor} font-semibold`}>Daripada:</span> {data.from}
                </p>
              </div>
            )}
          </div>

          {/* Decorative Corner Elements */}
          <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-poster-gold/30"></div>
          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-poster-gold/30"></div>
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-poster-gold/30"></div>
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-poster-gold/30"></div>
        </div>

        {/* Download Button */}
        <Button onClick={handleDownload} disabled={isDownloading} className="w-full" size="lg">
          <Download className="mr-2 h-4 w-4" />
          {isDownloading ? t.downloadingButton : t.downloadButton}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PosterPreview;
