import { DragEvent, useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Activity, ArchiveRestore, ArrowDown, ArrowUp, Cloud, Copy, FileStack, KeyRound, Pencil, Plus, Save, Search, Trash2, Upload, Users, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useSubscription } from "@/hooks/use-subscription";
import { createEmptyPoster, useWorkspace } from "@/hooks/use-workspace";
import { PosterData } from "@/types/poster";
import { WorkspaceRole } from "@/types/workspace";

type PendingDeleteKind = "draft" | "batch" | "member" | "api";

interface PendingDelete {
  id: string;
  label: string;
  kind: PendingDeleteKind;
  timeoutId: number;
}

const parseCsvRows = (csvText: string) => {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return { posters: [] as PosterData[], errors: ["CSV needs a header row and at least one data row."] };
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

const WorkspaceLocked = ({ title, description }: { title: string; description: string }) => (
  <Card>
    <CardContent className="py-8 text-center space-y-2">
      <p className="font-medium">{title}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const {
    plan,
    isPaidTier,
    isDiamondTier,
    userEmail,
  } = useSubscription();
  const {
    drafts,
    batches,
    analytics,
    team,
    apiCredentials,
    importJobs,
    recycleBin,
    summary,
    isRemoteReady,
    isSyncing,
    lastSyncedAt,
    remoteError,
    retryRemoteSync,
    saveDraft,
    deleteDraft,
    renameDraft,
    createBatch,
    updateBatch,
    deleteBatch,
    reorderBatchItem,
    moveBatchItem,
    updateBatchItem,
    duplicateBatchItem,
    removeBatchItem,
    addTeamMember,
    updateTeamMember,
    acceptTeamMemberInvite,
    resendTeamMemberInvite,
    deleteTeamMember,
    createApiCredential,
    updateApiCredential,
    rotateApiCredential,
    revokeApiCredential,
    deleteApiCredential,
    restoreDeletedItem,
    restoreDeletedItems,
    clearDeletedItem,
    clearDeletedItems,
    createImportJob,
    trackEvent,
  } = useWorkspace();
  const [loading, setLoading] = useState(true);
  const [selectedDraftIds, setSelectedDraftIds] = useState<string[]>([]);
  const [batchName, setBatchName] = useState("");
  const [memberName, setMemberName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState<WorkspaceRole>("editor");
  const [csvName, setCsvName] = useState("CSV import");
  const [csvText, setCsvText] = useState("fullName,gender,organization,from\nAhmad bin Abdullah,allahyarham,Masjid Al Ikhlas,Keluarga Ahmad");
  const [apiKeyName, setApiKeyName] = useState("Dashboard integration");
  const [renamingDraftId, setRenamingDraftId] = useState<string | null>(null);
  const [draftTitleInput, setDraftTitleInput] = useState("");
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [memberEditName, setMemberEditName] = useState("");
  const [memberEditEmail, setMemberEditEmail] = useState("");
  const [memberEditRole, setMemberEditRole] = useState<WorkspaceRole>("editor");
  const [memberEditStatus, setMemberEditStatus] = useState<"pending" | "accepted">("accepted");
  const [editingApiKeyId, setEditingApiKeyId] = useState<string | null>(null);
  const [apiKeyEditName, setApiKeyEditName] = useState("");
  const [editingBatchId, setEditingBatchId] = useState<string | null>(null);
  const [batchEditName, setBatchEditName] = useState("");
  const [pendingDeletes, setPendingDeletes] = useState<PendingDelete[]>([]);
  const [draftSearch, setDraftSearch] = useState("");
  const [draftThemeFilter, setDraftThemeFilter] = useState("all");
  const [draftFormatFilter, setDraftFormatFilter] = useState("all");
  const [restoreSearch, setRestoreSearch] = useState("");
  const [restoreKindFilter, setRestoreKindFilter] = useState("all");
  const [draggedBatchId, setDraggedBatchId] = useState<string | null>(null);
  const [draggedBatchItemId, setDraggedBatchItemId] = useState<string | null>(null);
  const [editingBatchItemId, setEditingBatchItemId] = useState<string | null>(null);
  const [editingBatchItemBatchId, setEditingBatchItemBatchId] = useState<string | null>(null);
  const [batchItemFullName, setBatchItemFullName] = useState("");
  const [batchItemOrganization, setBatchItemOrganization] = useState("");
  const [batchItemMessage, setBatchItemMessage] = useState("");
  const [batchItemFrom, setBatchItemFrom] = useState("");
  const [batchItemTheme, setBatchItemTheme] = useState<PosterData["theme"]>("classic");
  const [batchItemFormat, setBatchItemFormat] = useState<PosterData["format"]>("classic");
  const [selectedRestoreIds, setSelectedRestoreIds] = useState<string[]>([]);

  const planLabel = plan === "diamond" ? "Diamond" : plan === "premium" ? "Premium" : "Free";
  const isInviteExpired = (inviteExpiresAt?: string) =>
    Boolean(inviteExpiresAt && new Date(inviteExpiresAt).getTime() < Date.now());

  const getRowSyncLabel = (updatedAt?: string, revokedAt?: string) => {
    if (revokedAt) {
      return `Revoked ${new Date(revokedAt).toLocaleString()}`;
    }

    if (!updatedAt) {
      return "Not synced yet";
    }

    if (remoteError) {
      return "Sync issue";
    }

    if (isSyncing) {
      return "Saving...";
    }

    if (lastSyncedAt && updatedAt <= lastSyncedAt) {
      return "Saved to cloud";
    }

    return "Pending sync";
  };

  useEffect(() => {
    return () => {
      pendingDeletes.forEach((pendingDelete) => window.clearTimeout(pendingDelete.timeoutId));
    };
  }, [pendingDeletes]);

  const analyticsSummary = useMemo(
    () => ({
      generated: analytics.filter((event) => event.type === "poster_generated").length,
      savedDrafts: analytics.filter((event) => event.type === "draft_saved").length,
      imports: analytics.filter((event) => event.type === "csv_imported").length,
      apiKeys: analytics.filter((event) => event.type === "api_key_created").length,
    }),
    [analytics],
  );
  const filteredDrafts = useMemo(
    () =>
      drafts.filter((draft) => {
        const matchesSearch = [draft.title, draft.poster.fullName, draft.poster.organization ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(draftSearch.trim().toLowerCase());
        const matchesTheme = draftThemeFilter === "all" || draft.poster.theme === draftThemeFilter;
        const matchesFormat = draftFormatFilter === "all" || draft.poster.format === draftFormatFilter;

        return matchesSearch && matchesTheme && matchesFormat;
      }),
    [draftFormatFilter, draftSearch, draftThemeFilter, drafts],
  );
  const filteredRecycleBin = useMemo(
    () =>
      recycleBin.filter((item) => {
        const matchesSearch = `${item.label} ${item.kind}`
          .toLowerCase()
          .includes(restoreSearch.trim().toLowerCase());
        const matchesKind = restoreKindFilter === "all" || item.kind === restoreKindFilter;

        return matchesSearch && matchesKind;
      }),
    [recycleBin, restoreKindFilter, restoreSearch],
  );

  useEffect(() => {
    setSelectedRestoreIds((current) => current.filter((id) => recycleBin.some((item) => item.id === id)));
  }, [recycleBin]);

  useEffect(() => {
    const loadSession = async () => {
      await supabase.auth.getSession();
      setLoading(false);
    };

    loadSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        navigate("/");
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [navigate]);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Logged out", description: "You have been signed out." });
    navigate("/");
  };

  const openPoster = (poster: PosterData, sourceLabel: string) => {
    navigate("/create", {
      state: {
        draftPoster: poster,
        sourceLabel,
      },
    });
  };

  const openDraft = (draftId: string, draftTitle: string, poster: PosterData) => {
    navigate("/create", {
      state: {
        draftPoster: poster,
        sourceLabel: `draft: ${draftTitle}`,
        draftId,
        draftTitle,
      },
    });
  };

  const handleCreateBatch = () => {
    if (!isPaidTier) {
      return;
    }

    const selectedDrafts = drafts.filter((draft) => selectedDraftIds.includes(draft.id));
    if (selectedDrafts.length === 0) {
      toast({ title: "Select drafts", description: "Choose at least one draft to create a batch." });
      return;
    }

    if (plan === "premium" && selectedDrafts.length > 10) {
      toast({ title: "Batch limit reached", description: "Premium supports up to 10 posters per batch." });
      return;
    }

    const batch = createBatch(batchName.trim() || `Batch ${batches.length + 1}`, selectedDrafts.map((draft) => draft.poster), "manual");
    setSelectedDraftIds([]);
    setBatchName("");
    toast({ title: "Batch created", description: `${batch.items.length} posters added to ${batch.name}.` });
  };

  const handleAddMember = () => {
    if (!memberName.trim() || !memberEmail.trim()) {
      toast({ title: "Missing details", description: "Name and email are required to invite a teammate." });
      return;
    }

    addTeamMember(memberName.trim(), memberEmail.trim(), memberRole);
    setMemberName("");
    setMemberEmail("");
    setMemberRole("editor");
    toast({ title: "Invite created", description: "The collaborator has been added with a pending invite state." });
  };

  const handleCreateApiKey = () => {
    const credential = createApiCredential(apiKeyName.trim() || "Workspace integration");
    setApiKeyName("Dashboard integration");
    toast({
      title: "API key created",
      description: `Save this token securely: ${credential.token}`,
    });
  };

  const handleImportCsv = () => {
    const { posters, errors } = parseCsvRows(csvText);
    const job = createImportJob(csvName.trim() || "CSV import", posters.length + errors.length, posters.length, errors);

    if (posters.length > 0) {
      createBatch(csvName.trim() || "CSV import", posters, "csv");
    }

    toast({
      title: errors.length > 0 ? "CSV processed with issues" : "CSV imported",
      description: `${job.successCount} rows ready for poster creation${errors.length > 0 ? `, ${errors.length} rows need review.` : "."}`,
    });
  };

  const handleQuickDraft = () => {
    const draft = saveDraft("Quick memorial draft", createEmptyPoster());
    openDraft(draft.id, draft.title, draft.poster);
  };

  const queueDelete = (id: string, label: string, kind: PendingDeleteKind, onCommit: () => void) => {
    const timeoutId = window.setTimeout(() => {
      onCommit();
      setPendingDeletes((current) => current.filter((item) => item.id !== id));
      toast({ title: "Deleted", description: `${label} has been removed.` });
    }, 5000);

    setPendingDeletes((current) => [
      ...current.filter((item) => item.id !== id),
      { id, label, kind, timeoutId },
    ]);

    toast({
      title: "Scheduled for deletion",
      description: `${label} will be deleted in 5 seconds unless you undo it below.`,
    });
  };

  const handleDeleteDraft = (draftId: string, draftTitle: string) => {
    queueDelete(draftId, draftTitle, "draft", () => deleteDraft(draftId));
  };

  const handleRenameDraft = (draftId: string) => {
    renameDraft(draftId, draftTitleInput);
    setRenamingDraftId(null);
    setDraftTitleInput("");
    toast({ title: "Draft renamed", description: "The draft title has been updated." });
  };

  const startEditingMember = (
    memberId: string,
    name: string,
    email: string,
    role: WorkspaceRole,
    status: "pending" | "accepted",
  ) => {
    setEditingMemberId(memberId);
    setMemberEditName(name);
    setMemberEditEmail(email);
    setMemberEditRole(role);
    setMemberEditStatus(status);
  };

  const handleUpdateMember = (memberId: string) => {
    updateTeamMember(memberId, {
      name: memberEditName.trim(),
      email: memberEditEmail.trim(),
      role: memberEditRole,
      status: memberEditStatus,
    });
    setEditingMemberId(null);
    toast({ title: "Member updated", description: "The collaborator details have been saved." });
  };

  const handleDeleteMember = (memberId: string, name: string) => {
    queueDelete(memberId, name, "member", () => deleteTeamMember(memberId));
  };

  const startEditingApiKey = (credentialId: string, name: string) => {
    setEditingApiKeyId(credentialId);
    setApiKeyEditName(name);
  };

  const handleUpdateApiKey = (credentialId: string) => {
    updateApiCredential(credentialId, apiKeyEditName);
    setEditingApiKeyId(null);
    setApiKeyEditName("");
    toast({ title: "API key updated", description: "The credential label has been updated." });
  };

  const handleDeleteApiKey = (credentialId: string, name: string) => {
    queueDelete(credentialId, name, "api", () => deleteApiCredential(credentialId));
  };

  const handleUndoDelete = (id: string) => {
    const pendingDelete = pendingDeletes.find((item) => item.id === id);
    if (!pendingDelete) {
      return;
    }

    window.clearTimeout(pendingDelete.timeoutId);
    setPendingDeletes((current) => current.filter((item) => item.id !== id));
    toast({ title: "Undo complete", description: `${pendingDelete.label} was kept.` });
  };

  const handleRestoreDeletedItem = (deletedItemId: string, label: string) => {
    restoreDeletedItem(deletedItemId);
    toast({ title: "Item restored", description: `${label} has been restored to the workspace.` });
  };

  const handleClearDeletedItem = (deletedItemId: string, label: string) => {
    clearDeletedItem(deletedItemId);
    toast({ title: "Removed permanently", description: `${label} was removed from the restore bin.` });
  };

  const startEditingBatch = (batchId: string, name: string) => {
    setEditingBatchId(batchId);
    setBatchEditName(name);
  };

  const handleUpdateBatch = (batchId: string) => {
    updateBatch(batchId, { name: batchEditName });
    setEditingBatchId(null);
    setBatchEditName("");
    toast({ title: "Batch updated", description: "The batch name has been saved." });
  };

  const handleDeleteBatch = (batchId: string, batchNameValue: string) => {
    queueDelete(batchId, batchNameValue, "batch", () => deleteBatch(batchId));
  };

  const handleMoveBatchItem = (batchId: string, itemId: string, direction: "up" | "down") => {
    reorderBatchItem(batchId, itemId, direction);
  };

  const handleDragStartBatchItem = (batchId: string, itemId: string) => {
    setDraggedBatchId(batchId);
    setDraggedBatchItemId(itemId);
  };

  const handleDropBatchItem = (batchId: string, itemId: string, itemIndex: number) => {
    if (!draggedBatchId || !draggedBatchItemId || draggedBatchId !== batchId) {
      return;
    }

    if (draggedBatchItemId !== itemId) {
      moveBatchItem(batchId, draggedBatchItemId, itemIndex);
    }

    setDraggedBatchId(null);
    setDraggedBatchItemId(null);
  };

  const handleBatchDragEnd = () => {
    setDraggedBatchId(null);
    setDraggedBatchItemId(null);
  };

  const handleRemoveBatchItem = (batchId: string, itemId: string, label: string) => {
    removeBatchItem(batchId, itemId);
    toast({
      title: "Batch item removed",
      description: `${label} was removed from the batch.`,
    });
  };

  const startEditingBatchItem = (batchId: string, itemId: string, poster: PosterData) => {
    setEditingBatchItemBatchId(batchId);
    setEditingBatchItemId(itemId);
    setBatchItemFullName(poster.fullName);
    setBatchItemOrganization(poster.organization || "");
    setBatchItemMessage(poster.message || "");
    setBatchItemFrom(poster.from || "");
    setBatchItemTheme(poster.theme);
    setBatchItemFormat(poster.format);
  };

  const stopEditingBatchItem = () => {
    setEditingBatchItemBatchId(null);
    setEditingBatchItemId(null);
    setBatchItemFullName("");
    setBatchItemOrganization("");
    setBatchItemMessage("");
    setBatchItemFrom("");
    setBatchItemTheme("classic");
    setBatchItemFormat("classic");
  };

  const handleUpdateBatchItem = (batchId: string, itemId: string, poster: PosterData) => {
    updateBatchItem(batchId, itemId, {
      ...poster,
      fullName: batchItemFullName.trim(),
      organization: batchItemOrganization.trim(),
      message: batchItemMessage.trim(),
      from: batchItemFrom.trim(),
      theme: batchItemTheme,
      format: batchItemFormat,
    });
    stopEditingBatchItem();
    toast({
      title: "Batch item updated",
      description: "The poster details were updated inside this batch.",
    });
  };

  const handleDuplicateBatchItem = (batchId: string, itemId: string, label: string) => {
    duplicateBatchItem(batchId, itemId);
    toast({
      title: "Batch item duplicated",
      description: `${label} was duplicated inside the batch.`,
    });
  };

  const handleRotateApiKey = (credentialId: string, name: string) => {
    const nextToken = rotateApiCredential(credentialId);
    toast({
      title: "API key rotated",
      description: `${name} now uses a new token: ${nextToken}`,
    });
  };

  const handleRevokeApiKey = (credentialId: string, name: string) => {
    revokeApiCredential(credentialId);
    toast({
      title: "API key revoked",
      description: `${name} has been revoked and should no longer be used.`,
    });
  };

  const handleAcceptMemberInvite = (memberId: string, name: string) => {
    acceptTeamMemberInvite(memberId);
    toast({
      title: "Invitation accepted",
      description: `${name} is now an active collaborator.`,
    });
  };

  const handleCopyInviteLink = async (name: string, inviteLink?: string) => {
    if (!inviteLink) {
      toast({
        title: "Invite link unavailable",
        description: "Generate or resend the invite link first.",
        variant: "destructive",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(inviteLink);
      toast({
        title: "Invite link copied",
        description: `${name}'s share link is ready to send.`,
      });
    } catch {
      toast({
        title: "Copy failed",
        description: inviteLink,
        variant: "destructive",
      });
    }
  };

  const handleResendInvite = (memberId: string, name: string) => {
    const inviteLink = resendTeamMemberInvite(memberId);

    toast({
      title: "Invite link refreshed",
      description: inviteLink
        ? `${name}'s invite link has been renewed for another 7 days.`
        : "Only pending collaborators can receive a renewed invite link.",
      variant: inviteLink ? "default" : "destructive",
    });
  };

  const handleToggleRestoreSelection = (deletedItemId: string, checked: boolean) => {
    setSelectedRestoreIds((current) =>
      checked ? [...current, deletedItemId] : current.filter((id) => id !== deletedItemId),
    );
  };

  const handleToggleAllRestoreSelection = (checked: boolean) => {
    setSelectedRestoreIds(checked ? filteredRecycleBin.map((item) => item.id) : []);
  };

  const handleBulkRestore = () => {
    if (selectedRestoreIds.length === 0) {
      return;
    }

    restoreDeletedItems(selectedRestoreIds);
    toast({
      title: "Items restored",
      description: `${selectedRestoreIds.length} deleted item${selectedRestoreIds.length === 1 ? "" : "s"} restored to the workspace.`,
    });
    setSelectedRestoreIds([]);
  };

  const handleBulkClearRestore = () => {
    if (selectedRestoreIds.length === 0) {
      return;
    }

    clearDeletedItems(selectedRestoreIds);
    toast({
      title: "Items removed permanently",
      description: `${selectedRestoreIds.length} deleted item${selectedRestoreIds.length === 1 ? "" : "s"} removed from the restore bin.`,
    });
    setSelectedRestoreIds([]);
  };

  if (loading) {
    return <main className="min-h-screen bg-background flex items-center justify-center">Loading...</main>;
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold">Workspace Dashboard</h1>
              <Badge variant={plan === "free" ? "outline" : "default"}>{planLabel}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {userEmail ? `Signed in as ${userEmail}` : "Signed in session not found."}
            </p>
            <p className="text-sm text-muted-foreground">
              Build drafts, run batch jobs, review analytics, manage collaborators, and prepare imports from one place.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => navigate("/create")}>
              Open Poster Builder
            </Button>
            <Button variant="outline" onClick={handleQuickDraft}>
              New Draft
            </Button>
            <Button variant="destructive" onClick={signOut}>
              Log Keluar
            </Button>
          </div>
        </div>

        <Card className={remoteError ? "border-destructive/40" : undefined}>
          <CardContent className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {remoteError
                  ? "Cloud sync needs attention"
                  : isSyncing
                    ? "Syncing workspace to Supabase..."
                    : isRemoteReady
                      ? "Workspace sync is connected"
                      : "Using local workspace mode"}
              </p>
              <p className="text-sm text-muted-foreground">
                {remoteError
                  ? remoteError
                  : lastSyncedAt
                    ? `Last synced ${new Date(lastSyncedAt).toLocaleString()}`
                    : "Cloud sync will start after your workspace is available in Supabase."}
              </p>
            </div>
            <div className="flex gap-2">
              {remoteError && (
                <Button variant="outline" onClick={retryRemoteSync}>
                  Retry Sync
                </Button>
              )}
              <Button variant="ghost" onClick={() => navigate("/create")}>
                Open Builder
              </Button>
            </div>
          </CardContent>
        </Card>

        {pendingDeletes.length > 0 && (
          <Card>
            <CardContent className="space-y-3 py-4">
              {pendingDeletes.map((pendingDelete) => (
                <div key={pendingDelete.id} className="flex flex-col gap-2 rounded-lg border border-border p-3 md:flex-row md:items-center md:justify-between">
                  <p className="text-sm text-muted-foreground">
                    `{pendingDelete.label}` is queued for deletion.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => handleUndoDelete(pendingDelete.id)}>
                    Undo
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Cloud Drafts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{summary.draftCount}</p>
              <p className="text-xs text-muted-foreground">Reusable poster drafts in your workspace</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Batch Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{summary.batchCount}</p>
              <p className="text-xs text-muted-foreground">Manual and CSV-based poster batches</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Analytics Events</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{analytics.length}</p>
              <p className="text-xs text-muted-foreground">Tracked usage across builder and dashboard</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{summary.teamCount}</p>
              <p className="text-xs text-muted-foreground">Workspace collaborators and roles</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Restore Bin</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{summary.recycleBinCount}</p>
              <p className="text-xs text-muted-foreground">Recover recently deleted workspace items</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="drafts" className="space-y-4">
          <TabsList className="grid h-auto grid-cols-2 gap-2 md:grid-cols-6">
            <TabsTrigger value="drafts" className="gap-2"><Cloud className="h-4 w-4" />Drafts</TabsTrigger>
            <TabsTrigger value="batches" className="gap-2"><FileStack className="h-4 w-4" />Batches</TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2"><Activity className="h-4 w-4" />Analytics</TabsTrigger>
            <TabsTrigger value="team" className="gap-2"><Users className="h-4 w-4" />Team</TabsTrigger>
            <TabsTrigger value="tools" className="gap-2"><KeyRound className="h-4 w-4" />CSV / API</TabsTrigger>
            <TabsTrigger value="restore" className="gap-2"><ArchiveRestore className="h-4 w-4" />Restore Bin</TabsTrigger>
          </TabsList>

          <TabsContent value="drafts" className="space-y-4">
            {!isPaidTier ? (
              <WorkspaceLocked
                title="Cloud drafts unlock on Premium"
                description="Upgrade from Free to keep reusable drafts in your workspace and reopen them later."
              />
            ) : (
              <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <Card>
                  <CardHeader>
                    <CardTitle>Saved Drafts</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-[1fr_180px_220px]">
                      <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={draftSearch}
                          onChange={(event) => setDraftSearch(event.target.value)}
                          placeholder="Search by draft, person, or organization"
                          className="pl-9"
                        />
                      </div>
                      <Select value={draftThemeFilter} onValueChange={setDraftThemeFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Theme" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All themes</SelectItem>
                          <SelectItem value="classic">Classic</SelectItem>
                          <SelectItem value="retro">Retro</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={draftFormatFilter} onValueChange={setDraftFormatFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All formats</SelectItem>
                          <SelectItem value="classic">Classic</SelectItem>
                          <SelectItem value="instagram-square">Instagram Square</SelectItem>
                          <SelectItem value="instagram-landscape">Instagram Landscape</SelectItem>
                          <SelectItem value="instagram-portrait">Instagram Portrait</SelectItem>
                          <SelectItem value="facebook">Facebook</SelectItem>
                          <SelectItem value="instagram-story">Instagram Story</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Showing {filteredDrafts.length} of {drafts.length} drafts
                    </p>
                    {drafts.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No drafts yet. Save one from the poster builder to reuse it here.</p>
                    ) : filteredDrafts.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No drafts match the current search and filters.</p>
                    ) : (
                      filteredDrafts.map((draft) => (
                        <div key={draft.id} className="flex flex-col gap-3 rounded-lg border border-border p-4 md:flex-row md:items-center md:justify-between">
                          <div className="space-y-1">
                            {renamingDraftId === draft.id ? (
                              <div className="flex flex-wrap items-center gap-2">
                                <Input
                                  value={draftTitleInput}
                                  onChange={(event) => setDraftTitleInput(event.target.value)}
                                  className="max-w-xs"
                                />
                                <Button size="icon" variant="outline" onClick={() => handleRenameDraft(draft.id)}>
                                  <Save className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => {
                                    setRenamingDraftId(null);
                                    setDraftTitleInput("");
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{draft.title}</p>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setRenamingDraftId(draft.id);
                                    setDraftTitleInput(draft.title);
                                  }}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                            <p className="text-sm text-muted-foreground">
                              Updated {new Date(draft.updatedAt).toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {draft.poster.fullName || "Untitled memorial"} • {draft.poster.format} • {draft.poster.theme}
                            </p>
                            <p className="text-xs text-muted-foreground">{getRowSyncLabel(draft.updatedAt)}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm" onClick={() => openDraft(draft.id, draft.title, draft.poster)}>
                              Open
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteDraft(draft.id, draft.title)}>
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Create Batch From Drafts</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="batch-name">Batch name</Label>
                      <Input
                        id="batch-name"
                        value={batchName}
                        onChange={(event) => setBatchName(event.target.value)}
                        placeholder="Weekly memorial batch"
                      />
                    </div>
                    <div className="space-y-3">
                      {filteredDrafts.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Add drafts first, then select them here for batch processing.</p>
                      ) : (
                        filteredDrafts.map((draft) => (
                          <label key={draft.id} className="flex items-start gap-3 rounded-lg border border-border p-3">
                            <Checkbox
                              checked={selectedDraftIds.includes(draft.id)}
                              onCheckedChange={(checked) =>
                                setSelectedDraftIds((current) =>
                                  checked ? [...current, draft.id] : current.filter((id) => id !== draft.id),
                                )
                              }
                            />
                            <div className="space-y-1">
                              <p className="text-sm font-medium">{draft.title}</p>
                              <p className="text-xs text-muted-foreground">{draft.poster.fullName || "Untitled memorial"}</p>
                            </div>
                          </label>
                        ))
                      )}
                    </div>
                    <Button className="w-full" onClick={handleCreateBatch}>
                      Create Batch
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Premium supports up to 10 posters per batch. Diamond can build larger organization batches.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="batches" className="space-y-4">
            {!isPaidTier ? (
              <WorkspaceLocked
                title="Batch creation is available on paid plans"
                description="Upgrade to Premium or Diamond to prepare poster groups and process multiple memorials faster."
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Batch Projects</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {batches.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No batch projects yet. Create one from drafts or a CSV import.</p>
                  ) : (
                    batches.map((batch) => (
                      <div key={batch.id} className="rounded-xl border border-border p-4 space-y-3">
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                          {editingBatchId === batch.id ? (
                            <div className="flex w-full flex-wrap items-center gap-2">
                              <Input value={batchEditName} onChange={(event) => setBatchEditName(event.target.value)} className="max-w-sm" />
                              <Button size="icon" variant="outline" onClick={() => handleUpdateBatch(batch.id)}>
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => setEditingBatchId(null)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">{batch.name}</p>
                                  <Button size="icon" variant="ghost" onClick={() => startEditingBatch(batch.id, batch.name)}>
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {batch.items.length} posters • {batch.source} • updated {new Date(batch.updatedAt).toLocaleString()}
                                </p>
                                <p className="text-xs text-muted-foreground">{getRowSyncLabel(batch.updatedAt)}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{batch.source}</Badge>
                                <Button size="icon" variant="ghost" onClick={() => handleDeleteBatch(batch.id, batch.name)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                        <div className="grid gap-2 md:grid-cols-2">
                          {batch.items.map((item, itemIndex) => (
                            <div
                              key={item.id}
                              draggable
                              onDragStart={() => handleDragStartBatchItem(batch.id, item.id)}
                              onDragEnd={handleBatchDragEnd}
                              onDragOver={(event: DragEvent<HTMLDivElement>) => event.preventDefault()}
                              onDrop={() => handleDropBatchItem(batch.id, item.id, itemIndex)}
                              className={`rounded-lg border p-3 text-left transition-colors hover:bg-muted/50 ${
                                draggedBatchId === batch.id && draggedBatchItemId === item.id
                                  ? "border-primary bg-primary/5"
                                  : "border-border"
                              }`}
                            >
                              {editingBatchItemId === item.id && editingBatchItemBatchId === batch.id ? (
                                <div className="space-y-3">
                                  <div className="grid gap-3 md:grid-cols-2">
                                    <Input
                                      value={batchItemFullName}
                                      onChange={(event) => setBatchItemFullName(event.target.value)}
                                      placeholder="Full name"
                                    />
                                    <Input
                                      value={batchItemOrganization}
                                      onChange={(event) => setBatchItemOrganization(event.target.value)}
                                      placeholder="Organization"
                                    />
                                  </div>
                                  <div className="grid gap-3 md:grid-cols-2">
                                    <Input
                                      value={batchItemFrom}
                                      onChange={(event) => setBatchItemFrom(event.target.value)}
                                      placeholder="From"
                                    />
                                    <Input
                                      value={batchItemMessage}
                                      onChange={(event) => setBatchItemMessage(event.target.value)}
                                      placeholder="Short condolence message"
                                    />
                                  </div>
                                  <div className="grid gap-3 md:grid-cols-2">
                                    <Select
                                      value={batchItemTheme}
                                      onValueChange={(value) => setBatchItemTheme(value as PosterData["theme"])}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Theme" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="classic">Classic</SelectItem>
                                        <SelectItem value="retro">Retro</SelectItem>
                                        <SelectItem value="premium">Premium</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <Select
                                      value={batchItemFormat}
                                      onValueChange={(value) => setBatchItemFormat(value as PosterData["format"])}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Format" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="classic">Classic</SelectItem>
                                        <SelectItem value="instagram-square">Instagram Square</SelectItem>
                                        <SelectItem value="instagram-landscape">Instagram Landscape</SelectItem>
                                        <SelectItem value="instagram-portrait">Instagram Portrait</SelectItem>
                                        <SelectItem value="facebook">Facebook</SelectItem>
                                        <SelectItem value="instagram-story">Instagram Story</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleUpdateBatchItem(batch.id, item.id, item.poster)}
                                    >
                                      <Save className="mr-2 h-4 w-4" />
                                      Save Item
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={stopEditingBatchItem}>
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-start justify-between gap-3">
                                  <div
                                    className="min-w-0 flex-1 cursor-pointer"
                                    onClick={() => {
                                      trackEvent({ type: "batch_loaded", meta: { batch: batch.name } });
                                      openPoster(item.poster, `batch: ${batch.name}`);
                                    }}
                                  >
                                    <p className="text-sm font-medium">{item.poster.fullName || "Untitled memorial"}</p>
                                    <p className="text-xs text-muted-foreground">{item.poster.organization || "No organization"}</p>
                                    <p className="text-xs text-muted-foreground">
                                      Item {itemIndex + 1} of {batch.items.length}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {item.poster.theme} theme • {item.poster.format} format
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      Drag and drop to reorder within this batch.
                                    </p>
                                  </div>
                                  <div className="flex shrink-0 gap-1">
                                    <Button
                                      type="button"
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => startEditingBatchItem(batch.id, item.id, item.poster)}
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      type="button"
                                      size="icon"
                                      variant="ghost"
                                      onClick={() =>
                                        handleDuplicateBatchItem(
                                          batch.id,
                                          item.id,
                                          item.poster.fullName || "Untitled memorial",
                                        )
                                      }
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      type="button"
                                      size="icon"
                                      variant="ghost"
                                      disabled={itemIndex === 0}
                                      onClick={() => handleMoveBatchItem(batch.id, item.id, "up")}
                                    >
                                      <ArrowUp className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      type="button"
                                      size="icon"
                                      variant="ghost"
                                      disabled={itemIndex === batch.items.length - 1}
                                      onClick={() => handleMoveBatchItem(batch.id, item.id, "down")}
                                    >
                                      <ArrowDown className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      type="button"
                                      size="icon"
                                      variant="ghost"
                                      onClick={() =>
                                        handleRemoveBatchItem(
                                          batch.id,
                                          item.id,
                                          item.poster.fullName || "Untitled memorial",
                                        )
                                      }
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            {plan !== "diamond" ? (
              <WorkspaceLocked
                title="Advanced analytics unlock on Diamond"
                description="Diamond workspaces can review generation trends, draft usage, imports, and team activity in one place."
              />
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-4">
                  <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Generated</p><p className="text-3xl font-semibold">{analyticsSummary.generated}</p></CardContent></Card>
                  <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Draft Saves</p><p className="text-3xl font-semibold">{analyticsSummary.savedDrafts}</p></CardContent></Card>
                  <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">CSV Imports</p><p className="text-3xl font-semibold">{analyticsSummary.imports}</p></CardContent></Card>
                  <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">API Keys</p><p className="text-3xl font-semibold">{analyticsSummary.apiKeys}</p></CardContent></Card>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {analytics.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Analytics events will appear here as your team uses the workspace.</p>
                    ) : (
                      analytics.slice(0, 12).map((event) => (
                        <div key={event.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                          <div>
                            <p className="text-sm font-medium">{event.type.replaceAll("_", " ")}</p>
                            <p className="text-xs text-muted-foreground">{new Date(event.createdAt).toLocaleString()}</p>
                          </div>
                          <Badge variant="outline">{String(event.meta?.plan ?? "workspace")}</Badge>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="team" className="space-y-4">
            {!isDiamondTier ? (
              <WorkspaceLocked
                title="Team collaboration unlocks on Diamond"
                description="Diamond workspaces can manage roles, coordinate memorial operations, and share workspace context."
              />
            ) : (
              <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                <Card>
                  <CardHeader>
                    <CardTitle>Workspace Team</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {team.map((member) => (
                      <div key={member.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                        {editingMemberId === member.id ? (
                          <div className="grid w-full gap-3 md:grid-cols-[1fr_1fr_140px_140px_auto]">
                            <Input value={memberEditName} onChange={(event) => setMemberEditName(event.target.value)} />
                            <Input value={memberEditEmail} onChange={(event) => setMemberEditEmail(event.target.value)} />
                            <Select value={memberEditRole} onValueChange={(value) => setMemberEditRole(value as WorkspaceRole)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="editor">Editor</SelectItem>
                                <SelectItem value="viewer">Viewer</SelectItem>
                              </SelectContent>
                            </Select>
                            <Select value={memberEditStatus} onValueChange={(value) => setMemberEditStatus(value as "pending" | "accepted")}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="accepted">Accepted</SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="flex gap-2">
                              <Button size="icon" variant="outline" onClick={() => handleUpdateMember(member.id)}>
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => setEditingMemberId(null)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div>
                              <p className="font-medium">{member.name}</p>
                              <p className="text-sm text-muted-foreground">{member.email}</p>
                              <p className="text-xs text-muted-foreground">
                                {member.status === "pending"
                                  ? `Invite pending since ${new Date(member.createdAt).toLocaleString()}`
                                  : member.acceptedAt
                                    ? `Accepted ${new Date(member.acceptedAt).toLocaleString()}`
                                    : "Accepted collaborator"}
                              </p>
                              {member.status === "pending" && member.inviteExpiresAt && (
                                <p className="text-xs text-muted-foreground">
                                  Invite link {isInviteExpired(member.inviteExpiresAt) ? "expired" : "expires"} {new Date(member.inviteExpiresAt).toLocaleString()}
                                </p>
                              )}
                              {member.status === "pending" && member.inviteLink && (
                                <p className="max-w-md truncate text-xs text-muted-foreground">{member.inviteLink}</p>
                              )}
                              <p className="text-xs text-muted-foreground">{getRowSyncLabel(member.updatedAt)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{member.role}</Badge>
                              <Badge
                                variant={
                                  member.status === "pending"
                                    ? isInviteExpired(member.inviteExpiresAt)
                                      ? "destructive"
                                      : "secondary"
                                    : "outline"
                                }
                              >
                                {member.status === "pending" && isInviteExpired(member.inviteExpiresAt)
                                  ? "expired"
                                  : member.status}
                              </Badge>
                              {member.status === "pending" && (
                                <Button size="sm" variant="outline" onClick={() => handleCopyInviteLink(member.name, member.inviteLink)}>
                                  Copy Link
                                </Button>
                              )}
                              {member.status === "pending" && (
                                <Button size="sm" variant="outline" onClick={() => handleResendInvite(member.id, member.name)}>
                                  Resend
                                </Button>
                              )}
                              {member.status === "pending" && !isInviteExpired(member.inviteExpiresAt) && (
                                <Button size="sm" variant="outline" onClick={() => handleAcceptMemberInvite(member.id, member.name)}>
                                  Accept
                                </Button>
                              )}
                              <Button size="icon" variant="ghost" onClick={() => startEditingMember(member.id, member.name, member.email, member.role, member.status)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              {member.role !== "owner" && (
                                <Button size="icon" variant="ghost" onClick={() => handleDeleteMember(member.id, member.name)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Add Collaborator</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="member-name">Name</Label>
                      <Input id="member-name" value={memberName} onChange={(event) => setMemberName(event.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="member-email">Email</Label>
                      <Input id="member-email" type="email" value={memberEmail} onChange={(event) => setMemberEmail(event.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Select value={memberRole} onValueChange={(value) => setMemberRole(value as WorkspaceRole)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full" onClick={handleAddMember}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Member
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      New collaborators start as pending until they are accepted from the team list.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="tools" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>CSV Import</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {plan !== "diamond" ? (
                    <p className="text-sm text-muted-foreground">CSV import is reserved for Diamond workspaces.</p>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="csv-name">Import name</Label>
                        <Input id="csv-name" value={csvName} onChange={(event) => setCsvName(event.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="csv-text">CSV content</Label>
                        <Textarea id="csv-text" rows={10} value={csvText} onChange={(event) => setCsvText(event.target.value)} />
                      </div>
                      <Button className="w-full" onClick={handleImportCsv}>
                        <Upload className="mr-2 h-4 w-4" />
                        Process CSV
                      </Button>
                    </>
                  )}
                  <div className="space-y-2">
                    {importJobs.map((job) => (
                      <div key={job.id} className="rounded-lg border border-border p-3">
                        <p className="text-sm font-medium">{job.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {job.successCount}/{job.rowCount} rows processed • {job.status}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>API Access</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!isDiamondTier ? (
                    <p className="text-sm text-muted-foreground">API access and integrations are available on Diamond.</p>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="api-key-name">Key name</Label>
                        <Input id="api-key-name" value={apiKeyName} onChange={(event) => setApiKeyName(event.target.value)} />
                      </div>
                      <Button className="w-full" onClick={handleCreateApiKey}>
                        Generate API Key
                      </Button>
                    </>
                  )}
                  <div className="space-y-3">
                    {apiCredentials.map((credential) => (
                      <div key={credential.id} className="rounded-lg border border-border p-3">
                        <div className="flex items-center justify-between gap-2">
                          {editingApiKeyId === credential.id ? (
                            <div className="flex flex-1 items-center gap-2">
                              <Input value={apiKeyEditName} onChange={(event) => setApiKeyEditName(event.target.value)} />
                              <Button size="icon" variant="outline" onClick={() => handleUpdateApiKey(credential.id)}>
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => setEditingApiKeyId(null)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <>
                              <div>
                                <p className="text-sm font-medium">{credential.name}</p>
                                <p className="text-xs text-muted-foreground">{getRowSyncLabel(credential.updatedAt, credential.revokedAt)}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{credential.revokedAt ? "Revoked" : "Active"}</Badge>
                                <Button size="icon" variant="ghost" onClick={() => startEditingApiKey(credential.id, credential.name)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                {!credential.revokedAt && (
                                  <Button size="icon" variant="ghost" onClick={() => handleRotateApiKey(credential.id, credential.name)}>
                                    <KeyRound className="h-4 w-4" />
                                  </Button>
                                )}
                                {!credential.revokedAt && (
                                  <Button size="icon" variant="ghost" onClick={() => handleRevokeApiKey(credential.id, credential.name)}>
                                    <X className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button size="icon" variant="ghost" onClick={() => handleDeleteApiKey(credential.id, credential.name)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                        <p className="mt-1 break-all text-xs text-muted-foreground">{credential.token}</p>
                      </div>
                    ))}
                    {isDiamondTier && (
                      <div className="rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
                        Suggested endpoint shape:
                        <br />
                        `POST /api/posters/generate`
                        <br />
                        body: `{"{ fullName, gender, organization, message, format }"}`
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="restore" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Restore Bin</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 md:grid-cols-[1fr_220px]">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={restoreSearch}
                      onChange={(event) => setRestoreSearch(event.target.value)}
                      placeholder="Search deleted items"
                      className="pl-9"
                    />
                  </div>
                  <Select value={restoreKindFilter} onValueChange={setRestoreKindFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Item type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All item types</SelectItem>
                      <SelectItem value="draft">Drafts</SelectItem>
                      <SelectItem value="batch">Batches</SelectItem>
                      <SelectItem value="member">Team members</SelectItem>
                      <SelectItem value="api">API keys</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-muted-foreground">
                  Showing {filteredRecycleBin.length} of {recycleBin.length} deleted items
                </p>
                {filteredRecycleBin.length > 0 && (
                  <div className="flex flex-col gap-3 rounded-lg border border-border p-3 md:flex-row md:items-center md:justify-between">
                    <label className="flex items-center gap-3 text-sm">
                      <Checkbox
                        checked={
                          filteredRecycleBin.length > 0 &&
                          filteredRecycleBin.every((item) => selectedRestoreIds.includes(item.id))
                        }
                        onCheckedChange={(checked) => handleToggleAllRestoreSelection(checked === true)}
                      />
                      Select visible items
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={selectedRestoreIds.length === 0}
                        onClick={handleBulkRestore}
                      >
                        Restore Selected
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={selectedRestoreIds.length === 0}
                        onClick={handleBulkClearRestore}
                      >
                        Remove Selected
                      </Button>
                    </div>
                  </div>
                )}
                {recycleBin.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Deleted drafts, batches, team members, and API keys will appear here for recovery.</p>
                ) : filteredRecycleBin.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No deleted items match the current search and filters.</p>
                ) : (
                  filteredRecycleBin.map((item) => (
                    <div key={item.id} className="flex flex-col gap-3 rounded-lg border border-border p-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedRestoreIds.includes(item.id)}
                          onCheckedChange={(checked) => handleToggleRestoreSelection(item.id, checked === true)}
                        />
                        <div className="space-y-1">
                          <p className="font-medium">{item.label}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.kind} • deleted {new Date(item.deletedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleRestoreDeletedItem(item.id, item.label)}>
                          Restore
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleClearDeletedItem(item.id, item.label)}>
                          Remove Permanently
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <p className="text-sm text-muted-foreground">
          Need pricing details? <Link className="text-primary underline" to="/">Kembali ke Muka Utama</Link>
        </p>
      </div>
    </main>
  );
};

export default Dashboard;
