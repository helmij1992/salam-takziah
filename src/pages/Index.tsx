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
import { AUTH_PENDING_IDENTITY, useWorkspaceActions } from "@/hooks/use-workspace";

const ISOLATE_CREATE_PAGE_RENDER = false;
const ISOLATE_CREATE_PREVIEW = true;

const Index = () => {
  const location = useLocation();
  const [posterData, setPosterData] = useState<PosterData | null>(null);
  const [formDraftData, setFormDraftData] = useState<PosterData | null>(null);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [currentDraftTitle, setCurrentDraftTitle] = useState<string | null>(null);
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState<string | null>(null);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const { t } = useLanguage();
  const { identity, plan, userEmail, isAuthResolved, isFreeTier, isPaidTier, isDiamondTier, remainingFreePosters, canGeneratePoster, canDownloadPoster, recordPosterDownload } = useSubscription();
  const workspaceIdentity = isAuthResolved ? identity : AUTH_PENDING_IDENTITY;
  const workspaceEmail = isAuthResolved ? userEmail : null;
  const { saveDraft, trackEvent } = useWorkspaceActions({ identity: workspaceIdentity, userEmail: workspaceEmail, plan });

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
    void trackEvent({
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
      const persistDraft = async () => {
        setIsDraftSaving(true);
        const savedDraft = await saveDraft(currentDraftTitle ?? "Poster draft", formDraftData, currentDraftId);
        setCurrentDraftId(savedDraft.id);
        setCurrentDraftTitle(savedDraft.title);
        setLastSavedSnapshot(JSON.stringify(savedDraft.poster));
        setIsDraftSaving(false);
      };

      void persistDraft();
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

    setPosterData(sanitizedData);
    void trackEvent({
      type: "poster_generated",
      meta: {
        fullName: sanitizedData.fullName || "Untitled memorial",
        format: sanitizedData.format,
        theme: sanitizedData.theme,
      },
    });
    return true;
  };

  const handlePosterDownload = async (data: PosterData, fileType: "jpeg" | "png") => {
    if (!canDownloadPoster) {
      return false;
    }

    const didConsumeQuota = await recordPosterDownload();
    if (!didConsumeQuota) {
      return false;
    }

    void trackEvent({
      type: "poster_downloaded",
      meta: {
        fullName: data.fullName || "Untitled memorial",
        format: data.format,
        theme: data.theme,
        fileType,
      },
    });
    return true;
  };

  const handleSaveDraft = async (title: string, data: PosterData, mode: "update" | "copy" = "update") => {
    setIsDraftSaving(true);
    const shouldUpdateExisting = mode === "update" && Boolean(currentDraftId);
    const savedDraft = await saveDraft(title, data, shouldUpdateExisting ? currentDraftId ?? undefined : undefined);
    setCurrentDraftId(savedDraft.id);
    setCurrentDraftTitle(savedDraft.title);
    setLastSavedSnapshot(JSON.stringify(savedDraft.poster));
    setFormDraftData(savedDraft.poster);
    setIsDraftSaving(false);
  };

  if (!isAuthResolved) {
    return <main className="min-h-screen bg-background flex items-center justify-center">Loading...</main>;
  }

  if (ISOLATE_CREATE_PAGE_RENDER) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto flex min-h-screen max-w-4xl items-center justify-center px-4 py-12">
          <Card className="w-full">
            <CardContent className="space-y-4 py-10 text-center">
              <h1 className="text-3xl font-semibold">{t.mainTitle}</h1>
              <p className="text-muted-foreground">{t.mainSubtitle}</p>
              <p className="text-sm text-muted-foreground">
                Create page isolation mode is active.
              </p>
              <div className="flex justify-center">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  {t.backToDashboard}
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

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
            {ISOLATE_CREATE_PREVIEW ? (
              <Card>
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                  Poster preview isolation is active.
                </CardContent>
              </Card>
            ) : (
              <PosterPreview
                data={posterData}
                isFreeTier={isFreeTier}
                isPaidTier={isPaidTier}
                isDiamondTier={isDiamondTier}
                onDownload={handlePosterDownload}
              />
            )}
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
