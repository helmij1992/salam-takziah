import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const EnglishCondolences = () => {
  const { language } = useLanguage();
  const content = language === "ms"
    ? {
        back: "Kembali ke Halaman Utama",
        title: "🌍 Ucapan Takziah Bahasa Inggeris",
        subtitle: "Ucapan takziah profesional dan sopan dalam Bahasa Inggeris untuk suasana kerja atau pelbagai budaya",
        formal: "Ucapan Takziah Formal",
        workplace: "Ucapan Takziah Tempat Kerja",
        short: "Ucapan Ringkas & Mudah",
        tips: "Tips Menulis Ucapan Inggeris",
        footer: "© 2025 Ucapan Takziah dengan Doa & Ingatan. Semoga damai buat mereka yang telah pergi.",
      }
    : {
        back: "Back to Home",
        title: "🌍 English Condolences",
        subtitle: "Professional and respectful condolence messages in English for workplace or multicultural settings",
        formal: "Formal Condolence Messages",
        workplace: "Workplace Condolence Messages",
        short: "Short & Simple Condolences",
        tips: "Tips for English Condolences",
        footer: "© 2025 Condolence Messages with Prayer & Remembrance. May peace be upon those who have passed.",
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
            <CardHeader><CardTitle>{content.formal}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                "\"Please accept my deepest condolences on the passing of [Name]. May Allah grant them Jannah and give you and your family strength during this difficult time.\"",
                "\"I am deeply saddened to hear about the loss of [Name]. My thoughts and prayers are with you and your family. May Allah have mercy on their soul and grant you patience and comfort.\"",
                "\"We are heartbroken to learn of [Name]'s passing. Please know that our prayers are with you during this sorrowful time. May Allah bless their soul with eternal peace.\"",
              ].map((text) => (
                <div key={text} className="border-l-4 border-primary pl-4">
                  <p className="text-muted-foreground">{text}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>{content.workplace}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                "\"On behalf of [Company/Team Name], we extend our heartfelt condolences to you and your family. We are keeping you in our thoughts and prayers during this difficult time. Please take all the time you need.\"",
                "\"We were deeply saddened to hear about your loss. Our entire team sends its condolences and support. May you find comfort in the memories you shared and strength in the love of family and friends.\"",
              ].map((text) => (
                <div key={text} className="border-l-4 border-primary pl-4">
                  <p className="text-muted-foreground">{text}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>{content.short}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                "\"My deepest sympathies to you and your family. May [Name] rest in peace.\"",
                "\"Sending love and prayers your way during this difficult time.\"",
                "\"My heart goes out to you. May Allah grant you strength and comfort.\"",
                "\"Words cannot express how sorry I am for your loss. You are in my prayers.\"",
              ].map((text) => (
                <p key={text} className="text-muted-foreground border-l-4 border-primary pl-4">{text}</p>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>{content.tips}</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                <li>{language === "ms" ? "Pastikan mesej jujur dan datang dari hati" : "Keep the message sincere and heartfelt"}</li>
                <li>{language === "ms" ? "Akui kesedihan dan kehilangan yang sedang dialami keluarga" : "Acknowledge the pain and loss the family is experiencing"}</li>
                <li>{language === "ms" ? "Tawarkan bantuan khusus jika sesuai" : "Offer specific help if possible"}</li>
                <li>{language === "ms" ? "Elakkan frasa klise jika tidak sesuai dengan budaya" : "Avoid clichés unless they are culturally appropriate"}</li>
                <li>{language === "ms" ? "Hormati perbezaan agama dan budaya dalam pemilihan kata" : "Respect religious and cultural differences in your wording"}</li>
                <li>{language === "ms" ? "Susuli keluarga selepas tempoh berkabung awal" : "Follow up with the family after the immediate mourning period"}</li>
              </ul>
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

export default EnglishCondolences;
