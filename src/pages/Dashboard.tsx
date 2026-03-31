import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Copy, Download, FolderOpen, KeyRound, LogOut, RefreshCw, Sparkles, Trash2, Upload, UserPlus, Users, Wand2 } from "lucide-react";
import { toast } from "sonner";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSubscription } from "@/hooks/use-subscription";
import { AUTH_PENDING_IDENTITY, createEmptyPoster, useWorkspace } from "@/hooks/use-workspace";
import { PosterData } from "@/types/poster";
import { WorkspaceRole } from "@/types/workspace";

type SubscriptionPlanRequestRow = {
  request_id: string;
  user_id: string;
  email: string;
  requested_plan: string;
  status: string;
  requester_note: string | null;
  reviewer_note: string | null;
  reviewed_at: string | null;
  created_at: string;
};

const parseCsvRows = (csvText: string) => {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return {
      posters: [] as PosterData[],
      errors: ["CSV needs a header row and at least one data row."],
    };
  }

  const headers = lines[0].split(",").map((header) => header.trim());
  const posters: PosterData[] = [];
  const errors: string[] = [];

  lines.slice(1).forEach((line, index) => {
    const values = line.split(",").map((value) => value.trim());
    const row = Object.fromEntries(headers.map((header, headerIndex) => [header, values[headerIndex] ?? ""]));

    if (!row.fullName) {
      errors.push(`Row ${index + 2}: fullName is required.`);
      return;
    }

    const poster = createEmptyPoster();
    poster.fullName = row.fullName;
    poster.gender = row.gender === "almarhumah" ? "almarhumah" : "allahyarham";
    poster.birthDate = row.birthDate || "";
    poster.deathDate = row.deathDate || "";
    poster.organization = row.organization || "";
    poster.message = row.message || "";
    poster.from = row.from || "";
    poster.theme = row.theme === "premium" ? "premium" : row.theme === "retro" ? "retro" : "classic";
    poster.format =
      row.format === "instagram-square" ||
      row.format === "instagram-landscape" ||
      row.format === "instagram-portrait" ||
      row.format === "facebook" ||
      row.format === "instagram-story"
        ? row.format
        : "classic";
    poster.whiteLabel = row.whiteLabel === "true";
    posters.push(poster);
  });

  return { posters, errors };
};

const maskSecret = (value: string) => {
  if (value.length <= 8) {
    return "••••••••";
  }

  return `${value.slice(0, 4)}••••••••${value.slice(-4)}`;
};

