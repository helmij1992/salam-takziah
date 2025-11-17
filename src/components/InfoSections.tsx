import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const InfoSections = () => {
  const { t } = useLanguage();
  
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg">{t.infoMesejTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {t.infoMesejDesc}
          </p>
          <Link
            to="/mesej-takziah"
            className="text-sm text-accent hover:underline font-medium"
          >
            {t.readGuide}
          </Link>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg">{t.infoEnglishTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {t.infoEnglishDesc}
          </p>
          <Link
            to="/english-condolences"
            className="text-sm text-accent hover:underline font-medium"
          >
            {t.readGuide}
          </Link>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg">{t.infoWhatsappTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {t.infoWhatsappDesc}
          </p>
          <Link
            to="/ucapan-whatsapp"
            className="text-sm text-accent hover:underline font-medium"
          >
            {t.readGuide}
          </Link>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg">{t.infoTemplateTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {t.infoTemplateDesc}
          </p>
          <Link
            to="/template-format"
            className="text-sm text-accent hover:underline font-medium"
          >
            {t.readGuide}
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default InfoSections;
