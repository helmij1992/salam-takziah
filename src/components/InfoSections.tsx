import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const InfoSections = () => {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg">🤲 Mesej Takziah Islam</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Doa dan ucapan takziah mengikut sunnah yang sesuai untuk disampaikan kepada keluarga
            si mati.
          </p>
          <Link
            to="/panduan"
            className="text-sm text-accent hover:underline font-medium"
          >
            Baca Panduan →
          </Link>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg">🌍 English Condolences</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Professional and respectful condolence messages in English for workplace or
            multicultural settings.
          </p>
          <Link
            to="/panduan"
            className="text-sm text-accent hover:underline font-medium"
          >
            Baca Panduan →
          </Link>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg">📱 Ucapan WhatsApp</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Mesej takziah ringkas dan padat untuk dihantar melalui WhatsApp, SMS, dan Telegram.
          </p>
          <Link
            to="/panduan"
            className="text-sm text-accent hover:underline font-medium"
          >
            Baca Panduan →
          </Link>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg">🎨 Template & Format</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Panduan lengkap mengenai saiz, format, dan piawaian poster takziah yang sesuai.
          </p>
          <Link
            to="/panduan"
            className="text-sm text-accent hover:underline font-medium"
          >
            Baca Panduan →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default InfoSections;
