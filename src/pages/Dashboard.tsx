import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Copy, Download, FolderOpen, KeyRound, LogOut, RefreshCw, Trash2, Upload, UserPlus, Users } from "lucide-react";
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

  const planLabel = isSuperadmin
    ? "Superadmin"
    : subscriptionPlan === "diamond"
      ? "Diamond"
      : subscriptionPlan === "premium"
        ? "Premium"
        : "Free";

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
    navigate("/login");
  };

  if (!isAuthResolved) {
    return <main className="flex min-h-screen items-center justify-center bg-background">Loading...</main>;
  }

  if (isFreeTier) {
    return (
      <main className="min-h-screen bg-background p-4 md:p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          <Card>
            <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-tight">{ui.title}</h1>
                  <Badge variant="secondary">{planLabel}</Badge>
                </div>
                <p className="text-muted-foreground">
                  {isMs
                    ? "Akses pantas untuk cipta poster, semak draf, dan pantau baki muat turun bulanan."
                    : "A simple workspace to create posters, review drafts, and track monthly downloads."}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isMs ? "Log masuk sebagai" : "Signed in as"} {userEmail ?? "-"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <LanguageSwitcher />
                <Button asChild>
                  <Link to="/create">
                    <FolderOpen className="mr-2 h-4 w-4" />
                    {ui.openBuilder}
                  </Link>
                </Button>
                <Button variant="destructive" onClick={() => void handleLogout()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {ui.signOut}
                </Button>
              </div>
            </CardContent>
          </Card>

          {(remoteError || !isRemoteReady || isSyncing) && (
            <Card>
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

          <section className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">{ui.draftCount}</p>
                <p className="mt-2 text-3xl font-semibold">{summary.draftCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">
                  {isMs ? "Muat turun bulan ini" : "Downloads this month"}
                </p>
                <p className="mt-2 text-3xl font-semibold">{monthlyPosterCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">
                  {isMs ? "Baki muat turun" : "Remaining downloads"}
                </p>
                <p className="mt-2 text-3xl font-semibold">{remainingFreePosters}</p>
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
            <Card>
              <CardHeader>
                <CardTitle>{ui.drafts}</CardTitle>
                <CardDescription>
                  {isMs
                    ? "Buka semula, namakan semula, padam, atau pilih draf untuk batch ringkas."
                    : "Reopen, rename, delete, or pick drafts for a simple batch."}
                </CardDescription>
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

            <div className="space-y-6">
              <Card>
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
                    <p className="text-sm text-muted-foreground">{ui.noBatches}</p>
                  ) : (
                    batches.slice(0, 5).map((batch) => (
                      <div key={batch.id} className="rounded-xl border border-border p-4">
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

              <Card>
                <CardHeader>
                  <CardTitle>{isMs ? "Cara paling mudah guna" : "The easiest way to use it"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>{isMs ? "1. Klik Buka Pembina Poster" : "1. Click Open Poster Builder"}</p>
                  <p>{isMs ? "2. Jana poster dan simpan sebagai draf" : "2. Generate a poster and save it as a draft"}</p>
                  <p>{isMs ? "3. Kembali ke sini untuk buka semula draf bila perlu" : "3. Come back here to reopen your drafts anytime"}</p>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <Card>
          <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">{ui.title}</h1>
                <Badge variant="secondary">{planLabel}</Badge>
              </div>
              <p className="text-muted-foreground">{ui.subtitle}</p>
              <p className="text-sm text-muted-foreground">
                {isMs ? "Log masuk sebagai" : "Signed in as"} {userEmail ?? "-"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <LanguageSwitcher />
              <Button asChild variant="outline">
                <Link to="/create">
                  <FolderOpen className="mr-2 h-4 w-4" />
                  {ui.openBuilder}
                </Link>
              </Button>
              <Button variant="destructive" onClick={() => void handleLogout()}>
                <LogOut className="mr-2 h-4 w-4" />
                {ui.signOut}
              </Button>
            </div>
          </CardContent>
        </Card>

        {(remoteError || !isRemoteReady || isSyncing) && (
          <Card>
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
            { label: ui.draftCount, value: summary.draftCount },
            { label: ui.batchCount, value: summary.batchCount },
            { label: ui.teamCount, value: summary.teamCount },
            { label: ui.generatedCount, value: summary.totalGenerated },
          ].map((item) => (
            <Card key={item.label}>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="mt-2 text-3xl font-semibold">{item.value}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <Card>
            <CardHeader>
              <CardTitle>{ui.drafts}</CardTitle>
              <CardDescription>
                {isMs
                  ? "Buka semula, namakan semula, pilih, dan susun draf untuk batch."
                  : "Reopen, rename, select, and organize drafts into batches."}
              </CardDescription>
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

          <Card>
            <CardHeader>
              <CardTitle>{ui.batches}</CardTitle>
              <CardDescription>
                {isMs
                  ? "Lihat kumpulan poster yang dihasilkan daripada draf atau CSV."
                  : "Review poster collections created from drafts or CSV imports."}
              </CardDescription>
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
          <Card>
            <CardHeader>
              <CardTitle>{ui.team}</CardTitle>
              <CardDescription>
                {isMs
                  ? "Tambah kolaborator, semak status jemputan, dan urus peranan."
                  : "Add collaborators, review invite status, and manage roles."}
              </CardDescription>
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

          <Card>
            <CardHeader>
              <CardTitle>{ui.apiKeys}</CardTitle>
              <CardDescription>
                {isMs
                  ? "Jana, putar semula, dan nyahaktif kunci integrasi."
                  : "Generate, rotate, and revoke integration keys."}
              </CardDescription>
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
          <Card>
            <CardHeader>
              <CardTitle>{ui.imports}</CardTitle>
              <CardDescription>
                {isMs
                  ? "Tampal CSV untuk jana batch poster dengan pantas."
                  : "Paste CSV rows to generate a poster batch quickly."}
              </CardDescription>
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

          <Card>
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
      </div>
    </main>
  );
};

export default Dashboard;
