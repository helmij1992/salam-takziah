import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const TemplateFormat = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Halaman Utama
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            🎨 Template & Format
          </h1>
          <p className="text-muted-foreground mt-2">
            Panduan lengkap mengenai saiz, format, dan piawaian poster takziah yang sesuai
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Saiz Poster Standard</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="font-medium mb-2">Format Landscape (Horizontal) - Disyorkan</p>
                <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                  <li>• 1920 x 1080 pixels (HD, sesuai untuk media sosial)</li>
                  <li>• 1200 x 675 pixels (Ringan, sesuai untuk WhatsApp)</li>
                  <li>• Nisbah 16:9 (Standard untuk paparan digital)</li>
                </ul>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="font-medium mb-2">Format Portrait (Vertical)</p>
                <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                  <li>• 1080 x 1920 pixels (Instagram Story)</li>
                  <li>• 1080 x 1350 pixels (Instagram Feed)</li>
                  <li>• Nisbah 9:16 atau 4:5</li>
                </ul>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="font-medium mb-2">Format Square</p>
                <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                  <li>• 1080 x 1080 pixels (Facebook, Instagram Square)</li>
                  <li>• Nisbah 1:1</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Elemen Penting dalam Poster Takziah</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="border-l-4 border-primary pl-4">
                  <p className="font-medium mb-1">1. Ayat Al-Quran atau Doa</p>
                  <p className="text-sm text-muted-foreground">
                    إِنَّا لِلّٰهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ wajib ada di bahagian atas poster
                  </p>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <p className="font-medium mb-1">2. Foto Si Mati</p>
                  <p className="text-sm text-muted-foreground">
                    Letakkan foto yang jelas, elegan, dan dihormati. Disarankan format portrait dengan latar belakang sederhana. Foto akan ditukar kepada hitam putih secara automatik.
                  </p>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <p className="font-medium mb-1">3. Nama Penuh</p>
                  <p className="text-sm text-muted-foreground">
                    Sertakan gelaran Allahyarham (lelaki) atau Almarhumah (perempuan) sebelum nama penuh
                  </p>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <p className="font-medium mb-1">4. Tarikh Lahir & Tarikh Meninggal</p>
                  <p className="text-sm text-muted-foreground">
                    Format yang jelas: DD/MM/YYYY atau DD MMM YYYY
                  </p>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <p className="font-medium mb-1">5. Jawatan/Gelaran (Opsyenal)</p>
                  <p className="text-sm text-muted-foreground">
                    Contoh: Bekas Pengarah Syarikat, Guru Besar, Dato', Tan Sri
                  </p>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <p className="font-medium mb-1">6. Pengirim/Daripada</p>
                  <p className="text-sm text-muted-foreground">
                    Nama individu, keluarga, atau organisasi yang menghantar takziah
                  </p>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <p className="font-medium mb-1">7. Doa Penutup</p>
                  <p className="text-sm text-muted-foreground">
                    Doa dalam Bahasa Arab dan terjemahan Bahasa Melayu untuk si mati
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Panduan Reka Bentuk</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                <li><strong>Warna:</strong> Gunakan warna gelap (hitam, kelabu gelap) untuk latar belakang. Hindari warna terang atau meriah.</li>
                <li><strong>Font:</strong> Pilih font yang mudah dibaca seperti Inter, Lato, atau Roboto untuk teks Melayu/Inggeris. Gunakan font Arabic seperti Scheherazade New atau Noto Naskh Arabic untuk ayat Al-Quran.</li>
                <li><strong>Spacing:</strong> Berikan ruang yang mencukupi antara elemen supaya poster kelihatan bersih dan mudah dibaca.</li>
                <li><strong>Alignment:</strong> Pastikan semua teks diselaraskan dengan baik (center atau left-aligned).</li>
                <li><strong>Foto:</strong> Gunakan foto berkualiti tinggi (minimum 300 DPI untuk cetakan). Untuk digital, 72-150 DPI sudah mencukupi.</li>
                <li><strong>Format Fail:</strong> Simpan sebagai JPEG untuk perkongsian digital atau PNG untuk kualiti yang lebih baik.</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Platform Perkongsian</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="font-medium text-sm mb-1">WhatsApp / Telegram</p>
                  <p className="text-xs text-muted-foreground">
                    Saiz disyorkan: 1200 x 675 pixels (landscape) atau 1080 x 1080 pixels (square). Format JPEG dengan kualiti 85-90%.
                  </p>
                </div>

                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="font-medium text-sm mb-1">Instagram Story</p>
                  <p className="text-xs text-muted-foreground">
                    Saiz: 1080 x 1920 pixels (9:16). Format JPEG atau PNG.
                  </p>
                </div>

                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="font-medium text-sm mb-1">Facebook / Instagram Feed</p>
                  <p className="text-xs text-muted-foreground">
                    Saiz: 1080 x 1080 pixels (square) atau 1080 x 1350 pixels (4:5). Format JPEG.
                  </p>
                </div>

                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="font-medium text-sm mb-1">Email</p>
                  <p className="text-xs text-muted-foreground">
                    Saiz: 1200 x 675 pixels atau lebih kecil untuk memudahkan muat turun. Format JPEG dengan saiz fail maksimum 500KB.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tips Tambahan</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                <li>Semak semua maklumat 2-3 kali sebelum muat turun untuk elakkan kesilapan ejaan atau tarikh</li>
                <li>Simpan salinan asal dalam format editable (contoh: PSD atau AI) untuk kemaskini masa depan</li>
                <li>Dapatkan kebenaran keluarga sebelum berkongsi poster di media sosial awam</li>
                <li>Elakkan menggunakan terlalu banyak elemen dekorasi - kesederhanaan adalah kunci</li>
                <li>Pastikan kontras yang mencukupi antara teks dan latar belakang untuk mudah dibaca</li>
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

export default TemplateFormat;