const formatDate = (value: string | null | undefined, locale: "ms-MY" | "en-MY") => {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isMs = language === "ms";
  const locale = isMs ? "ms-MY" : "en-MY";
  const ui = {
    title: isMs ? "Dashboard Ruang Kerja" : "Workspace Dashboard",
    subtitle: isMs
      ? "Urus draf, batch, kolaborator, import CSV, dan integrasi dari satu tempat."
      : "Manage drafts, batches, collaborators, CSV imports, and integrations in one place.",
    openBuilder: isMs ? "Buka Pembina Poster" : "Open Poster Builder",
    signOut: isMs ? "Log Keluar" : "Sign Out",
    summary: isMs ? "Ringkasan" : "Summary",
    drafts: isMs ? "Draf" : "Drafts",
    batches: isMs ? "Batch" : "Batches",
    team: isMs ? "Pasukan" : "Team",
    apiKeys: isMs ? "Kunci API" : "API Keys",
    imports: isMs ? "Import CSV" : "CSV Import",
    noDrafts: isMs ? "Belum ada draf." : "No drafts yet.",
    noBatches: isMs ? "Belum ada batch." : "No batches yet.",
    noTeam: isMs ? "Belum ada ahli pasukan." : "No team members yet.",
    noApi: isMs ? "Belum ada kunci API." : "No API keys yet.",
    noImports: isMs ? "Belum ada rekod import." : "No import history yet.",
    searchDrafts: isMs ? "Cari draf..." : "Search drafts...",
    batchName: isMs ? "Nama batch" : "Batch name",
    createBatch: isMs ? "Cipta Batch Daripada Pilihan" : "Create Batch from Selection",
    createKey: isMs ? "Jana Kunci API" : "Create API Key",
    addMember: isMs ? "Tambah Ahli" : "Add Member",
    importCsv: isMs ? "Import CSV" : "Import CSV",
    copyLink: isMs ? "Salin Pautan" : "Copy Link",
    rotate: isMs ? "Putar Semula" : "Rotate",
    revoke: isMs ? "Nyahaktif" : "Revoke",
    delete: isMs ? "Padam" : "Delete",
    open: isMs ? "Buka" : "Open",
    rename: isMs ? "Namakan Semula" : "Rename",
    accept: isMs ? "Terima" : "Accept",
    resend: isMs ? "Hantar Semula" : "Resend",
    created: isMs ? "Dicipta" : "Created",
    updated: isMs ? "Dikemas kini" : "Updated",
    itemCount: isMs ? "jumlah item" : "items",
    draftCount: isMs ? "Draf" : "Drafts",
    batchCount: isMs ? "Batch" : "Batches",
    teamCount: isMs ? "Ahli" : "Members",
    generatedCount: isMs ? "Poster dijana" : "Posters generated",
    email: isMs ? "Emel" : "Email",
    name: isMs ? "Nama" : "Name",
    role: isMs ? "Peranan" : "Role",
    status: isMs ? "Status" : "Status",
    apiName: isMs ? "Nama integrasi" : "Integration name",
    csvName: isMs ? "Nama import" : "Import name",
    csvData: isMs ? "Data CSV" : "CSV data",
    retrySync: isMs ? "Cuba Segerak Semula" : "Retry Sync",
    remoteError: isMs ? "Ralat segerak awan" : "Cloud sync error",
    syncReady: isMs ? "Disimpan ke awan" : "Saved to cloud",
    syncPending: isMs ? "Menyegerak..." : "Syncing...",
    loading: isMs ? "Memuatkan..." : "Loading...",
    basicMemorial: isMs ? "Basic Memorial" : "Basic Memorial",
    foreverFreePrice: isMs ? "RM 0 / selamanya" : "RM 0 / forever",
    freeTierIntro: isMs
      ? "Sesuai untuk pengguna kasual dan pencipta kali pertama. Semua yang penting disusun supaya anda boleh cipta poster, simpan draf, dan sambung kerja dengan cepat."
      : "Ideal for casual users and first-time creators. Everything important is arranged so you can create posters, save drafts, and continue your work quickly.",
    resumeLatestDraft: isMs ? "Sambung Draf Terakhir" : "Resume Latest Draft",
    freeTierRemainingMonth: isMs ? "baki bulan ini" : "left this month",
    readyToReopen: isMs ? "Sedia untuk dibuka semula" : "Ready to reopen",
    downloadsThisMonth: isMs ? "Muat turun bulan ini" : "Downloads this month",
    quotaUsed: isMs ? "Kuota yang sudah digunakan" : "Quota already used",
    remainingDownloads: isMs ? "Baki muat turun" : "Remaining downloads",
    stillAvailableToDownload: isMs ? "Masih boleh dimuat turun" : "Still available to download",
    selectedDraftsForBatch: isMs ? "draf dipilih untuk batch" : "drafts selected for batching",
    selectDraftsForBatch: isMs
      ? "Pilih beberapa draf untuk gabungkan menjadi satu batch"
      : "Select a few drafts to combine into one batch",
    bestFlowTip: isMs
      ? "Aliran terbaik: cipta poster, simpan draf, kemudian pilih draf yang mahu digabungkan."
      : "Best flow: create posters, save drafts, then select the ones you want to group together.",
    includedInFree: isMs ? "Apa yang termasuk dalam Free" : "What is included in Free",
    includedInFreeDesc: isMs
      ? "Pakej ini mengikuti akses asas untuk pencipta memorial yang mahu bermula dengan mudah."
      : "This plan follows the core access for memorial creators who want a simple starting point.",
    planLimitSummary: isMs ? "Ringkasan had pelan" : "Plan limit summary",
    planLimitSummaryDesc: isMs
      ? "Perkara utama yang perlu diketahui sebelum anda mula mencipta."
      : "The key things to know before you start creating.",
    support: isMs ? "Sokongan" : "Support",
    basicFaqSupport: isMs ? "Sokongan asas melalui FAQ" : "Basic support through FAQ",
    availableFormats: isMs ? "Format tersedia" : "Available formats",
    importantNote: isMs ? "Catatan penting" : "Important note",
    freePlanNote: isMs
      ? "Pelan Free direka untuk penggunaan ringan. Untuk kawalan lebih luas, pengguna boleh naik taraf kemudian."
      : "The Free plan is designed for light usage. Users can upgrade later for broader control.",
    draftsShown: isMs ? "draf dipaparkan" : "drafts shown",
    freeDraftsFocus: isMs
      ? "Fokus pada draf yang sedang anda siapkan. Buka semula, namakan semula, padam, atau pilih untuk batch."
      : "Focus on the drafts you are actively working on. Reopen, rename, delete, or select them for a batch.",
    freeDraftsEmpty: isMs
      ? "Mula dengan satu poster baru. Draf yang anda simpan akan muncul di sini."
      : "Start with a new poster. Drafts you save will appear here.",
    freeBatchesEmpty: isMs
      ? "Pilih beberapa draf dan cipta batch bila anda mahu urus poster secara berkumpulan."
      : "Select a few drafts and create a batch when you want to manage posters together.",
    easiestWayTitle: isMs ? "Cara paling mudah guna" : "The easiest way to use it",
    easiestWaySteps: isMs
      ? [
          "Klik Buka Pembina Poster",
          "Jana poster dan simpan sebagai draf",
          "Kembali ke sini untuk buka semula atau batch-kan draf",
        ]
      : [
          "Click Open Poster Builder",
          "Generate a poster and save it as a draft",
          "Come back here to reopen or batch your drafts",
        ],
    freeFeatures: isMs
      ? [
          "5 poster sebulan",
          "Classic (4:3) & Instagram Story (9:16)",
          "Tema asas: Classic & Retro",
          "Resolusi standard 1080p",
          "Muat naik foto & grayscale",
          "Medan borang asas",
          "Doa Islamik standard",
          "Muat turun dengan watermark",
        ]
      : [
          "5 posters per month",
          "Classic (4:3) & Instagram Story (9:16)",
          "Basic themes: Classic & Retro",
          "Standard resolution 1080p",
          "Photo upload & grayscale",
          "Basic form fields",
          "Standard Islamic prayer",
          "Watermarked downloads",
        ],
    premiumMemorial: isMs ? "Premium Memorial" : "Premium Memorial",
    premiumPrice: isMs ? "RM 39.90 / sebulan" : "RM 39.90 / month",
    premiumIntro: isMs
      ? "Direka untuk keluarga, organisasi kecil, dan pasukan yang perlukan kawalan lebih lengkap, akses pantas, dan hasil yang lebih kemas."
      : "Built for families, small organizations, and teams that need fuller control, faster access, and a more polished output.",
    premiumHeroNote: isMs
      ? "Semua ciri premium anda dikumpulkan di satu ruang kerja yang lebih teratur."
      : "All your premium capabilities are gathered into one more organized workspace.",
    premiumFeaturesTitle: isMs ? "Kelebihan Premium" : "Premium advantages",
    premiumFeatures: isMs
      ? [
          "Poster tanpa had",
          "Semua format media sosial",
          "Tema premium & corak",
          "Resolusi tinggi (4K)",
          "Muat turun tanpa tanda air",
          "Simpanan awan, batch & kolaborasi",
        ]
      : [
          "Unlimited posters",
          "All social media formats",
          "Premium themes and patterns",
          "High-resolution 4K output",
          "Downloads without watermarks",
          "Cloud drafts, batching, and collaboration",
        ],
    premiumQuickActions: isMs ? "Tindakan Pantas" : "Quick actions",
    premiumWorkspaceFlow: isMs ? "Aliran kerja Premium" : "Premium workflow",
    premiumDraftsFocus: isMs
      ? "Buka semula, pilih, dan susun draf dengan lebih cepat sebelum dijadikan batch atau dihantar semula kepada pasukan."
      : "Reopen, select, and organize drafts faster before turning them into batches or sharing them with your team.",
    premiumBatchesFocus: isMs
      ? "Gabungkan poster daripada draf atau CSV untuk kempen memorial yang lebih besar."
      : "Combine posters from drafts or CSV into larger memorial campaigns.",
    premiumTeamFocus: isMs
      ? "Urus kolaborator, jemputan, dan peranan dalam satu panel yang jelas."
      : "Manage collaborators, invites, and roles in one clear panel.",
    premiumApiFocus: isMs
      ? "Sediakan integrasi dengan kunci API yang mudah dijana dan diputar semula."
      : "Set up integrations with API keys that are easy to generate and rotate.",
    premiumImportFocus: isMs
      ? "Percepat penciptaan memorial berskala dengan import CSV dan sejarah proses."
      : "Speed up larger memorial creation with CSV import and processing history.",
    premiumResumeDraft: isMs ? "Sambung Draf Pilihan" : "Resume Selected Draft",
    premiumManageTeam: isMs ? "Urus Pasukan" : "Manage Team",
    premiumGenerateApi: isMs ? "Jana Integrasi" : "Generate Integration",
    premiumSummaryHint: isMs ? "Ringkasan prestasi ruang kerja" : "Workspace performance snapshot",
    premiumTrialBadge: isMs ? "Percubaan Premium" : "Premium Trial",
    premiumTrialRemaining: isMs ? "hari lagi" : "days left",
    premiumTrialEndsOn: isMs ? "Percubaan tamat pada" : "Trial ends on",
    premiumTrialDownloads: isMs ? "Muat turun trial Premium" : "Premium trial downloads",
    premiumTrialExpiredTitle: isMs ? "Percubaan Premium tamat" : "Premium trial ended",
    premiumTrialExpiredDescription: isMs
      ? "Akses Premium anda hanya aktif untuk 14 hari selepas pendaftaran pertama. Akaun ini kini kembali ke ciri Free."
      : "Your Premium access is only active for 14 days after first registration. This account has now returned to Free features.",
    requestPremiumTitle: isMs ? "Mohon naik taraf ke Premium" : "Request a Premium upgrade",
    requestPremiumDescription: isMs
      ? "Jika anda bermula dengan pelan Free, permintaan naik taraf mesti disemak oleh superadmin terlebih dahulu."
      : "If you started on the Free plan, upgrade requests must be reviewed by a superadmin first.",
    requestPremiumButton: isMs ? "Hantar Permintaan Premium" : "Send Premium Request",
    requestPendingTitle: isMs ? "Permintaan sedang disemak" : "Request under review",
    requestPendingDescription: isMs
      ? "Permintaan anda sedang menunggu kelulusan superadmin."
      : "Your request is waiting for superadmin approval.",
    requestRejectedTitle: isMs ? "Permintaan ditolak" : "Request declined",
    requestApprovedTitle: isMs ? "Permintaan diluluskan" : "Request approved",
    requestAdminTitle: isMs ? "Permintaan naik taraf" : "Upgrade requests",
    requestAdminDescription: isMs
      ? "Semak dan luluskan permintaan pengguna Free untuk akses Premium."
      : "Review and approve Free user requests for Premium access.",
    approve: isMs ? "Luluskan" : "Approve",
    reject: isMs ? "Tolak" : "Reject",
    noRequests: isMs ? "Tiada permintaan naik taraf." : "No upgrade requests.",
  };

  const {
    identity,
    plan,
    subscriptionPlan,
    isAuthResolved,
    isFreeTier,
    isSuperadmin,
    isDiamondTier,
    isPaidTier,
    isPremiumTrialActive,
    hasPremiumTrialExpired,
    premiumTrialEndsAt,
    premiumTrialDaysRemaining,
    premiumTrialDownloadCount,
    premiumTrialDownloadsRemaining,
    premiumTrialDownloadLimit,
    latestPlanRequestStatus,
    latestPlanRequestReviewedAt,
    latestPlanRequestReviewerNote,
    refreshAccessStatus,
    monthlyPosterCount,
    remainingFreePosters,
    userEmail,
  } = useSubscription();
  const workspaceIdentity = isAuthResolved ? identity : AUTH_PENDING_IDENTITY;
  const workspaceEmail = isAuthResolved ? userEmail : null;
  const {
    drafts,
    batches,
    team,
    apiCredentials,
    importJobs,
    summary,
    isRemoteReady,
    isSyncing,
    remoteError,
    retryRemoteSync,
    deleteDraft,
    renameDraft,
    createBatch,
    deleteBatch,
    addTeamMember,
    acceptTeamMemberInvite,
    resendTeamMemberInvite,
    deleteTeamMember,
    createApiCredential,
    rotateApiCredential,
    revokeApiCredential,
    deleteApiCredential,
    createImportJob,
  } = useWorkspace({ identity: workspaceIdentity, userEmail: workspaceEmail, plan });

  const [draftSearch, setDraftSearch] = useState("");
  const [selectedDraftIds, setSelectedDraftIds] = useState<string[]>([]);
  const [batchName, setBatchName] = useState("");
  const [memberName, setMemberName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState<WorkspaceRole>("editor");
  const [apiKeyName, setApiKeyName] = useState("Dashboard integration");
  const [csvName, setCsvName] = useState("CSV import");
  const [csvText, setCsvText] = useState(
    "fullName,gender,organization,from\nAhmad bin Abdullah,allahyarham,Masjid Al Ikhlas,Keluarga Ahmad",
  );
  const [planRequests, setPlanRequests] = useState<SubscriptionPlanRequestRow[]>([]);
  const [isRequestSubmitting, setIsRequestSubmitting] = useState(false);
  const [isRequestListLoading, setIsRequestListLoading] = useState(false);

  const planLabel = isSuperadmin ? "Superadmin" : isPaidTier ? "Premium" : "Free";

  useEffect(() => {
    if (!isSuperadmin) {
      setPlanRequests([]);
      return;
    }

    const loadPlanRequests = async () => {
      setIsRequestListLoading(true);
      const { data, error } = await supabase.rpc("admin_list_subscription_plan_requests");
      setIsRequestListLoading(false);

      if (error || !data) {
        toast.error(isMs ? "Gagal memuatkan permintaan naik taraf." : "Failed to load upgrade requests.");
        return;
      }

      setPlanRequests(data);
    };

    void loadPlanRequests();
  }, [isMs, isSuperadmin]);

  const filteredDrafts = useMemo(() => {
    const keyword = draftSearch.trim().toLowerCase();
    if (!keyword) {
      return drafts;
    }

    return drafts.filter((draft) => {
      const haystack = [
        draft.title,
        draft.poster.fullName,
        draft.poster.organization ?? "",
        draft.poster.from,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(keyword);
    });
  }, [draftSearch, drafts]);

  const selectedDrafts = useMemo(
    () => drafts.filter((draft) => selectedDraftIds.includes(draft.id)),
    [drafts, selectedDraftIds],
  );

  const handleToggleDraft = (draftId: string) => {
    setSelectedDraftIds((current) =>
      current.includes(draftId)
        ? current.filter((id) => id !== draftId)
        : [...current, draftId],
    );
  };

  const handleOpenDraft = (draftId: string) => {
    const draft = drafts.find((item) => item.id === draftId);
    if (!draft) {
      return;
    }

    navigate("/create", {
      state: {
        draftPoster: draft.poster,
        sourceLabel: draft.title,
        draftId: draft.id,
        draftTitle: draft.title,
      },
    });
  };

  const handleRenameDraft = (draftId: string, currentTitle: string) => {
    const nextTitle = window.prompt(ui.rename, currentTitle);
    if (!nextTitle) {
      return;
    }

    renameDraft(draftId, nextTitle);
    toast.success(isMs ? "Nama draf dikemas kini." : "Draft title updated.");
  };

  const handleCreateBatch = () => {
    if (selectedDrafts.length === 0) {
      toast.error(isMs ? "Pilih sekurang-kurangnya satu draf." : "Select at least one draft.");
      return;
    }

    const nextName = batchName.trim() || `${isMs ? "Batch" : "Batch"} ${new Date().toLocaleDateString(locale)}`;
    createBatch(nextName, selectedDrafts.map((draft) => draft.poster), "manual");
    setBatchName("");
    setSelectedDraftIds([]);
    toast.success(isMs ? "Batch berjaya dicipta." : "Batch created successfully.");
  };

  const handleAddMember = () => {
    if (!memberName.trim() || !memberEmail.trim()) {
      toast.error(isMs ? "Nama dan emel diperlukan." : "Name and email are required.");
      return;
    }

    addTeamMember(memberName.trim(), memberEmail.trim(), memberRole);
    setMemberName("");
    setMemberEmail("");
    setMemberRole("editor");
    toast.success(isMs ? "Ahli pasukan ditambah." : "Team member added.");
  };

  const handleCreateApiKey = () => {
    if (!apiKeyName.trim()) {
      toast.error(isMs ? "Nama integrasi diperlukan." : "Integration name is required.");
      return;
    }

    const credential = createApiCredential(apiKeyName.trim());
    setApiKeyName("Dashboard integration");
    void navigator.clipboard?.writeText(credential.token);
    toast.success(
      isMs
        ? "Kunci API dijana dan disalin ke clipboard."
        : "API key generated and copied to clipboard.",
    );
  };

  const handleImportCsv = () => {
    const { posters, errors } = parseCsvRows(csvText);
    createImportJob(csvName.trim() || "CSV import", posters.length + errors.length, posters.length, errors);

    if (posters.length > 0) {
      createBatch(csvName.trim() || "CSV import", posters, "csv");
    }

    if (errors.length > 0) {
      toast.error(isMs ? "CSV diproses dengan ralat." : "CSV processed with errors.");
      return;
    }

    toast.success(isMs ? "CSV berjaya diimport." : "CSV imported successfully.");
  };

  const handleCopyInvite = async (inviteLink?: string) => {
    if (!inviteLink) {
      return;
    }

    await navigator.clipboard.writeText(inviteLink);
    toast.success(isMs ? "Pautan jemputan disalin." : "Invite link copied.");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleSubmitPremiumRequest = async () => {
    setIsRequestSubmitting(true);
    const { error } = await supabase.rpc("submit_subscription_plan_request", {
      requested_plan_value: "premium",
    });
    setIsRequestSubmitting(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    await refreshAccessStatus();
    toast.success(isMs ? "Permintaan Premium berjaya dihantar." : "Premium request submitted successfully.");
  };

  const handleResolvePlanRequest = async (requestId: string, approveRequest: boolean) => {
    const { error } = await supabase.rpc("admin_resolve_subscription_plan_request", {
      request_id_value: requestId,
      approve: approveRequest,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    setPlanRequests((currentRequests) =>
      currentRequests.map((requestRow) =>
        requestRow.request_id === requestId
          ? {
              ...requestRow,
              status: approveRequest ? "approved" : "rejected",
              reviewed_at: new Date().toISOString(),
            }
          : requestRow,
      ),
    );
    toast.success(approveRequest ? (isMs ? "Permintaan diluluskan." : "Request approved.") : (isMs ? "Permintaan ditolak." : "Request rejected."));
  };

  if (!isAuthResolved) {
    return <main className="flex min-h-screen items-center justify-center bg-background">{ui.loading}</main>;
  }

  if (isFreeTier) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 p-4 md:p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          {hasPremiumTrialExpired && (
            <Card className="border-amber-200/70 bg-amber-50/70 shadow-sm dark:border-amber-900/60 dark:bg-amber-950/20">
              <CardContent className="p-5">
                <p className="font-semibold">{ui.premiumTrialExpiredTitle}</p>
                <p className="mt-1 text-sm text-muted-foreground">{ui.premiumTrialExpiredDescription}</p>
              </CardContent>
            </Card>
          )}
          <Card className="overflow-hidden border-border/60 shadow-sm">
            <CardContent className="p-0">
              <div className="grid gap-0 lg:grid-cols-[1.25fr_0.75fr]">
                <div className="space-y-5 p-6 md:p-8">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="secondary">{ui.basicMemorial}</Badge>
                    <Badge variant="outline">{planLabel}</Badge>
                    <Badge variant="outline">
                      <Download className="mr-2 h-3.5 w-3.5" />
                      {`${remainingFreePosters} ${ui.freeTierRemainingMonth}`}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{ui.title}</h1>
                    <p className="text-sm font-medium text-primary">{ui.foreverFreePrice}</p>
                    <p className="max-w-2xl text-muted-foreground">{ui.freeTierIntro}</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button asChild size="lg">
                      <Link to="/create">
                        <FolderOpen className="mr-2 h-4 w-4" />
                        {ui.openBuilder}
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => {
                        const firstDraft = drafts[0];
                        if (firstDraft) {
                          handleOpenDraft(firstDraft.id);
                          return;
                        }
                        navigate("/create");
                      }}
                    >
                      {ui.resumeLatestDraft}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {isMs ? "Log masuk sebagai" : "Signed in as"} {userEmail ?? "-"}
                  </p>
                </div>

                <div className="grid gap-3 border-t bg-muted/40 p-6 md:grid-cols-3 lg:border-l lg:border-t-0 lg:grid-cols-1 lg:p-8">
                  {[
                    {
                      label: ui.draftCount,
                      value: summary.draftCount,
                      hint: ui.readyToReopen,
                    },
                    {
                      label: ui.downloadsThisMonth,
                      value: monthlyPosterCount,
                      hint: ui.quotaUsed,
                    },
                    {
                      label: ui.remainingDownloads,
                      value: remainingFreePosters,
                      hint: ui.stillAvailableToDownload,
                    },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border bg-background p-4">
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                      <p className="mt-2 text-3xl font-semibold">{item.value}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{item.hint}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <section className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
            <div className="rounded-2xl border bg-background p-4 shadow-sm">
              <p className="text-sm font-medium">
                {selectedDraftIds.length > 0
                  ? isMs
                    ? `${selectedDraftIds.length} ${ui.selectedDraftsForBatch}`
                    : `${selectedDraftIds.length} ${ui.selectedDraftsForBatch}`
                  : isMs
                    ? ui.selectDraftsForBatch
                    : ui.selectDraftsForBatch}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{ui.bestFlowTip}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <LanguageSwitcher />
              <Button variant="destructive" onClick={() => void handleLogout()}>
                <LogOut className="mr-2 h-4 w-4" />
                {ui.signOut}
              </Button>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>{ui.includedInFree}</CardTitle>
                <CardDescription>{ui.includedInFreeDesc}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                {ui.freeFeatures.map((feature) => (
                  <div key={feature} className="rounded-xl border bg-muted/20 px-4 py-3 text-sm">
                    {feature}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>{ui.planLimitSummary}</CardTitle>
                <CardDescription>{ui.planLimitSummaryDesc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="rounded-2xl border bg-background p-4">
                  <p className="font-medium">
                    {latestPlanRequestStatus === "pending"
                      ? ui.requestPendingTitle
                      : latestPlanRequestStatus === "rejected"
                        ? ui.requestRejectedTitle
                        : latestPlanRequestStatus === "approved"
                          ? ui.requestApprovedTitle
                          : ui.requestPremiumTitle}
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    {latestPlanRequestStatus === "pending" ? ui.requestPendingDescription : ui.requestPremiumDescription}
                  </p>
                  {latestPlanRequestStatus === "rejected" && latestPlanRequestReviewerNote && (
                    <p className="mt-2 text-xs text-muted-foreground">{latestPlanRequestReviewerNote}</p>
                  )}
                  {latestPlanRequestStatus !== "pending" && latestPlanRequestStatus !== "approved" && (
                    <Button className="mt-4" onClick={() => void handleSubmitPremiumRequest()} disabled={isRequestSubmitting}>
                      {ui.requestPremiumButton}
                    </Button>
                  )}
                  {latestPlanRequestStatus === "approved" && latestPlanRequestReviewedAt && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {ui.updated}: {formatDate(latestPlanRequestReviewedAt, locale)}
                    </p>
                  )}
                </div>
                <div className="rounded-2xl border bg-background p-4">
                  <p className="font-medium">{ui.support}</p>
                  <p className="mt-1 text-muted-foreground">{ui.basicFaqSupport}</p>
                </div>
                <div className="rounded-2xl border bg-background p-4">
                  <p className="font-medium">{ui.availableFormats}</p>
                  <p className="mt-1 text-muted-foreground">
                    {isMs ? "Classic (4:3) dan Instagram Story (9:16)" : "Classic (4:3) and Instagram Story (9:16)"}
                  </p>
                </div>
                <div className="rounded-2xl border bg-background p-4">
                  <p className="font-medium">{ui.importantNote}</p>
                  <p className="mt-1 text-muted-foreground">{ui.freePlanNote}</p>
                </div>
              </CardContent>
            </Card>
          </section>

          {(remoteError || !isRemoteReady || isSyncing) && (
            <Card className="border-amber-200/60 bg-amber-50/50 dark:border-amber-900/60 dark:bg-amber-950/20">
              <CardContent className="flex flex-col gap-3 p-4 text-sm md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-medium">
                    {remoteError ? ui.remoteError : isSyncing ? ui.syncPending : ui.syncReady}
                  </p>
                  {remoteError && <p className="text-muted-foreground">{remoteError}</p>}
                </div>
                {remoteError && (
                  <Button variant="outline" onClick={retryRemoteSync}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {ui.retrySync}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
            <Card className="shadow-sm">
              <CardHeader className="gap-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <CardTitle>{ui.drafts}</CardTitle>
                    <CardDescription>{ui.freeDraftsFocus}</CardDescription>
                  </div>
                  <div className="rounded-xl border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                    {`${filteredDrafts.length} ${ui.draftsShown}`}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder={ui.searchDrafts}
                  value={draftSearch}
                  onChange={(event) => setDraftSearch(event.target.value)}
                />
                <div className="space-y-3">
                  {filteredDrafts.length === 0 ? (
                    <div className="rounded-2xl border border-dashed p-8 text-center">
                      <p className="font-medium">{ui.noDrafts}</p>
                      <p className="mt-2 text-sm text-muted-foreground">{ui.freeDraftsEmpty}</p>
                      <Button asChild className="mt-4">
                        <Link to="/create">{ui.openBuilder}</Link>
                      </Button>
                    </div>
                  ) : (
                    filteredDrafts.map((draft) => (
                      <div
                        key={draft.id}
                        className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-background p-4 transition-colors hover:bg-muted/30 md:flex-row md:items-center md:justify-between"
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            className="mt-1"
                            checked={selectedDraftIds.includes(draft.id)}
                            onChange={() => handleToggleDraft(draft.id)}
                          />
                          <div className="space-y-1">
                            <p className="font-medium">{draft.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {draft.poster.fullName || "-"} • {draft.poster.format}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {ui.updated}: {formatDate(draft.updatedAt, locale)}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleOpenDraft(draft.id)}>
                            {ui.open}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleRenameDraft(draft.id, draft.title)}>
                            {ui.rename}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteDraft(draft.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            {ui.delete}
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="rounded-2xl border bg-muted/30 p-4">
                  <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                    <Input
                      placeholder={ui.batchName}
                      value={batchName}
                      onChange={(event) => setBatchName(event.target.value)}
                    />
                    <Button onClick={handleCreateBatch}>{ui.createBatch}</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>{ui.batches}</CardTitle>
                  <CardDescription>
                    {isMs
                      ? "Kumpulan poster yang anda hasilkan daripada draf."
                      : "Poster groups you created from your drafts."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {batches.length === 0 ? (
                    <div className="rounded-2xl border border-dashed p-6 text-center">
                      <p className="font-medium">{ui.noBatches}</p>
                      <p className="mt-2 text-sm text-muted-foreground">{ui.freeBatchesEmpty}</p>
                    </div>
                  ) : (
                    batches.slice(0, 5).map((batch) => (
                      <div key={batch.id} className="rounded-2xl border border-border/70 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium">{batch.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {batch.items.length} {ui.itemCount}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => deleteBatch(batch.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            {ui.delete}
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>{ui.easiestWayTitle}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  {ui.easiestWaySteps.map((step, index) => (
                    <div key={step} className="flex items-start gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {index + 1}
                      </div>
                      <p className="pt-1 text-muted-foreground">{step}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.08),_transparent_28%),radial-gradient(circle_at_100%_0%,_rgba(196,149,89,0.18),_transparent_30%),linear-gradient(to_bottom,_hsl(var(--background)),_hsl(var(--muted)/0.35))] p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <Card className="overflow-hidden border-border/60 bg-card/95 shadow-xl">
          <CardContent className="p-0">
            <div className="grid gap-0 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-6 p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge className="bg-primary text-primary-foreground">
                    <Sparkles className="mr-2 h-3.5 w-3.5" />
                    {ui.premiumMemorial}
                  </Badge>
                  <Badge variant="outline">{planLabel}</Badge>
                  <Badge variant="outline">{ui.premiumPrice}</Badge>
                  {isPremiumTrialActive && (
                    <Badge variant="secondary">
                      {ui.premiumTrialBadge} • {premiumTrialDaysRemaining ?? 0} {ui.premiumTrialRemaining}
                    </Badge>
                  )}
                </div>
                <div className="space-y-3">
                  <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{ui.title}</h1>
                  <p className="max-w-3xl text-muted-foreground">{ui.premiumIntro}</p>
                  <p className="text-sm text-primary">{ui.premiumHeroNote}</p>
                  {isPremiumTrialActive && premiumTrialEndsAt && (
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>{ui.premiumTrialEndsOn} {formatDate(premiumTrialEndsAt, locale)}</p>
                      <p>
                        {ui.premiumTrialDownloads}: {premiumTrialDownloadCount}/{premiumTrialDownloadLimit}
                        {" • "}
                        {premiumTrialDownloadsRemaining} {isMs ? "baki" : "remaining"}
                      </p>
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {isMs ? "Log masuk sebagai" : "Signed in as"} {userEmail ?? "-"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button asChild size="lg">
                    <Link to="/create">
                      <Wand2 className="mr-2 h-4 w-4" />
                      {ui.openBuilder}
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      const firstDraft = drafts[0];
                      if (firstDraft) {
                        handleOpenDraft(firstDraft.id);
                        return;
                      }
                      navigate("/create");
                    }}
                  >
                    <FolderOpen className="mr-2 h-4 w-4" />
                    {ui.premiumResumeDraft}
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {ui.premiumFeatures.map((feature) => (
                    <div key={feature} className="rounded-2xl border border-border/60 bg-background/80 px-4 py-3 text-sm shadow-sm">
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t bg-muted/40 p-6 md:p-8 xl:border-l xl:border-t-0">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{ui.premiumQuickActions}</p>
                    <p className="text-sm text-muted-foreground">{ui.premiumSummaryHint}</p>
                  </div>
                  <LanguageSwitcher />
                </div>
                <div className="mt-5 grid gap-3">
                  <Button asChild variant="secondary" className="justify-start">
                    <Link to="/create">
                      <FolderOpen className="mr-2 h-4 w-4" />
                      {ui.openBuilder}
                    </Link>
                  </Button>
                  <Button variant="outline" className="justify-start" onClick={handleCreateBatch}>
                    <Download className="mr-2 h-4 w-4" />
                    {ui.createBatch}
                  </Button>
                  <Button variant="outline" className="justify-start" onClick={handleAddMember}>
                    <Users className="mr-2 h-4 w-4" />
                    {ui.premiumManageTeam}
                  </Button>
                  <Button variant="outline" className="justify-start" onClick={handleCreateApiKey}>
                    <KeyRound className="mr-2 h-4 w-4" />
                    {ui.premiumGenerateApi}
                  </Button>
                  <Button variant="destructive" className="justify-start" onClick={() => void handleLogout()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {ui.signOut}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {(remoteError || !isRemoteReady || isSyncing) && (
          <Card className="border-amber-200/60 bg-amber-50/50 dark:border-amber-900/60 dark:bg-amber-950/20">
            <CardContent className="flex flex-col gap-3 p-4 text-sm md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-medium">
                  {remoteError ? ui.remoteError : isSyncing ? ui.syncPending : ui.syncReady}
                </p>
                {remoteError && <p className="text-muted-foreground">{remoteError}</p>}
              </div>
              {remoteError && (
                <Button variant="outline" onClick={retryRemoteSync}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {ui.retrySync}
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: ui.draftCount, value: summary.draftCount, hint: ui.premiumDraftsFocus },
            { label: ui.batchCount, value: summary.batchCount, hint: ui.premiumBatchesFocus },
            { label: ui.teamCount, value: summary.teamCount, hint: ui.premiumTeamFocus },
            { label: ui.generatedCount, value: summary.totalGenerated, hint: ui.premiumApiFocus },
          ].map((item) => (
            <Card key={item.label} className="border-border/60 bg-card/95 shadow-sm">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="mt-2 text-3xl font-semibold">{item.value}</p>
                <p className="mt-2 text-sm text-muted-foreground">{item.hint}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <Card className="border-border/60 bg-card/95 shadow-sm">
            <CardHeader>
              <CardTitle>{ui.drafts}</CardTitle>
              <CardDescription>{ui.premiumDraftsFocus}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder={ui.searchDrafts}
                value={draftSearch}
                onChange={(event) => setDraftSearch(event.target.value)}
              />
              <div className="space-y-3">
                {filteredDrafts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{ui.noDrafts}</p>
                ) : (
                  filteredDrafts.map((draft) => (
                    <div
                      key={draft.id}
                      className="flex flex-col gap-3 rounded-xl border border-border p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          className="mt-1"
                          checked={selectedDraftIds.includes(draft.id)}
                          onChange={() => handleToggleDraft(draft.id)}
                        />
                        <div>
                          <p className="font-medium">{draft.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {draft.poster.fullName || "-"} • {draft.poster.format} • {draft.poster.theme}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {ui.updated}: {formatDate(draft.updatedAt, locale)}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleOpenDraft(draft.id)}>
                          {ui.open}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleRenameDraft(draft.id, draft.title)}>
                          {ui.rename}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteDraft(draft.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          {ui.delete}
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <Input
                  placeholder={ui.batchName}
                  value={batchName}
                  onChange={(event) => setBatchName(event.target.value)}
                />
                <Button onClick={handleCreateBatch}>{ui.createBatch}</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/95 shadow-sm">
            <CardHeader>
              <CardTitle>{ui.batches}</CardTitle>
              <CardDescription>{ui.premiumBatchesFocus}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {batches.length === 0 ? (
                <p className="text-sm text-muted-foreground">{ui.noBatches}</p>
              ) : (
                batches.map((batch) => (
                  <div key={batch.id} className="rounded-xl border border-border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{batch.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {batch.items.length} {ui.itemCount} • {batch.source}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {ui.updated}: {formatDate(batch.updatedAt, locale)}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => deleteBatch(batch.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        {ui.delete}
                      </Button>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {batch.items.slice(0, 6).map((item) => (
                        <Badge key={item.id} variant="outline">
                          {item.poster.fullName || "Untitled"}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border/60 bg-card/95 shadow-sm">
            <CardHeader>
              <CardTitle>{ui.team}</CardTitle>
              <CardDescription>{ui.premiumTeamFocus}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{ui.name}</Label>
                  <Input value={memberName} onChange={(event) => setMemberName(event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{ui.email}</Label>
                  <Input value={memberEmail} onChange={(event) => setMemberEmail(event.target.value)} />
                </div>
              </div>
              <div className="flex flex-wrap items-end gap-3">
                <div className="space-y-2">
                  <Label>{ui.role}</Label>
                  <select
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    value={memberRole}
                    onChange={(event) => setMemberRole(event.target.value as WorkspaceRole)}
                  >
                    <option value="owner">owner</option>
                    <option value="admin">admin</option>
                    <option value="editor">editor</option>
                    <option value="viewer">viewer</option>
                  </select>
                </div>
                <Button onClick={handleAddMember}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  {ui.addMember}
                </Button>
              </div>
              <div className="space-y-3">
                {team.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{ui.noTeam}</p>
                ) : (
                  team.map((member) => (
                    <div key={member.id} className="rounded-xl border border-border p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <Badge variant="outline">{member.role}</Badge>
                            <Badge variant={member.status === "accepted" ? "secondary" : "default"}>
                              {member.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {member.status === "pending" && (
                            <>
                              <Button size="sm" variant="outline" onClick={() => void handleCopyInvite(member.inviteLink)}>
                                <Copy className="mr-2 h-4 w-4" />
                                {ui.copyLink}
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => resendTeamMemberInvite(member.id)}>
                                {ui.resend}
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => acceptTeamMemberInvite(member.id)}>
                                {ui.accept}
                              </Button>
                            </>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => deleteTeamMember(member.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            {ui.delete}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/95 shadow-sm">
            <CardHeader>
              <CardTitle>{ui.apiKeys}</CardTitle>
              <CardDescription>{ui.premiumApiFocus}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-end gap-3">
                <div className="min-w-[240px] flex-1 space-y-2">
                  <Label>{ui.apiName}</Label>
                  <Input value={apiKeyName} onChange={(event) => setApiKeyName(event.target.value)} />
                </div>
                <Button onClick={handleCreateApiKey}>
                  <KeyRound className="mr-2 h-4 w-4" />
                  {ui.createKey}
                </Button>
              </div>
              <div className="space-y-3">
                {apiCredentials.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{ui.noApi}</p>
                ) : (
                  apiCredentials.map((credential) => (
                    <div key={credential.id} className="rounded-xl border border-border p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="font-medium">{credential.name}</p>
                          <p className="text-sm text-muted-foreground">{maskSecret(credential.token)}</p>
                          <p className="text-xs text-muted-foreground">
                            {ui.updated}: {formatDate(credential.updatedAt, locale)}
                          </p>
                          {credential.revokedAt && (
                            <p className="text-xs text-destructive">
                              {ui.status}: revoked
                            </p>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const nextToken = rotateApiCredential(credential.id);
                              void navigator.clipboard?.writeText(nextToken);
                              toast.success(isMs ? "Token baharu disalin." : "New token copied.");
                            }}
                          >
                            {ui.rotate}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => revokeApiCredential(credential.id)}>
                            {ui.revoke}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => deleteApiCredential(credential.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            {ui.delete}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="border-border/60 bg-card/95 shadow-sm">
            <CardHeader>
              <CardTitle>{ui.imports}</CardTitle>
              <CardDescription>{ui.premiumImportFocus}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{ui.csvName}</Label>
                <Input value={csvName} onChange={(event) => setCsvName(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{ui.csvData}</Label>
                <Textarea
                  rows={10}
                  value={csvText}
                  onChange={(event) => setCsvText(event.target.value)}
                />
              </div>
              <Button onClick={handleImportCsv}>
                <Upload className="mr-2 h-4 w-4" />
                {ui.importCsv}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/95 shadow-sm">
            <CardHeader>
              <CardTitle>{isMs ? "Sejarah Import" : "Import History"}</CardTitle>
              <CardDescription>
                {isMs
                  ? "Lihat hasil import CSV dan jumlah rekod yang diproses."
                  : "Review CSV import outcomes and processed row counts."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {importJobs.length === 0 ? (
                <p className="text-sm text-muted-foreground">{ui.noImports}</p>
              ) : (
                importJobs.map((job) => (
                  <div key={job.id} className="rounded-xl border border-border p-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="font-medium">{job.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {job.successCount}/{job.rowCount} {isMs ? "baris berjaya" : "rows processed"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {ui.created}: {formatDate(job.createdAt, locale)}
                        </p>
                      </div>
                      <Badge variant={job.status === "processed" ? "secondary" : "default"}>
                        {job.status}
                      </Badge>
                    </div>
                    {job.errorRows.length > 0 && (
                      <div className="mt-3 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                        {job.errorRows.join(" ")}
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </section>

        {isSuperadmin && (
          <section>
            <Card className="border-border/60 bg-card/95 shadow-sm">
              <CardHeader>
                <CardTitle>{ui.requestAdminTitle}</CardTitle>
                <CardDescription>{ui.requestAdminDescription}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {isRequestListLoading ? (
                  <p className="text-sm text-muted-foreground">{ui.loading}</p>
                ) : planRequests.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{ui.noRequests}</p>
                ) : (
                  planRequests.map((requestRow) => (
                    <div key={requestRow.request_id} className="rounded-xl border border-border p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="font-medium">{requestRow.email}</p>
                          <p className="text-sm text-muted-foreground">
                            {requestRow.requested_plan} • {requestRow.status}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {ui.created}: {formatDate(requestRow.created_at, locale)}
                          </p>
                          {requestRow.requester_note && (
                            <p className="mt-2 text-sm text-muted-foreground">{requestRow.requester_note}</p>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {requestRow.status === "pending" ? (
                            <>
                              <Button size="sm" onClick={() => void handleResolvePlanRequest(requestRow.request_id, true)}>
                                {ui.approve}
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => void handleResolvePlanRequest(requestRow.request_id, false)}>
                                {ui.reject}
                              </Button>
                            </>
                          ) : (
                            <Badge variant={requestRow.status === "approved" ? "secondary" : "outline"}>
                              {requestRow.status}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </section>
        )}
      </div>
    </main>
  );
};

export default Dashboard;
