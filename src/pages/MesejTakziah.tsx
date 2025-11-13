import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const MesejTakziah = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Halaman Utama
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            🤲 Mesej Takziah Islam
          </h1>
          <p className="text-muted-foreground mt-2">
            Doa dan ucapan takziah mengikut sunnah yang sesuai untuk disampaikan kepada keluarga si mati
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Doa Utama Takziah</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-xl font-arabic text-center mb-2" style={{ fontFamily: "'Scheherazade New', serif" }}>
                  إِنَّا لِلّٰهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ
                </p>
                <p className="text-sm text-muted-foreground text-center italic">
                  Inna lillahi wa inna ilayhi raji'un
                </p>
                <p className="text-sm text-center mt-2">
                  "Sesungguhnya kami adalah kepunyaan Allah dan kepada-Nya lah kami kembali."
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ucapan Takziah yang Disarankan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="border-l-4 border-primary pl-4">
                  <p className="font-medium mb-2">Ucapan 1:</p>
                  <p className="text-muted-foreground">
                    "Innalillahi wa inna ilaihi rajiun. Semoga Allah SWT mencucuri rahmat ke atas roh si mati dan memberikan kesabaran kepada keluarga yang ditinggalkan. Al-Fatihah."
                  </p>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <p className="font-medium mb-2">Ucapan 2:</p>
                  <p className="text-muted-foreground">
                    "Takziah diucapkan. Semoga Allah menempatkan arwah Allahyarham/Almarhumah di kalangan orang-orang yang beriman dan bertaqwa. Semoga Allah memberikan kekuatan kepada keluarga yang ditinggalkan."
                  </p>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <p className="font-medium mb-2">Ucapan 3:</p>
                  <p className="text-muted-foreground">
                    "Turut berdukacita atas pemergian Allahyarham/Almarhumah. Semoga rohnya dicucuri rahmat dan ditempatkan bersama para solihin dan solihat. Semoga Allah memberikan kekuatan dan ketabahan kepada keluarga."
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Doa untuk Si Mati</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-lg font-arabic mb-2" style={{ fontFamily: "'Scheherazade New', serif" }}>
                  اللَّهُمَّ اغْفِرْ لَهُ وَارْحَمْهُ وَعَافِهِ وَاعْفُ عَنْهُ
                </p>
                <p className="text-sm text-muted-foreground italic mb-2">
                  Allahummaghfir lahu warhamhu wa'afihi wa'fu 'anhu
                </p>
                <p className="text-sm">
                  "Ya Allah, ampunilah dia, rahmatilah dia, sejahterakanlah dia, dan maafkanlah dia."
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Adab Bertakziah</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                <li>Menziarahi keluarga si mati dalam tempoh 3 hari</li>
                <li>Mendoakan si mati dan keluarga yang ditinggalkan</li>
                <li>Memberikan kata-kata yang menenangkan dan menguatkan iman</li>
                <li>Membantu keluarga dalam urusan jenazah jika diperlukan</li>
                <li>Tidak memperpanjangkan masa lawatan untuk tidak membebankan keluarga</li>
                <li>Mengelakkan perbualan yang melalaikan atau tidak berfaedah</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t border-border mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 Ucapan Takziah dengan Doa & Ingatan. Semoga Allah merahmati arwah yang telah pergi.</p>
        </div>
      </footer>
    </div>
  );
};

export default MesejTakziah;
