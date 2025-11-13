import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowLeft, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const UcapanWhatsapp = () => {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Disalin!",
      description: "Mesej telah disalin ke papan klip",
    });
  };

  const messages = [
    {
      title: "Mesej Ringkas 1",
      text: "Innalillahi wa inna ilaihi rajiun. Takziah diucapkan. Semoga Allah mencucuri rahmat ke atas roh Allahyarham/Almarhumah dan memberikan kekuatan kepada keluarga. Al-Fatihah.",
    },
    {
      title: "Mesej Ringkas 2",
      text: "Turut berdukacita atas pemergian Allahyarham/Almarhumah. Semoga Allah merahmati rohnya dan memberikan kesabaran kepada keluarga yang ditinggalkan.",
    },
    {
      title: "Mesej Ringkas 3",
      text: "Takziah. Semoga Allah menempatkan Allahyarham/Almarhumah bersama para solihin dan solihat. Dipanjangkan doa untuk keluarga yang ditinggalkan.",
    },
    {
      title: "Mesej dengan Emoji",
      text: "🤲 Innalillahi wa inna ilaihi rajiun\n\nTakziah diucapkan atas pemergian Allahyarham/Almarhumah. Semoga Allah SWT mencucuri rahmat dan menempatkan roh di kalangan orang beriman.\n\n🤍 Al-Fatihah",
    },
    {
      title: "Mesej Formal",
      text: "Assalamualaikum. Kami sekeluarga turut berdukacita atas pemergian Allahyarham/Almarhumah. Semoga Allah merahmati rohnya dan memberikan kekuatan kepada ahli keluarga. Takziah diucapkan.",
    },
  ];

  const englishMessages = [
    {
      title: "Short English Message 1",
      text: "My deepest condolences on your loss. May Allah grant them Jannah and give you strength. You are in my prayers.",
    },
    {
      title: "Short English Message 2",
      text: "I'm so sorry for your loss. Sending prayers and strength to you and your family during this difficult time. 🤍",
    },
    {
      title: "Short English Message 3",
      text: "Inna lillahi wa inna ilayhi raji'un. May Allah have mercy on their soul and grant you patience. My thoughts are with you.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Halaman Utama
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            📱 Ucapan WhatsApp
          </h1>
          <p className="text-muted-foreground mt-2">
            Mesej takziah ringkas dan padat untuk dihantar melalui WhatsApp, SMS, dan Telegram
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mesej Takziah Bahasa Melayu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {messages.map((message, index) => (
                <div key={index} className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium text-sm text-primary">{message.title}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(message.text)}
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{message.text}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>English Condolence Messages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {englishMessages.map((message, index) => (
                <div key={index} className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium text-sm text-primary">{message.title}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(message.text)}
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{message.text}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tips Menghantar Mesej Takziah</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                <li>Hantar mesej dalam tempoh 24-72 jam selepas mendengar berita dukacita</li>
                <li>Gunakan nada yang sopan, ringkas, dan penuh empati</li>
                <li>Elakkan bertanya soalan yang terlalu personal atau sensitif</li>
                <li>Tawarkan bantuan konkrit jika mampu ("Jika ada apa-apa keperluan, sila maklumkan")</li>
                <li>Boleh menambah emoji seperti 🤲 atau 🤍 untuk memberikan sentuhan lembut</li>
                <li>Jangan terlalu panjang - keluarga si mati mungkin menerima banyak mesej</li>
                <li>Ikuti dengan panggilan telefon atau lawatan jika sesuai</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contoh Mesej Follow-up</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="font-medium text-sm text-primary mb-2">Seminggu Selepas Pemergian</p>
                <p className="text-sm text-muted-foreground">
                  "Assalamualaikum. Semoga keluarga diberi kekuatan dan ketabahan dalam menghadapi kehilangan ini. Kami sentiasa mendoakan Allahyarham/Almarhumah. Jika ada apa-apa keperluan, jangan segan untuk beritahu."
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="font-medium text-sm text-primary mb-2">Sebulan Selepas Pemergian</p>
                <p className="text-sm text-muted-foreground">
                  "Selamat sejahtera. Masih teringat Allahyarham/Almarhumah dalam doa. Semoga keluarga terus diberi kekuatan. Al-Fatihah."
                </p>
              </div>
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

export default UcapanWhatsapp;
