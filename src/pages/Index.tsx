import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import PosterForm from "@/components/PosterForm";
import PosterPreview from "@/components/PosterPreview";
import InfoSections from "@/components/InfoSections";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Card, CardContent } from "@/components/ui/card";
import { PosterData } from "@/types/poster";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSubscription } from "@/hooks/use-subscription";
import { useWorkspace } from "@/hooks/use-workspace";

const Index = () => {
  const location = useLocation();
  const [posterData, setPosterData] = useState<PosterData | null>(null);
  const [formDraftData, setFormDraftData] = useState<PosterData | null>(null);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [currentDraftTitle, setCurrentDraftTitle] = useState<string | null>(null);
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState<string | null>(null);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const { t } = useLanguage();
  const { isFreeTier, isPaidTier, isDiamondTier, remainingFreePosters, canGeneratePoster, recordPosterGeneration } = useSubscription();
  const { saveDraft, trackEvent } = useWorkspace();

  const locationPoster = useMemo(() => {
    const state = location.state as { draftPoster?: PosterData; sourceLabel?: string; draftId?: string; draftTitle?: string } | null;
    return state?.draftPoster ?? null;
  }, [location.state]);

  const sourceLabel = useMemo(() => {
    const state = location.state as { draftPoster?: PosterData; sourceLabel?: string; draftId?: string; draftTitle?: string } | null;
    return state?.sourceLabel ?? null;
  }, [location.state]);

  const locationDraftId = useMemo(() => {
    const state = location.state as { draftPoster?: PosterData; sourceLabel?: string; draftId?: string; draftTitle?: string } | null;
    return state?.draftId ?? null;
  }, [location.state]);

  const locationDraftTitle = useMemo(() => {
    const state = location.state as { draftPoster?: PosterData; sourceLabel?: string; draftId?: string; draftTitle?: string } | null;
    return state?.draftTitle ?? null;
  }, [location.state]);

  const currentSnapshot = useMemo(() => JSON.stringify(formDraftData), [formDraftData]);
  const hasUnsavedChanges = Boolean(isPaidTier && formDraftData && lastSavedSnapshot && currentSnapshot !== lastSavedSnapshot);

  useEffect(() => {
    if (!locationPoster) {
      return;
    }

    setPosterData(locationPoster);
    setFormDraftData(locationPoster);
    setCurrentDraftId(locationDraftId);
    setCurrentDraftTitle(locationDraftTitle ?? sourceLabel ?? "Loaded draft");
    setLastSavedSnapshot(JSON.stringify(locationPoster));
    trackEvent({
      type: "draft_loaded",
      meta: {
        source: sourceLabel ?? "workspace",
      },
    });
  }, [locationPoster, locationDraftId, locationDraftTitle, sourceLabel, trackEvent]);

  useEffect(() => {
    if (!isPaidTier || !currentDraftId || !formDraftData || !hasUnsavedChanges) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsDraftSaving(true);
      const savedDraft = saveDraft(currentDraftTitle ?? "Poster draft", formDraftData, currentDraftId);
      setCurrentDraftId(savedDraft.id);
      setCurrentDraftTitle(savedDraft.title);
      setLastSavedSnapshot(JSON.stringify(savedDraft.poster));
      setIsDraftSaving(false);
    }, 1500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [currentDraftId, currentDraftTitle, formDraftData, hasUnsavedChanges, isPaidTier, saveDraft]);

  useEffect(() => {
    if (!hasUnsavedChanges) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  const handleGenerate = async (data: PosterData) => {
    if (!canGeneratePoster) {
      return false;
    }

    const sanitizedData: PosterData = isFreeTier
      ? {
          ...data,
          format: data.format === "instagram-story" ? "instagram-story" : "classic",
          organization: "",
          message: "",
          from: "",
          whiteLabel: false,
        }
      : data;

    const didConsumeQuota = await recordPosterGeneration();
    if (!didConsumeQuota) {
      return false;
    }

    setPosterData(sanitizedData);
    trackEvent({
      type: "poster_generated",
      meta: {
        fullName: sanitizedData.fullName || "Untitled memorial",
        format: sanitizedData.format,
        theme: sanitizedData.theme,
      },
    });
    return true;
  };

  const handleSaveDraft = (title: string, data: PosterData, mode: "update" | "copy" = "update") => {
    setIsDraftSaving(true);
    const shouldUpdateExisting = mode === "update" && Boolean(currentDraftId);
    const savedDraft = saveDraft(title, data, shouldUpdateExisting ? currentDraftId ?? undefined : undefined);
    setCurrentDraftId(savedDraft.id);
    setCurrentDraftTitle(savedDraft.title);
    setLastSavedSnapshot(JSON.stringify(savedDraft.poster));
    setFormDraftData(savedDraft.poster);
    setIsDraftSaving(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              {t.backToDashboard}
            </Link>
            <LanguageSwitcher />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-center text-foreground">
            {t.mainTitle}
          </h1>
          <p className="text-center text-muted-foreground mt-2">
            {t.mainSubtitle}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {sourceLabel && (
          <Card className="max-w-7xl mx-auto mb-6">
            <CardContent className="py-4 text-sm text-muted-foreground">
              Editing from {sourceLabel}
            </CardContent>
          </Card>
        )}
        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Form Section */}
          <div>
            <PosterForm
              isFreeTier={isFreeTier}
              isPaidTier={isPaidTier}
              isDiamondTier={isDiamondTier}
              remainingFreePosters={remainingFreePosters}
              canGeneratePoster={canGeneratePoster}
              initialData={locationPoster}
              draftTitle={currentDraftTitle}
              isDraftSaving={isDraftSaving}
              hasUnsavedChanges={hasUnsavedChanges}
              onGenerate={handleGenerate}
              onSaveDraft={isPaidTier ? handleSaveDraft : undefined}
              onDataChange={isPaidTier ? setFormDraftData : undefined}
            />
          </div>

          {/* Preview Section */}
          <div className="lg:sticky lg:top-8 h-fit">
            <PosterPreview data={posterData} isFreeTier={isFreeTier} isPaidTier={isPaidTier} isDiamondTier={isDiamondTier} />
          </div>
        </div>

        {/* Info Sections */}
        <div className="mt-16">
          <InfoSections />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>{t.footerText}</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
