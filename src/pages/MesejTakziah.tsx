import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const MesejTakziah = () => {
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
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            {isMs ? "🤲 Mesej Takziah Islam" : "🤲 Islamic Condolence Messages"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isMs
              ? "Doa dan ucapan takziah mengikut sunnah yang sesuai untuk disampaikan kepada keluarga si mati"
              : "Prayers and condolence messages according to the Sunnah for the family of the deceased"}
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>{isMs ? "Doa Utama Takziah" : "Main Condolence Prayer"}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-xl font-arabic text-center mb-2" style={{ fontFamily: "'Scheherazade New', serif" }}>
                  إِنَّا لِلّٰهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ
                </p>
                <p className="text-sm text-muted-foreground text-center italic">Inna lillahi wa inna ilayhi raji'un</p>
                <p className="text-sm text-center mt-2">
                  {isMs
                    ? "\"Sesungguhnya kami adalah kepunyaan Allah dan kepada-Nya lah kami kembali.\""
                    : "\"Indeed, we belong to Allah, and indeed to Him we return.\""}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>{isMs ? "Ucapan Takziah yang Disarankan" : "Recommended Condolence Messages"}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                isMs
                  ? "\"Innalillahi wa inna ilaihi rajiun. Semoga Allah SWT mencucuri rahmat ke atas roh si mati dan memberikan kesabaran kepada keluarga yang ditinggalkan. Al-Fatihah.\""
                  : "\"Inna lillahi wa inna ilayhi raji'un. May Allah shower mercy upon the departed soul and grant patience to the family left behind. Al-Fatihah.\"",
                isMs
                  ? "\"Takziah diucapkan. Semoga Allah menempatkan arwah Allahyarham/Almarhumah di kalangan orang-orang yang beriman dan bertaqwa. Semoga Allah memberikan kekuatan kepada keluarga yang ditinggalkan.\""
                  : "\"Our condolences. May Allah place the departed among the faithful and righteous, and grant strength to the family left behind.\"",
                isMs
                  ? "\"Turut berdukacita atas pemergian Allahyarham/Almarhumah. Semoga rohnya dicucuri rahmat dan ditempatkan bersama para solihin dan solihat. Semoga Allah memberikan kekuatan dan ketabahan kepada keluarga.\""
                  : "\"We share in your grief over the passing of Allahyarham/Almarhumah. May their soul be showered with mercy and placed among the righteous. May Allah grant strength and perseverance to the family.\"",
              ].map((text, index) => (
                <div key={index} className="border-l-4 border-primary pl-4">
                  <p className="font-medium mb-2">{isMs ? `Ucapan ${index + 1}:` : `Message ${index + 1}:`}</p>
                  <p className="text-muted-foreground">{text}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>{isMs ? "Doa untuk Si Mati" : "Prayer for the Deceased"}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-lg font-arabic mb-2" style={{ fontFamily: "'Scheherazade New', serif" }}>
                  اللَّهُمَّ اغْفِرْ لَهُ وَارْحَمْهُ وَعَافِهِ وَاعْفُ عَنْهُ
                </p>
                <p className="text-sm text-muted-foreground italic mb-2">Allahummaghfir lahu warhamhu wa'afihi wa'fu 'anhu</p>
                <p className="text-sm">
                  {isMs
                    ? "\"Ya Allah, ampunilah dia, rahmatilah dia, sejahterakanlah dia, dan maafkanlah dia.\""
                    : "\"O Allah, forgive him, have mercy on him, grant him peace, and pardon him.\""}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>{isMs ? "Adab Bertakziah" : "Etiquette of Offering Condolences"}</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                <li>{isMs ? "Menziarahi keluarga si mati dalam tempoh 3 hari" : "Visit the family of the deceased within three days when possible"}</li>
                <li>{isMs ? "Mendoakan si mati dan keluarga yang ditinggalkan" : "Pray for the deceased and the family left behind"}</li>
                <li>{isMs ? "Memberikan kata-kata yang menenangkan dan menguatkan iman" : "Offer words that comfort and strengthen faith"}</li>
                <li>{isMs ? "Membantu keluarga dalam urusan jenazah jika diperlukan" : "Help the family with funeral matters if needed"}</li>
                <li>{isMs ? "Tidak memperpanjangkan masa lawatan untuk tidak membebankan keluarga" : "Keep visits considerate so the family is not overburdened"}</li>
                <li>{isMs ? "Mengelakkan perbualan yang melalaikan atau tidak berfaedah" : "Avoid idle or unhelpful conversation during the condolence visit"}</li>
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

export default MesejTakziah;
