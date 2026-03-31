import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import PosterForm from "@/components/PosterForm";
import PosterPreview from "@/components/PosterPreview";
import InfoSections from "@/components/InfoSections";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSubscription } from "@/hooks/use-subscription";
import { AUTH_PENDING_IDENTITY, useWorkspaceActions } from "@/hooks/use-workspace";
import { PosterData } from "@/types/poster";

type DraftLocationState = {
  draftPoster?: PosterData;
  sourceLabel?: string;
  draftId?: string;
  draftTitle?: string;
} | null;

const Index = () => {
  const location = useLocation();
  const { language, t } = useLanguage();
  const isMs = language === "ms";
  const {
    identity,
    plan,
    userEmail,
    isAuthResolved,
    isFreeTier,
    isPaidTier,
    isDiamondTier,
    remainingFreePosters,
    canGeneratePoster,
    canDownloadPoster,
    recordPosterDownload,
  } = useSubscription();
  const workspaceIdentity = isAuthResolved ? identity : AUTH_PENDING_IDENTITY;
  const workspaceEmail = isAuthResolved ? userEmail : null;
  const { saveDraft, trackEvent } = useWorkspaceActions({
    identity: workspaceIdentity,
    userEmail: workspaceEmail,
    plan,
  });

  const draftState = (location.state as DraftLocationState) ?? null;
  const loadedDraft = useMemo(
    () => ({
      poster: draftState?.draftPoster ?? null,
      sourceLabel: draftState?.sourceLabel ?? null,
      draftId: draftState?.draftId ?? null,
      draftTitle: draftState?.draftTitle ?? null,
    }),
    [draftState],
  );

  const [posterData, setPosterData] = useState<PosterData | null>(loadedDraft.poster);
  const [formDraftData, setFormDraftData] = useState<PosterData | null>(loadedDraft.poster);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(loadedDraft.draftId);
  const [currentDraftTitle, setCurrentDraftTitle] = useState<string | null>(loadedDraft.draftTitle);
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState<string | null>(
    loadedDraft.poster ? JSON.stringify(loadedDraft.poster) : null,
  );
  const [isDraftSaving, setIsDraftSaving] = useState(false);

  const hasUnsavedChanges = useMemo(() => {
    if (!isPaidTier || !formDraftData || !lastSavedSnapshot) {
      return false;
    }

    return JSON.stringify(formDraftData) !== lastSavedSnapshot;
  }, [formDraftData, isPaidTier, lastSavedSnapshot]);

  useEffect(() => {
    if (!loadedDraft.poster) {
      return;
    }

    setPosterData(loadedDraft.poster);
    setFormDraftData(loadedDraft.poster);
    setCurrentDraftId(loadedDraft.draftId);
    setCurrentDraftTitle(loadedDraft.draftTitle ?? loadedDraft.sourceLabel ?? "Loaded draft");
    setLastSavedSnapshot(JSON.stringify(loadedDraft.poster));
    void trackEvent({
      type: "draft_loaded",
      meta: {
        source: loadedDraft.sourceLabel ?? "workspace",
      },
    });
  }, [loadedDraft, trackEvent]);

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

  const handleSaveDraft = async (
    title: string,
    data: PosterData,
    mode: "update" | "copy" = "update",
  ) => {
    setIsDraftSaving(true);
    const shouldUpdateExisting = mode === "update" && Boolean(currentDraftId);
    const savedDraft = await saveDraft(
      title,
      data,
      shouldUpdateExisting ? currentDraftId ?? undefined : undefined,
    );
    setCurrentDraftId(savedDraft.id);
    setCurrentDraftTitle(savedDraft.title);
    setLastSavedSnapshot(JSON.stringify(savedDraft.poster));
    setFormDraftData(savedDraft.poster);
    setIsDraftSaving(false);
  };

  const planLabel = isDiamondTier
    ? "Diamond"
    : isPaidTier
      ? "Premium"
      : "Free";

  if (!isAuthResolved) {
    return <main className="flex min-h-screen items-center justify-center bg-background">Loading...</main>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              {t.backToDashboard}
            </Link>
            <div className="flex items-center gap-3">
              <Badge variant="secondary">{planLabel}</Badge>
              <LanguageSwitcher />
            </div>
          </div>
          <h1 className="text-center text-3xl font-bold text-foreground md:text-4xl">
            {t.mainTitle}
          </h1>
          <p className="mt-2 text-center text-muted-foreground">{t.mainSubtitle}</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto mb-6 flex max-w-7xl flex-wrap gap-3">
          {loadedDraft.sourceLabel && (
            <Card className="flex-1 min-w-[260px]">
              <CardContent className="py-4 text-sm text-muted-foreground">
                {isMs ? "Sedang menyunting draf daripada" : "Editing draft from"}{" "}
                <span className="font-medium text-foreground">{loadedDraft.sourceLabel}</span>
              </CardContent>
            </Card>
          )}
          <Card className="flex-1 min-w-[260px]">
            <CardContent className="flex items-center justify-between gap-4 py-4 text-sm">
              <div>
                <p className="font-medium text-foreground">
                  {currentDraftTitle ?? (isMs ? "Draf baharu" : "New draft")}
                </p>
                <p className="text-muted-foreground">
                  {isDraftSaving
                    ? isMs
                      ? "Menyimpan draf..."
                      : "Saving draft..."
                    : hasUnsavedChanges
                      ? isMs
                        ? "Ada perubahan belum disimpan"
                        : "There are unsaved changes"
                      : isMs
                        ? "Tiada perubahan tertunggak"
                        : "No pending changes"}
                </p>
              </div>
              {isPaidTier && (
                <Badge variant={hasUnsavedChanges ? "default" : "secondary"}>
                  {hasUnsavedChanges ? (isMs ? "Belum simpan" : "Unsaved") : (isMs ? "Stabil" : "Stable")}
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
          <div>
            <PosterForm
              isFreeTier={isFreeTier}
              isPaidTier={isPaidTier}
              isDiamondTier={isDiamondTier}
              remainingFreePosters={remainingFreePosters}
              canGeneratePoster={canGeneratePoster}
              initialData={loadedDraft.poster}
              draftTitle={currentDraftTitle}
              isDraftSaving={isDraftSaving}
              hasUnsavedChanges={hasUnsavedChanges}
              onGenerate={handleGenerate}
              onSaveDraft={isPaidTier ? handleSaveDraft : undefined}
              onDataChange={setFormDraftData}
            />
          </div>

          <div className="lg:sticky lg:top-8 h-fit">
            <PosterPreview
              data={posterData}
              isFreeTier={isFreeTier}
              isPaidTier={isPaidTier}
              isDiamondTier={isDiamondTier}
              onDownload={handlePosterDownload}
            />
          </div>
        </div>

        <div className="mt-16">
          <InfoSections />
        </div>
      </main>

      <footer className="mt-16 border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>{t.footerText}</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
