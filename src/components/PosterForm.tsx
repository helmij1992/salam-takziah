import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PosterData } from "@/types/poster";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface PosterFormProps {
  onGenerate: (data: PosterData) => void;
}

const PosterForm = ({ onGenerate }: PosterFormProps) => {
  const { t } = useLanguage();
  const [photo, setPhoto] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState<"allahyarham" | "almarhumah">("allahyarham");
  const [birthDate, setBirthDate] = useState("");
  const [deathDate, setDeathDate] = useState("");
  const [organization, setOrganization] = useState("");
  const [message, setMessage] = useState("");
  const [from, setFrom] = useState("");
  const [theme, setTheme] = useState<"classic" | "retro">("classic");

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t.toastSizeError);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!photo || !fullName || !birthDate || !deathDate || !from) {
      toast.error(t.toastRequiredError);
      return;
    }

    onGenerate({
      photo,
      fullName,
      gender,
      birthDate,
      deathDate,
      organization,
      message,
      from,
      theme,
    });

    toast.success(t.toastSuccess);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.formTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Upload */}
          <div className="space-y-2">
            <Label htmlFor="photo">
              {t.photoLabel} <span className="text-destructive">{t.required}</span>
            </Label>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="photo"
                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
              >
                {photo ? (
                  <img src={photo} alt="Preview" className="h-full object-contain rounded-lg" />
                ) : (
                  <div className="flex flex-col items-center justify-center py-6">
                    <Upload className="w-10 h-10 mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{t.clickToSelect}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t.maxSize}</p>
                  </div>
                )}
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </label>
            </div>
            <p className="text-xs text-muted-foreground">
              {t.autoGrayscale}
            </p>
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">
              {t.fullNameLabel} <span className="text-destructive">{t.required}</span>
            </Label>
            <Input
              id="fullName"
              placeholder={t.fullNamePlaceholder}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label>
              {t.genderLabel} <span className="text-destructive">{t.required}</span>
            </Label>
            <RadioGroup value={gender} onValueChange={(value) => setGender(value as "allahyarham" | "almarhumah")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="allahyarham" id="allahyarham" />
                <Label htmlFor="allahyarham" className="font-normal cursor-pointer">
                  {t.genderMale}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="almarhumah" id="almarhumah" />
                <Label htmlFor="almarhumah" className="font-normal cursor-pointer">
                  {t.genderFemale}
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Birth Date */}
          <div className="space-y-2">
            <Label htmlFor="birthDate">
              {t.birthDateLabel} <span className="text-destructive">{t.required}</span>
            </Label>
            <Input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              required
            />
          </div>

          {/* Death Date */}
          <div className="space-y-2">
            <Label htmlFor="deathDate">
              {t.deathDateLabel} <span className="text-destructive">{t.required}</span>
            </Label>
            <Input
              id="deathDate"
              type="date"
              value={deathDate}
              onChange={(e) => setDeathDate(e.target.value)}
              required
            />
          </div>

          {/* Organization (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="organization">{t.organizationLabel}</Label>
            <Input
              id="organization"
              placeholder={t.organizationPlaceholder}
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
            />
          </div>

          {/* From */}
          <div className="space-y-2">
            <Label htmlFor="from">
              {t.fromLabel} <span className="text-destructive">{t.required}</span>
            </Label>
            <Input
              id="from"
              placeholder={t.fromPlaceholder}
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              required
            />
          </div>

          {/* Theme Selection */}
          <div className="space-y-2">
            <Label>{t.themeLabel}</Label>
            <RadioGroup value={theme} onValueChange={(value) => setTheme(value as "classic" | "retro")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="classic" id="classic" />
                <Label htmlFor="classic" className="font-normal cursor-pointer">
                  {t.themeClassic}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="retro" id="retro" />
                <Label htmlFor="retro" className="font-normal cursor-pointer">
                  {t.themeRetro}
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" size="lg">
            {t.generateButton}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PosterForm;
