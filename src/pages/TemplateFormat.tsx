import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const TemplateFormat = () => {
  const { language } = useLanguage();
  const isMs = language === "ms";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4" />
            {isMs ? "Kembali ke Halaman Utama" : "Back to Home"}
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">🎨 {isMs ? "Template & Format" : "Templates & Formats"}</h1>
          <p className="text-muted-foreground mt-2">
            {isMs
              ? "Panduan lengkap mengenai saiz, format, dan piawaian poster takziah yang sesuai"
              : "A practical guide to poster sizes, formats, and standards for respectful memorial posters"}
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>{isMs ? "Saiz Poster Standard" : "Standard Poster Sizes"}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  title: isMs ? "Format Landscape (Horizontal) - Disyorkan" : "Landscape Format (Horizontal) - Recommended",
                  items: isMs
                    ? ["1920 x 1080 pixels (HD, sesuai untuk media sosial)", "1200 x 675 pixels (ringan, sesuai untuk WhatsApp)", "Nisbah 16:9 (standard untuk paparan digital)"]
                    : ["1920 x 1080 pixels (HD, suitable for social media)", "1200 x 675 pixels (lighter, suitable for WhatsApp)", "16:9 ratio (standard for digital display)"],
                },
                {
                  title: isMs ? "Format Portrait (Vertical)" : "Portrait Format (Vertical)",
                  items: isMs
                    ? ["1080 x 1920 pixels (Instagram Story)", "1080 x 1350 pixels (Instagram Feed)", "Nisbah 9:16 atau 4:5"]
                    : ["1080 x 1920 pixels (Instagram Story)", "1080 x 1350 pixels (Instagram Feed)", "9:16 or 4:5 ratio"],
                },
                {
                  title: isMs ? "Format Square" : "Square Format",
                  items: isMs
                    ? ["1080 x 1080 pixels (Facebook, Instagram Square)", "Nisbah 1:1"]
                    : ["1080 x 1080 pixels (Facebook, Instagram Square)", "1:1 ratio"],
                },
              ].map((section) => (
                <div key={section.title} className="bg-muted/50 p-4 rounded-lg">
                  <p className="font-medium mb-2">{section.title}</p>
                  <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                    {section.items.map((item) => <li key={item}>• {item}</li>)}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>{isMs ? "Elemen Penting dalam Poster Takziah" : "Essential Elements in a Memorial Poster"}</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  [isMs ? "Ayat Al-Quran atau Doa" : "Quranic verse or prayer", isMs ? "إِنَّا لِلّٰهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ wajar diletakkan di bahagian atas poster." : "إِنَّا لِلّٰهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ is best placed near the top of the poster."],
                  [isMs ? "Foto Si Mati" : "Photo of the Deceased", isMs ? "Gunakan foto yang jelas, sopan, dan dihormati. Foto akan ditukar kepada hitam putih secara automatik." : "Use a clear, respectful portrait. The photo is automatically converted to grayscale."],
                  [isMs ? "Nama Penuh" : "Full Name", isMs ? "Sertakan gelaran Allahyarham atau Almarhumah sebelum nama penuh." : "Include Allahyarham or Almarhumah before the full name where appropriate."],
                  [isMs ? "Tarikh Penting" : "Important Dates", isMs ? "Paparkan tarikh lahir dan tarikh meninggal dengan format yang jelas." : "Display the birth and passing dates in a clear and readable format."],
                  [isMs ? "Nama Pengirim" : "Sender Name", isMs ? "Nyatakan keluarga, individu, atau organisasi yang menghantar ucapan takziah." : "State the family, individual, or organization sending the condolence."],
                ].map(([title, body], index) => (
                  <div key={String(index)} className="border-l-4 border-primary pl-4">
                    <p className="font-medium mb-1">{index + 1}. {title}</p>
                    <p className="text-sm text-muted-foreground">{body}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>{isMs ? "Panduan Reka Bentuk" : "Design Guidance"}</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                <li>{isMs ? "Gunakan warna gelap dan elakkan warna yang terlalu cerah atau meriah." : "Use darker tones and avoid colors that feel too bright or celebratory."}</li>
                <li>{isMs ? "Pilih fon yang mudah dibaca untuk teks utama dan fon Arab yang sesuai untuk doa." : "Choose readable fonts for the main text and an appropriate Arabic font for prayers."}</li>
                <li>{isMs ? "Berikan ruang yang mencukupi antara elemen agar poster kelihatan kemas." : "Give enough spacing between elements so the poster feels calm and organized."}</li>
                <li>{isMs ? "Pastikan kontras teks dengan latar belakang sentiasa jelas." : "Make sure the text maintains clear contrast against the background."}</li>
                <li>{isMs ? "Simpan sebagai JPEG untuk perkongsian mudah atau PNG untuk kualiti lebih baik." : "Save as JPEG for easy sharing or PNG when you want better visual quality."}</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t border-border mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>{isMs ? "© 2025 Ucapan Takziah dengan Doa & Ingatan. Semoga Allah merahmati arwah yang telah pergi." : "© 2025 Condolence Messages with Prayer & Remembrance. May Allah have mercy on the departed souls."}</p>
        </div>
      </footer>
    </div>
  );
};

export default TemplateFormat;
