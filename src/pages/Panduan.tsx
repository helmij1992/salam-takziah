import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Panduan = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-center text-foreground">
            Panduan Lengkap Takziah
          </h1>
          <p className="text-center text-muted-foreground mt-2">
            Panduan mesej, format, dan etika takziah Islam
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Section 1: Mesej Takziah Islam */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">🤲 Mesej Takziah Islam</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Doa Takziah Utama</h3>
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <p className="text-lg font-arabic" style={{ fontFamily: "Scheherazade New, serif" }}>
                    إِنَّا لِلّٰهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ
                  </p>
                  <p className="text-sm italic text-muted-foreground">
                    Innā lillāhi wa innā ilayhi rāji'ūn
                  </p>
                  <p className="text-sm">
                    Sesungguhnya kami adalah kepunyaan Allah dan kepada-Nya kami kembali.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Contoh Mesej Takziah</h3>
                <ul className="space-y-3 text-sm">
                  <li className="bg-muted/50 p-3 rounded">
                    "Takziah diucapkan. Semoga Allah SWT mencucuri rahmat ke atas roh Allahyarham/Almarhumah dan ditempatkan bersama orang-orang yang beriman. Semoga tuan/puan sekeluarga tabah menghadapi dugaan ini."
                  </li>
                  <li className="bg-muted/50 p-3 rounded">
                    "Innalillahi wa innailaihi rajiun. Turut berdukacita atas pemergian Allahyarham/Almarhumah. Semoga rohnya dicucuri rahmat dan ditempatkan di kalangan orang-orang yang soleh."
                  </li>
                  <li className="bg-muted/50 p-3 rounded">
                    "Takziah dan ucapan belasungkawa kepada keluarga yang ditinggalkan. Semoga Allah memberikan kekuatan dan kesabaran kepada semua ahli keluarga."
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Doa untuk Si Mati</h3>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm leading-relaxed">
                    Ya Allah, ampunilah dia, rahmatilah dia, maafkanlah dia, muliakanlah kematiannya, 
                    lapangkanlah kuburnya, dan jadikanlah syurga sebagai ganti tempat tinggalnya. 
                    Cucurilah rahmat ke atas rohnya dan tempatkan dia di sisi-Mu bersama para solihin.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: English Condolences */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">🌍 English Condolences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Professional Condolence Messages</h3>
                <ul className="space-y-3 text-sm">
                  <li className="bg-muted/50 p-3 rounded">
                    "Please accept my deepest condolences for your loss. May the departed soul rest in eternal peace, and may you and your family find strength during this difficult time."
                  </li>
                  <li className="bg-muted/50 p-3 rounded">
                    "I was deeply saddened to hear about the passing of [Name]. My thoughts and prayers are with you and your family. May Allah grant the departed Jannah and give you patience and comfort."
                  </li>
                  <li className="bg-muted/50 p-3 rounded">
                    "On behalf of [Organization/Team], we extend our heartfelt sympathies. May the memories you shared bring you comfort, and may the departed rest in peace."
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Short & Simple Messages</h3>
                <ul className="space-y-2 text-sm">
                  <li className="bg-muted/50 p-3 rounded">
                    "My deepest sympathies to you and your family."
                  </li>
                  <li className="bg-muted/50 p-3 rounded">
                    "May [Name] rest in peace. You are in my thoughts and prayers."
                  </li>
                  <li className="bg-muted/50 p-3 rounded">
                    "Sending you love and strength during this difficult time."
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Ucapan WhatsApp */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">📱 Ucapan WhatsApp</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Mesej Ringkas untuk WhatsApp</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Mesej takziah yang padat dan mudah untuk dihantar melalui aplikasi mesej.
                </p>
                <ul className="space-y-3 text-sm">
                  <li className="bg-muted/50 p-3 rounded">
                    "Innalillahi wa innailaihi rajiun. Takziah diucapkan. Semoga Allahyarham/Almarhumah ditempatkan bersama orang beriman. Tabahkan hati."
                  </li>
                  <li className="bg-muted/50 p-3 rounded">
                    "Turut berdukacita. Semoga Allah mencucuri rahmat ke atas rohnya dan memberikan kesabaran kepada keluarga. Al-Fatihah."
                  </li>
                  <li className="bg-muted/50 p-3 rounded">
                    "Takziah. Semoga roh Allahyarham/Almarhumah dicucuri rahmat. Tabah menghadapi ujian ini. 🤲"
                  </li>
                  <li className="bg-muted/50 p-3 rounded">
                    "Ucapan takziah. May Allah bless the departed soul. Kuat dan tabah ye. 💐"
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Tips Menghantar Mesej Takziah</h3>
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Pastikan mesej ringkas dan jelas</li>
                  <li>Gunakan bahasa yang sopan dan penuh hormat</li>
                  <li>Elakkan penggunaan emoji yang berlebihan</li>
                  <li>Hantar pada waktu yang sesuai (tidak terlalu lewat malam)</li>
                  <li>Ikut sertakan doa untuk si mati dan keluarga</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Template & Format */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">🎨 Template & Format</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Panduan Format Poster Takziah</h3>
                <ul className="space-y-3 text-sm">
                  <li className="bg-muted/50 p-3 rounded">
                    <strong>Saiz Poster:</strong> Format landscape/horizontal (Nisbah 4:3) sesuai untuk perkongsian media sosial
                  </li>
                  <li className="bg-muted/50 p-3 rounded">
                    <strong>Latar Belakang:</strong> Gunakan warna gelap (hitam/kelam) dengan aksen emas atau putih untuk penampilan yang elegan
                  </li>
                  <li className="bg-muted/50 p-3 rounded">
                    <strong>Font:</strong> Kombinasi font Arab (Scheherazade New) untuk ayat Al-Quran dan font sans-serif (Inter) untuk teks Melayu/Inggeris
                  </li>
                  <li className="bg-muted/50 p-3 rounded">
                    <strong>Gambar:</strong> Guna gambar formal/passport dengan kesan hitam putih untuk suasana khusyuk
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Elemen Penting dalam Poster</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Ayat Inna Lillahi (إِنَّا لِلّٰهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ) di bahagian atas</li>
                  <li>Gambar Allahyarham/Almarhumah (hitam putih, bulat)</li>
                  <li>Nama penuh dengan gelaran yang sesuai</li>
                  <li>Tarikh lahir dan tarikh meninggal</li>
                  <li>Jawatan atau gelaran (jika berkaitan)</li>
                  <li>Doa untuk si mati (Bismillah dan doa)</li>
                  <li>Penutup dengan "Aamiin Ya Rabbal Alamin"</li>
                  <li>Nama pengirim ucapan takziah di bahagian bawah</li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Etika Perkongsian Poster</h3>
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Pastikan mendapat kebenaran keluarga sebelum berkongsi</li>
                  <li>Semak semua maklumat dengan teliti (nama, tarikh, ejaan)</li>
                  <li>Kongsi di platform yang sesuai (WhatsApp group, Facebook, LinkedIn)</li>
                  <li>Elakkan perkongsian berulang yang berlebihan</li>
                  <li>Hormati privasi keluarga si mati</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Back Button */}
          <div className="text-center pt-4">
            <Link to="/">
              <Button size="lg">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke Halaman Utama
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 Penjana Poster Takziah Islam. Semoga Allah merahmati arwah yang telah pergi.</p>
        </div>
      </footer>
    </div>
  );
};

export default Panduan;
