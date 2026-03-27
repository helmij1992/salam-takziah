import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowLeft, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

const UcapanWhatsapp = () => {
  const { toast } = useToast();
  const { language } = useLanguage();

  const content = language === "ms"
    ? {
        back: "Kembali ke Halaman Utama",
        title: "📱 Ucapan WhatsApp",
        subtitle: "Mesej takziah ringkas dan padat untuk dihantar melalui WhatsApp, SMS, dan Telegram",
        copiedTitle: "Disalin!",
        copiedDesc: "Mesej telah disalin ke papan klip",
        bmTitle: "Mesej Takziah Bahasa Melayu",
        enTitle: "Mesej Takziah Bahasa Inggeris",
        tipsTitle: "Tips Menghantar Mesej Takziah",
        followupTitle: "Contoh Mesej Susulan",
        followupWeek: "Seminggu Selepas Pemergian",
        followupMonth: "Sebulan Selepas Pemergian",
        footer: "© 2025 Ucapan Takziah dengan Doa & Ingatan. Semoga Allah merahmati arwah yang telah pergi.",
        messages: [
          ["Mesej Ringkas 1", "Innalillahi wa inna ilaihi rajiun. Takziah diucapkan. Semoga Allah mencucuri rahmat ke atas roh Allahyarham/Almarhumah dan memberikan kekuatan kepada keluarga. Al-Fatihah."],
          ["Mesej Ringkas 2", "Turut berdukacita atas pemergian Allahyarham/Almarhumah. Semoga Allah merahmati rohnya dan memberikan kesabaran kepada keluarga yang ditinggalkan."],
          ["Mesej Ringkas 3", "Takziah. Semoga Allah menempatkan Allahyarham/Almarhumah bersama para solihin dan solihat. Dipanjangkan doa untuk keluarga yang ditinggalkan."],
          ["Mesej dengan Emoji", "🤲 Innalillahi wa inna ilaihi rajiun\n\nTakziah diucapkan atas pemergian Allahyarham/Almarhumah. Semoga Allah SWT mencucuri rahmat dan menempatkan roh di kalangan orang beriman.\n\n🤍 Al-Fatihah"],
          ["Mesej Formal", "Assalamualaikum. Kami sekeluarga turut berdukacita atas pemergian Allahyarham/Almarhumah. Semoga Allah merahmati rohnya dan memberikan kekuatan kepada ahli keluarga. Takziah diucapkan."],
        ],
        english: [
          ["Mesej Inggeris 1", "My deepest condolences on your loss. May Allah grant them Jannah and give you strength. You are in my prayers."],
          ["Mesej Inggeris 2", "I'm so sorry for your loss. Sending prayers and strength to you and your family during this difficult time. 🤍"],
          ["Mesej Inggeris 3", "Inna lillahi wa inna ilayhi raji'un. May Allah have mercy on their soul and grant you patience. My thoughts are with you."],
        ],
        tips: [
          "Hantar mesej dalam tempoh 24-72 jam selepas mendengar berita dukacita",
          "Gunakan nada yang sopan, ringkas, dan penuh empati",
          "Elakkan bertanya soalan yang terlalu personal atau sensitif",
          "Tawarkan bantuan konkrit jika mampu",
          "Boleh menambah emoji seperti 🤲 atau 🤍 untuk sentuhan lembut",
          "Jangan terlalu panjang kerana keluarga mungkin menerima banyak mesej",
          "Ikuti dengan panggilan telefon atau lawatan jika sesuai",
        ],
        weekText: "\"Assalamualaikum. Semoga keluarga diberi kekuatan dan ketabahan dalam menghadapi kehilangan ini. Kami sentiasa mendoakan Allahyarham/Almarhumah. Jika ada apa-apa keperluan, jangan segan untuk beritahu.\"",
        monthText: "\"Selamat sejahtera. Masih teringat Allahyarham/Almarhumah dalam doa. Semoga keluarga terus diberi kekuatan. Al-Fatihah.\"",
      }
    : {
        back: "Back to Home",
        title: "📱 WhatsApp Messages",
        subtitle: "Short and thoughtful condolence messages for WhatsApp, SMS, and Telegram",
        copiedTitle: "Copied!",
        copiedDesc: "Message copied to clipboard",
        bmTitle: "Malay Condolence Messages",
        enTitle: "English Condolence Messages",
        tipsTitle: "Tips for Sending Condolence Messages",
        followupTitle: "Follow-up Message Examples",
        followupWeek: "One Week After the Passing",
        followupMonth: "One Month After the Passing",
        footer: "© 2025 Condolence Messages with Prayer & Remembrance. May peace be upon those who have passed.",
        messages: [
          ["Short Malay Message 1", "Innalillahi wa inna ilaihi rajiun. Our condolences. May Allah shower mercy upon the soul of the deceased and grant strength to the family. Al-Fatihah."],
          ["Short Malay Message 2", "We are saddened by the passing of Allahyarham/Almarhumah. May Allah have mercy on their soul and grant patience to the family left behind."],
          ["Short Malay Message 3", "Condolences. May Allah place Allahyarham/Almarhumah among the righteous. Our prayers are with the family."],
          ["Malay Message with Emoji", "🤲 Innalillahi wa inna ilaihi rajiun\n\nOur condolences on the passing of Allahyarham/Almarhumah. May Allah SWT shower mercy and place the soul among the believers.\n\n🤍 Al-Fatihah"],
          ["Formal Malay Message", "Assalamualaikum. Our family is deeply saddened by the passing of Allahyarham/Almarhumah. May Allah have mercy on their soul and grant strength to the family. Our condolences."],
        ],
        english: [
          ["Short English Message 1", "My deepest condolences on your loss. May Allah grant them Jannah and give you strength. You are in my prayers."],
          ["Short English Message 2", "I'm so sorry for your loss. Sending prayers and strength to you and your family during this difficult time. 🤍"],
          ["Short English Message 3", "Inna lillahi wa inna ilayhi raji'un. May Allah have mercy on their soul and grant you patience. My thoughts are with you."],
        ],
        tips: [
          "Send the message within 24-72 hours after hearing the news",
          "Use a respectful, brief, and empathetic tone",
          "Avoid overly personal or sensitive questions",
          "Offer practical help if you are able",
          "You may add gentle emojis like 🤲 or 🤍",
          "Keep it concise since the family may receive many messages",
          "Follow up with a call or visit when appropriate",
        ],
        weekText: "\"Assalamualaikum. May your family be given strength and patience through this loss. We continue to pray for Allahyarham/Almarhumah. If there is anything you need, please let us know.\"",
        monthText: "\"Peace be upon you. Allahyarham/Almarhumah remains in our prayers. May your family continue to be given strength. Al-Fatihah.\"",
      };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: content.copiedTitle,
      description: content.copiedDesc,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4" />
            {content.back}
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">{content.title}</h1>
          <p className="text-muted-foreground mt-2">{content.subtitle}</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>{content.bmTitle}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {content.messages.map(([title, text]) => (
                <div key={title} className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium text-sm text-primary">{title}</p>
                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(text)} className="h-8 w-8 p-0">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{text}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>{content.enTitle}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {content.english.map(([title, text]) => (
                <div key={title} className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium text-sm text-primary">{title}</p>
                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(text)} className="h-8 w-8 p-0">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{text}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>{content.tipsTitle}</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                {content.tips.map((tip) => <li key={tip}>{tip}</li>)}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>{content.followupTitle}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="font-medium text-sm text-primary mb-2">{content.followupWeek}</p>
                <p className="text-sm text-muted-foreground">{content.weekText}</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="font-medium text-sm text-primary mb-2">{content.followupMonth}</p>
                <p className="text-sm text-muted-foreground">{content.monthText}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t border-border mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>{content.footer}</p>
        </div>
      </footer>
    </div>
  );
};

export default UcapanWhatsapp;
