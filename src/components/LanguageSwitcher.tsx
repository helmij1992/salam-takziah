import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2 bg-secondary rounded-lg p-1">
      <Languages className="w-4 h-4 text-muted-foreground ml-2" />
      <Button
        variant={language === "ms" ? "default" : "ghost"}
        size="sm"
        onClick={() => setLanguage("ms")}
        className="text-xs h-7"
      >
        BM
      </Button>
      <Button
        variant={language === "en" ? "default" : "ghost"}
        size="sm"
        onClick={() => setLanguage("en")}
        className="text-xs h-7"
      >
        EN
      </Button>
    </div>
  );
};

export default LanguageSwitcher;
