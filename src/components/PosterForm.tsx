import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PosterData, PosterFormat } from "@/types/poster";
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
  const [format, setFormat] = useState<PosterFormat>("classic");

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
    
    // Required field validation
    if (!photo) {
      toast.error("Sila upload gambar terlebih dahulu.");
      return;
    }
    
    if (!fullName.trim()) {
      toast.error("Sila isi nama penuh.");
      return;
    }

    // Date validation
    if (birthDate && deathDate) {
      const birth = new Date(birthDate);
      const death = new Date(deathDate);
      
      if (death <= birth) {
        toast.error("Tarikh meninggal harus selepas tarikh lahir.");
        return;
      }
    }

    // Character limit validation
    if (fullName.length > 100) {
      toast.error("Nama penuh tidak boleh melebihi 100 aksara.");
      return;
    }
    
    if (organization && organization.length > 150) {
      toast.error("Organisasi/jawatan tidak boleh melebihi 150 aksara.");
      return;
    }
    
    if (message && message.length > 500) {
      toast.error("Ucapan takziah tidak boleh melebihi 500 aksara.");
      return;
    }
    
    if (from && from.length > 100) {
      toast.error("'Daripada' tidak boleh melebihi 100 aksara.");
      return;
    }

    onGenerate({
      photo,
      fullName: fullName.trim(),
      gender,
      birthDate,
      deathDate,
      organization: organization.trim(),
      message: message.trim(),
      from: from.trim(),
      theme,
      format,
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
              {t.birthDateLabel}
            </Label>
            <Input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
          </div>

          {/* Death Date */}
          <div className="space-y-2">
            <Label htmlFor="deathDate">
              {t.deathDateLabel}
            </Label>
            <Input
              id="deathDate"
              type="date"
              value={deathDate}
              onChange={(e) => setDeathDate(e.target.value)}
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

          {/* Message (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="message">{t.messageLabel}</Label>
            <Textarea
              id="message"
              placeholder={t.messagePlaceholder}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              {message.length}/500 aksara
            </p>
          </div>

          {/* From */}
          <div className="space-y-2">
            <Label htmlFor="from">
              {t.fromLabel}
            </Label>
            <Input
              id="from"
              placeholder={t.fromPlaceholder}
              value={from}
              onChange={(e) => setFrom(e.target.value)}
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

          {/* Format Selection */}
          <div className="space-y-2">
            <Label>{t.formatLabel}</Label>
            <RadioGroup value={format} onValueChange={(value) => setFormat(value as PosterFormat)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="classic" id="format-classic" />
                <Label htmlFor="format-classic" className="font-normal cursor-pointer text-sm">
                  {t.formatClassic}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="instagram-square" id="format-ig-square" />
                <Label htmlFor="format-ig-square" className="font-normal cursor-pointer text-sm">
                  {t.formatInstagramSquare}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="instagram-landscape" id="format-ig-landscape" />
                <Label htmlFor="format-ig-landscape" className="font-normal cursor-pointer text-sm">
                  {t.formatInstagramLandscape}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="instagram-portrait" id="format-ig-portrait" />
                <Label htmlFor="format-ig-portrait" className="font-normal cursor-pointer text-sm">
                  {t.formatInstagramPortrait}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="facebook" id="format-facebook" />
                <Label htmlFor="format-facebook" className="font-normal cursor-pointer text-sm">
                  {t.formatFacebook}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="instagram-story" id="format-ig-story" />
                <Label htmlFor="format-ig-story" className="font-normal cursor-pointer text-sm">
                  {t.formatInstagramStory}
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
