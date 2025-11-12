import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PosterData } from "@/types/poster";
import { Download } from "lucide-react";
import html2canvas from "html2canvas";
import { toast } from "sonner";

interface PosterPreviewProps {
  data: PosterData | null;
}

const PosterPreview = ({ data }: PosterPreviewProps) => {
  const posterRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [grayscalePhoto, setGrayscalePhoto] = useState<string | null>(null);

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
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Takziah-${data.fullName.replace(/\s+/g, "-")}.jpg`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success("Poster berjaya dimuat turun!");
      }, "image/jpeg");
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
          <CardTitle>Pratonton Poster</CardTitle>
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
              Isi borang untuk menjana poster
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
        <CardTitle>Pratonton Poster</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Poster */}
        <div
          ref={posterRef}
          className="relative bg-poster-bg p-12 aspect-[4/3] flex flex-col items-center justify-center text-center overflow-hidden rounded-lg"
          style={{
            fontFamily: "Inter, sans-serif",
            minHeight: "800px",
          }}
        >
          {/* Arabic Phrase */}
          <div className="mb-6 w-full">
            <p
              className={`text-xl ${accentColor} font-arabic mb-2 leading-relaxed`}
              style={{ 
                fontFamily: "Scheherazade New, serif", 
                fontWeight: 700,
                direction: "rtl"
              }}
            >
              إِنَّا لِلّٰهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ
            </p>
            <p className="text-xs text-poster-white/90 italic font-medium">
              Innā lillāhi wa innā ilayhi rāji'ūn
            </p>
          </div>

          {/* Photo */}
          {grayscalePhoto && (
            <div className="mb-6">
              <img
                src={grayscalePhoto}
                alt={data.fullName}
                className="w-32 h-32 object-cover rounded-full border-4 border-poster-white/20 shadow-2xl"
              />
            </div>
          )}

          {/* Title */}
          <p className={`text-base ${accentColor} mb-2`}>{genderTitle}</p>

          {/* Name */}
          <h2 className="text-lg font-bold text-poster-white mb-2">{data.fullName}</h2>

          {/* Organization */}
          {data.organization && (
            <p className="text-sm italic text-poster-white/60 mb-2">{data.organization}</p>
          )}

          {/* Dates */}
          <p className="text-sm text-poster-white/70 mb-4">
            ({formatDate(data.birthDate)} – {formatDate(data.deathDate)})
          </p>

          {/* Additional Message */}
          {data.message && (
            <p className="text-sm text-poster-white/80 mb-6 max-w-2xl">{data.message}</p>
          )}

          {/* Prayer */}
          <div className="mb-16 max-w-2xl space-y-2">
            <p
              className={`text-base ${accentColor} font-arabic`}
              style={{ fontFamily: "Scheherazade New, serif" }}
            >
              بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
            </p>
            <p className="text-sm text-poster-white/90 leading-relaxed">
              Ya Allah, ampunilah dia, rahmatilah dia, maafkanlah dia, muliakanlah kematiannya,
              lapangkanlah kuburnya, dan jadikanlah syurga sebagai ganti tempat tinggalnya.
            </p>
            <p className="text-sm text-poster-white/90 leading-relaxed">
              Semoga roh {genderTitle} dicucuri rahmat dan ditempatkan di sisi-Mu bersama para
              solihin.
            </p>
          </div>

          {/* Decorative Corner Elements */}
          <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-poster-gold/30"></div>
          <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-poster-gold/30"></div>
          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-poster-gold/30"></div>
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-poster-gold/30"></div>

          {/* Aamiin - Before Daripada */}
          <div className="absolute bottom-20 left-0 right-0 text-center">
            <p className={`text-sm ${accentColor} italic`}>Aamiin Ya Rabbal 'Alamin.</p>
          </div>

          {/* From - At the bottom */}
          <div className="absolute bottom-8 left-0 right-0 text-center border-t border-poster-white/30 pt-3 mx-20">
            <p className="text-xs text-poster-white/90">
              <span className={`${accentColor} font-semibold`}>Daripada:</span> {data.from}
            </p>
          </div>
        </div>

        {/* Download Button */}
        <Button onClick={handleDownload} disabled={isDownloading} className="w-full" size="lg">
          <Download className="mr-2 h-4 w-4" />
          {isDownloading ? "Memuat turun..." : "Muat Turun sebagai JPEG"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PosterPreview;
