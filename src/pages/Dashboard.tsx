import { DragEvent, useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Activity, ArchiveRestore, ArrowDown, ArrowUp, Check, Cloud, Copy, FileStack, KeyRound, Pencil, Plus, Save, Search, Trash2, Upload, Users, X } from "lucide-react";

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
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSubscription } from "@/hooks/use-subscription";
import { AUTH_PENDING_IDENTITY, createEmptyPoster, useWorkspace } from "@/hooks/use-workspace";
import { PosterData } from "@/types/poster";
import { WorkspaceRole } from "@/types/workspace";

type PendingDeleteKind = "draft" | "batch" | "member" | "api";
const ENTERPRISE_REQUEST_STORAGE_KEY = "salam-takziah-enterprise-request";
const ISOLATE_DASHBOARD_RENDER = false;

interface AdminUserSummary {
  user_id: string;
  email: string;
  subscription_plan: string;
  app_role: string;
  generated_posters: number;
  downloaded_posters: number;
  created_at: string;
  last_sign_in_at: string | null;
}

interface EnterpriseRequestSummary {
  request_id: string;
  user_id: string | null;
  email: string;
  requested_plan: string;
  status: string;
  source: string;
  created_at: string;
  updated_at: string;
}

interface PendingDelete {
  id: string;
  label: string;
  kind: PendingDeleteKind;
  timeoutId: number;
}

const parseCsvRows = (csvText: string, isMs: boolean) => {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return {
      posters: [] as PosterData[],
      errors: [isMs ? "CSV memerlukan baris header dan sekurang-kurangnya satu baris data." : "CSV needs a header row and at least one data row."],
    };
  }

  const headers = lines[0].split(",").map((header) => header.trim());
  const posters: PosterData[] = [];
  const errors: string[] = [];

  lines.slice(1).forEach((line, index) => {
    const values = line.split(",").map((value) => value.trim());
    const row = Object.fromEntries(headers.map((header, headerIndex) => [header, values[headerIndex] ?? ""]));

    if (!row.fullName) {
      errors.push(isMs ? `Baris ${index + 2}: fullName diperlukan.` : `Row ${index + 2}: fullName is required.`);
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

const maskSecret = (value: string) => {
  if (value.length <= 8) {
    return "••••••••";
  }

  return `${value.slice(0, 4)}••••••••${value.slice(-4)}`;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const isMs = language === "ms";
  const {
    identity,
    plan,
    subscriptionPlan,
    isAuthResolved,
    isSuperadmin,
    isPaidTier,
    isDiamondTier,
    userEmail,
  } = useSubscription();
  const workspaceIdentity = isAuthResolved ? identity : AUTH_PENDING_IDENTITY;
  const workspaceEmail = isAuthResolved ? userEmail : null;
  const {
    drafts,
    batches,
    analytics,
    team,
    apiCredentials,
    importJobs,
    recycleBin,
    summary,
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
  } = useWorkspace({ identity: workspaceIdentity, userEmail: workspaceEmail, plan });
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
  const [adminUsers, setAdminUsers] = useState<AdminUserSummary[]>([]);
  const [enterpriseRequests, setEnterpriseRequests] = useState<EnterpriseRequestSummary[]>([]);
  const [isAdminDataLoading, setIsAdminDataLoading] = useState(false);
  const [adminDataError, setAdminDataError] = useState<string | null>(null);

  const planLabel = isSuperadmin
    ? t.dashboardPlanSuperadmin
    : plan === "diamond"
      ? t.dashboardPlanDiamond
      : plan === "premium"
        ? t.dashboardPlanPremium
        : t.dashboardPlanFree;
  const currentPlanDetails = t.homePlans.find((homePlan) =>
    subscriptionPlan === "diamond"
      ? homePlan.id === "enterprise"
      : subscriptionPlan === "premium"
        ? homePlan.id === "pro"
        : homePlan.id === "basic",
  );
  const freePosterHistory = analytics
    .filter((event) => event.type === "poster_generated")
    .slice(0, 10);
  const isInviteExpired = (inviteExpiresAt?: string) =>
    Boolean(inviteExpiresAt && new Date(inviteExpiresAt).getTime() < Date.now());
  const ui = {
    logoutFailed: isMs ? "Log keluar gagal" : "Logout failed",
    loggedOut: isMs ? "Berjaya log keluar" : "Logged out",
    signedOut: isMs ? "Anda telah log keluar." : "You have been signed out.",
    signOut: isMs ? "Log Keluar" : "Sign Out",
    selectDrafts: isMs ? "Pilih draf" : "Select drafts",
    chooseDrafts: isMs ? "Pilih sekurang-kurangnya satu draf untuk mencipta batch." : "Choose at least one draft to create a batch.",
    batchLimit: isMs ? "Had batch dicapai" : "Batch limit reached",
    batchLimitDesc: isMs ? "Premium menyokong sehingga 10 poster bagi setiap batch." : "Premium supports up to 10 posters per batch.",
    batchCreated: isMs ? "Batch dicipta" : "Batch created",
    missingDetails: isMs ? "Maklumat tidak lengkap" : "Missing details",
    missingDetailsDesc: isMs ? "Nama dan emel diperlukan untuk menjemput rakan sepasukan." : "Name and email are required to invite a teammate.",
    inviteCreated: isMs ? "Jemputan dicipta" : "Invite created",
    inviteCreatedDesc: isMs ? "Kolaborator telah ditambah dengan status jemputan tertunda." : "The collaborator has been added with a pending invite state.",
    apiKeyCreated: isMs ? "Kunci API dicipta" : "API key created",
    saveToken: isMs ? "Token berjaya dijana. Salin hanya apabila diperlukan." : "The token was generated successfully. Copy it only when needed.",
    csvProcessed: isMs ? "CSV diproses dengan isu" : "CSV processed with issues",
    csvImported: isMs ? "CSV diimport" : "CSV imported",
    deleted: isMs ? "Dipadam" : "Deleted",
    scheduledDelete: isMs ? "Dijadual untuk dipadam" : "Scheduled for deletion",
    draftRenamed: isMs ? "Draf dinamakan semula" : "Draft renamed",
    memberUpdated: isMs ? "Ahli dikemas kini" : "Member updated",
    apiKeyUpdated: isMs ? "Kunci API dikemas kini" : "API key updated",
    undoComplete: isMs ? "Undo berjaya" : "Undo complete",
    itemRestored: isMs ? "Item dipulihkan" : "Item restored",
    removedPermanently: isMs ? "Dibuang secara kekal" : "Removed permanently",
    batchUpdated: isMs ? "Batch dikemas kini" : "Batch updated",
    batchItemRemoved: isMs ? "Item batch dibuang" : "Batch item removed",
    batchItemUpdated: isMs ? "Item batch dikemas kini" : "Batch item updated",
    batchItemDuplicated: isMs ? "Item batch diduplikasi" : "Batch item duplicated",
    apiKeyRotated: isMs ? "Kunci API diputar semula" : "API key rotated",
    apiKeyRevoked: isMs ? "Kunci API dibatalkan" : "API key revoked",
    invitationAccepted: isMs ? "Jemputan diterima" : "Invitation accepted",
    inviteLinkUnavailable: isMs ? "Pautan jemputan tidak tersedia" : "Invite link unavailable",
    inviteLinkUnavailableDesc: isMs ? "Jana atau hantar semula pautan jemputan terlebih dahulu." : "Generate or resend the invite link first.",
    inviteLinkCopied: isMs ? "Pautan jemputan disalin" : "Invite link copied",
    copyFailed: isMs ? "Salin gagal" : "Copy failed",
    inviteLinkRefreshed: isMs ? "Pautan jemputan diperbaharui" : "Invite link refreshed",
    onlyPending: isMs ? "Hanya kolaborator tertunda boleh menerima pautan yang diperbaharui." : "Only pending collaborators can receive a renewed invite link.",
    itemsRestored: isMs ? "Item dipulihkan" : "Items restored",
    itemsRemoved: isMs ? "Item dibuang secara kekal" : "Items removed permanently",
    loading: isMs ? "Memuatkan..." : "Loading...",
    workspaceDashboard: isMs ? "Dashboard Ruang Kerja" : "Workspace Dashboard",
    signedInAs: isMs ? "Log masuk sebagai" : "Signed in as",
    noSession: isMs ? "Sesi log masuk tidak ditemui." : "Signed in session not found.",
    workspaceDesc: isMs ? "Bina draf, jalankan batch, semak analitik, urus kolaborator, dan sediakan import di satu tempat." : "Build drafts, run batch jobs, review analytics, manage collaborators, and prepare imports from one place.",
    freeWorkspaceDesc: isMs ? "Pelan Free memfokuskan penciptaan poster asas dengan had penggunaan, format, dan muat turun standard." : "The Free plan focuses on essential poster creation with standard usage, format, and download limits.",
    openBuilder: isMs ? "Buka Pembina Poster" : "Open Poster Builder",
    newDraft: isMs ? "Draf Baru" : "New Draft",
    currentPlanDetails: isMs ? "Butiran Pelan Semasa" : "Current Plan Details",
    freePlanAccessOnly: isMs ? "Akses Free Tier Sahaja" : "Free Tier Access Only",
    freePlanOnlyDesc: isMs ? "Dashboard ini hanya memaparkan ciri yang tersedia untuk pelan Basic Memorial." : "This dashboard only shows the features available on the Basic Memorial plan.",
    posterHistory: isMs ? "Sejarah Poster" : "Poster History",
    posterHistoryDesc: isMs ? "Jejak poster yang telah dijana dalam akaun Free anda." : "Track posters that have been generated in your Free account.",
    noPosterHistory: isMs ? "Belum ada poster dijana. Gunakan pembina poster untuk mula mencipta memorial pertama anda." : "No posters have been generated yet. Use the poster builder to create your first memorial.",
    generatedOn: isMs ? "Dijana pada" : "Generated on",
    simplePlanSummary: isMs ? "Ringkasan pelan asas" : "Simple plan summary",
    posterPerMonth: isMs ? "5 poster sebulan" : "5 posters per month",
    classicOnly: isMs ? "Classic 4:3 & Instagram Story 9:16" : "Classic 4:3 & Instagram Story 9:16",
    watermarked: isMs ? "Muat turun bertanda air" : "Watermarked downloads",
    cloudSyncAttention: isMs ? "Penyegerakan awan memerlukan perhatian" : "Cloud sync needs attention",
    syncingWorkspace: isMs ? "Menyegerak ruang kerja ke Supabase..." : "Syncing workspace to Supabase...",
    workspaceConnected: isMs ? "Penyegerakan ruang kerja disambungkan" : "Workspace sync is connected",
    localWorkspaceMode: isMs ? "Menggunakan mod ruang kerja tempatan" : "Using local workspace mode",
    lastSynced: isMs ? "Disegerak terakhir" : "Last synced",
    cloudSyncLater: isMs ? "Penyegerakan awan akan bermula selepas ruang kerja tersedia di Supabase." : "Cloud sync will start after your workspace is available in Supabase.",
    retrySync: isMs ? "Cuba Lagi" : "Retry Sync",
    openBuilderShort: isMs ? "Buka Pembina" : "Open Builder",
    overview: isMs ? "Ringkasan" : "Overview",
    quickAccess: isMs ? "Fokus pada draf, batch, dan tindakan utama tanpa gangguan." : "Focus on drafts, batches, and the main actions without extra clutter.",
    queuedDeletion: isMs ? "dijadual untuk dipadam." : "is queued for deletion.",
    undo: isMs ? "Undo" : "Undo",
    cloudDrafts: isMs ? "Draf Awan" : "Cloud Drafts",
    cloudDraftsDesc: isMs ? "Draf poster boleh guna semula dalam ruang kerja anda" : "Reusable poster drafts in your workspace",
    batchProjects: isMs ? "Projek Batch" : "Batch Projects",
    batchProjectsDesc: isMs ? "Batch poster manual dan berasaskan CSV" : "Manual and CSV-based poster batches",
    analyticsEvents: isMs ? "Acara Analitik" : "Analytics Events",
    analyticsEventsDesc: isMs ? "Penggunaan yang dijejak merentasi pembina dan dashboard" : "Tracked usage across builder and dashboard",
    teamMembers: isMs ? "Ahli Pasukan" : "Team Members",
    teamMembersDesc: isMs ? "Kolaborator ruang kerja dan peranan" : "Workspace collaborators and roles",
    restoreBin: isMs ? "Tong Pulih" : "Restore Bin",
    restoreBinDesc: isMs ? "Pulihkan item ruang kerja yang dipadam baru-baru ini" : "Recover recently deleted workspace items",
    restoreDescShort: isMs ? "Item dipadam yang masih boleh dipulihkan." : "Deleted items that can still be restored.",
    teamDescShort: isMs ? "Kolaborator aktif dan tertunda." : "Active and pending collaborators.",
    outputDescShort: isMs ? "Poster dan batch yang telah anda sediakan." : "Posters and batches you have prepared.",
    drafts: isMs ? "Draf" : "Drafts",
    batches: isMs ? "Batch" : "Batches",
    analytics: isMs ? "Analitik" : "Analytics",
    team: isMs ? "Pasukan" : "Team",
    tools: isMs ? "CSV / API" : "CSV / API",
    savedDrafts: isMs ? "Draf Tersimpan" : "Saved Drafts",
    searchDrafts: isMs ? "Cari ikut draf, nama, atau organisasi" : "Search by draft, person, or organization",
    allThemes: isMs ? "Semua tema" : "All themes",
    allFormats: isMs ? "Semua format" : "All formats",
    showingDrafts: isMs ? "Menunjukkan" : "Showing",
    of: isMs ? "daripada" : "of",
    noDraftsYet: isMs ? "Tiada draf lagi. Simpan satu dari pembina poster untuk guna semula di sini." : "No drafts yet. Save one from the poster builder to reuse it here.",
    noDraftsMatch: isMs ? "Tiada draf sepadan dengan carian dan penapis semasa." : "No drafts match the current search and filters.",
    updated: isMs ? "Dikemas kini" : "Updated",
    untitledMemorial: isMs ? "Memorial tanpa tajuk" : "Untitled memorial",
    open: isMs ? "Buka" : "Open",
    delete: isMs ? "Padam" : "Delete",
    createBatchFromDrafts: isMs ? "Cipta Batch Daripada Draf" : "Create Batch From Drafts",
    batchName: isMs ? "Nama batch" : "Batch name",
    batchPlaceholder: isMs ? "Batch memorial mingguan" : "Weekly memorial batch",
    addDraftsFirst: isMs ? "Tambah draf dahulu, kemudian pilih di sini untuk diproses sebagai batch." : "Add drafts first, then select them here for batch processing.",
    createBatch: isMs ? "Cipta Batch" : "Create Batch",
    premiumBatchHint: isMs ? "Premium menyokong sehingga 10 poster per batch. Diamond boleh membina batch organisasi yang lebih besar." : "Premium supports up to 10 posters per batch. Diamond can build larger organization batches.",
    batchPaidOnlyTitle: isMs ? "Penciptaan batch tersedia pada pelan berbayar" : "Batch creation is available on paid plans",
    batchPaidOnlyDesc: isMs ? "Naik taraf ke Premium atau Diamond untuk menyediakan kumpulan poster dan memproses memorial dengan lebih pantas." : "Upgrade to Premium or Diamond to prepare poster groups and process multiple memorials faster.",
    noBatchesYet: isMs ? "Tiada projek batch lagi. Cipta satu daripada draf atau import CSV." : "No batch projects yet. Create one from drafts or a CSV import.",
    postersLabel: isMs ? "poster" : "posters",
    updatedShort: isMs ? "dikemas kini" : "updated",
    fullName: isMs ? "Nama penuh" : "Full name",
    organization: isMs ? "Organisasi" : "Organization",
    from: isMs ? "Daripada" : "From",
    shortMessage: isMs ? "Ucapan takziah ringkas" : "Short condolence message",
    saveItem: isMs ? "Simpan Item" : "Save Item",
    cancel: isMs ? "Batal" : "Cancel",
    noOrganization: isMs ? "Tiada organisasi" : "No organization",
    itemPosition: isMs ? "Item" : "Item",
    ofTotal: isMs ? "daripada" : "of",
    dragToReorder: isMs ? "Seret dan lepas untuk menyusun semula dalam batch ini." : "Drag and drop to reorder within this batch.",
    analyticsDiamondTitle: isMs ? "Analitik lanjutan dibuka pada Diamond" : "Advanced analytics unlock on Diamond",
    analyticsDiamondDesc: isMs ? "Ruang kerja Diamond boleh menyemak trend penjanaan, penggunaan draf, import, dan aktiviti pasukan di satu tempat." : "Diamond workspaces can review generation trends, draft usage, imports, and team activity in one place.",
    generated: isMs ? "Dijana" : "Generated",
    downloaded: isMs ? "Dimuat Turun" : "Downloaded",
    draftSaves: isMs ? "Simpanan Draf" : "Draft Saves",
    csvImports: isMs ? "Import CSV" : "CSV Imports",
    apiKeys: isMs ? "Kunci API" : "API Keys",
    recentActivity: isMs ? "Aktiviti Terkini" : "Recent Activity",
    analyticsEmpty: isMs ? "Acara analitik akan muncul di sini apabila pasukan anda menggunakan ruang kerja." : "Analytics events will appear here as your team uses the workspace.",
    teamDiamondTitle: isMs ? "Kolaborasi pasukan dibuka pada Diamond" : "Team collaboration unlocks on Diamond",
    teamDiamondDesc: isMs ? "Ruang kerja Diamond boleh mengurus peranan, menyelaras operasi memorial, dan berkongsi konteks ruang kerja." : "Diamond workspaces can manage roles, coordinate memorial operations, and share workspace context.",
    workspaceTeam: isMs ? "Pasukan Ruang Kerja" : "Workspace Team",
    pendingSince: isMs ? "Jemputan tertunda sejak" : "Invite pending since",
    acceptedOn: isMs ? "Diterima" : "Accepted",
    acceptedCollaborator: isMs ? "Kolaborator diterima" : "Accepted collaborator",
    inviteLinkExpired: isMs ? "Pautan jemputan tamat" : "Invite link expired",
    inviteLinkExpires: isMs ? "Pautan jemputan tamat pada" : "Invite link expires",
    expired: isMs ? "tamat" : "expired",
    copyLink: isMs ? "Salin Pautan" : "Copy Link",
    resend: isMs ? "Hantar Semula" : "Resend",
    accept: isMs ? "Terima" : "Accept",
    addCollaborator: isMs ? "Tambah Kolaborator" : "Add Collaborator",
    name: isMs ? "Nama" : "Name",
    email: isMs ? "Emel" : "Email",
    role: isMs ? "Peranan" : "Role",
    addMember: isMs ? "Tambah Ahli" : "Add Member",
    pendingInviteHint: isMs ? "Kolaborator baharu bermula sebagai tertunda sehingga diterima dari senarai pasukan." : "New collaborators start as pending until they are accepted from the team list.",
    csvImportReserved: isMs ? "Import CSV dikhaskan untuk ruang kerja Diamond." : "CSV import is reserved for Diamond workspaces.",
    importName: isMs ? "Nama import" : "Import name",
    csvContent: isMs ? "Kandungan CSV" : "CSV content",
    processCsv: isMs ? "Proses CSV" : "Process CSV",
    apiAccess: isMs ? "Akses API" : "API Access",
    apiAccessReserved: isMs ? "Akses API dan integrasi tersedia pada Diamond." : "API access and integrations are available on Diamond.",
    keyName: isMs ? "Nama kunci" : "Key name",
    generateApiKey: isMs ? "Jana Kunci API" : "Generate API Key",
    copyToken: isMs ? "Salin Token" : "Copy Token",
    tokenCopied: isMs ? "Token disalin" : "Token copied",
    tokenCopyFailed: isMs ? "Token tidak dapat disalin" : "Token could not be copied",
    tokenHidden: isMs ? "Token disembunyikan untuk keselamatan" : "Token hidden for safety",
    revoked: isMs ? "Dibatalkan" : "Revoked",
    active: isMs ? "Aktif" : "Active",
    suggestedEndpoint: isMs ? "Contoh bentuk endpoint:" : "Suggested endpoint shape:",
    searchDeleted: isMs ? "Cari item dipadam" : "Search deleted items",
    itemType: isMs ? "Jenis item" : "Item type",
    allItemTypes: isMs ? "Semua jenis item" : "All item types",
    draftsType: isMs ? "Draf" : "Drafts",
    batchesType: isMs ? "Batch" : "Batches",
    membersType: isMs ? "Ahli pasukan" : "Team members",
    apiKeysType: isMs ? "Kunci API" : "API keys",
    showingDeleted: isMs ? "Menunjukkan" : "Showing",
    deletedItems: isMs ? "item dipadam" : "deleted items",
    selectVisible: isMs ? "Pilih item yang kelihatan" : "Select visible items",
    restoreSelected: isMs ? "Pulihkan Dipilih" : "Restore Selected",
    removeSelected: isMs ? "Buang Dipilih" : "Remove Selected",
    restoreEmpty: isMs ? "Draf, batch, ahli pasukan, dan kunci API yang dipadam akan muncul di sini untuk dipulihkan." : "Deleted drafts, batches, team members, and API keys will appear here for recovery.",
    restoreNoMatch: isMs ? "Tiada item dipadam sepadan dengan carian dan penapis semasa." : "No deleted items match the current search and filters.",
    deletedAt: isMs ? "dipadam" : "deleted",
    restore: isMs ? "Pulihkan" : "Restore",
    removePermanently: isMs ? "Buang Secara Kekal" : "Remove Permanently",
    pricingDetails: isMs ? "Perlu lihat butiran harga?" : "Need pricing details?",
    backHome: isMs ? "Kembali ke Halaman Utama" : "Back to Home",
    superadminUsageOverview: isMs ? "Ringkasan Aktiviti Pengguna" : "User Activity Overview",
    superadminUsageDesc: isMs ? "Jumlah keseluruhan poster yang dijana dan dimuat turun di seluruh platform." : "Overall generated and downloaded poster totals across the platform.",
    allUsers: isMs ? "Semua Pengguna" : "All Users",
    allUsersDesc: isMs ? "Senarai akaun yang berdaftar dalam platform untuk semakan superadmin." : "Registered platform accounts available to the superadmin.",
    enterpriseRequests: isMs ? "Permintaan Enterprise Memorial" : "Enterprise Memorial Requests",
    enterpriseRequestsDesc: isMs ? "Pengguna yang meminta akses atau dihubungi untuk pelan Enterprise." : "Users who asked for Enterprise access or sales contact.",
    noUsersYet: isMs ? "Belum ada pengguna dipaparkan." : "No users are available yet.",
    noEnterpriseRequestsYet: isMs ? "Belum ada permintaan Enterprise." : "No Enterprise requests yet.",
    appRole: isMs ? "Peranan Aplikasi" : "App Role",
    created: isMs ? "Dicipta" : "Created",
    lastSignIn: isMs ? "Log masuk terakhir" : "Last sign-in",
    neverSignedIn: isMs ? "Belum pernah log masuk" : "Never signed in",
    requestSource: isMs ? "Sumber" : "Source",
    requestStatus: isMs ? "Status" : "Status",
    requestCaptured: isMs ? "Permintaan Enterprise diterima" : "Enterprise request received",
    requestCapturedDesc: isMs ? "Permintaan anda untuk pelan Enterprise telah direkodkan." : "Your Enterprise plan request has been recorded.",
  };

  const overviewCards = useMemo(() => {
    if (!isPaidTier) {
      return [];
    }

    if (isDiamondTier) {
      return [
        { title: ui.cloudDrafts, value: summary.draftCount, description: ui.cloudDraftsDesc },
        { title: ui.analyticsEvents, value: analytics.length, description: ui.analyticsEventsDesc },
        { title: ui.teamMembers, value: summary.teamCount, description: ui.teamDescShort },
        { title: ui.restoreBin, value: summary.recycleBinCount, description: ui.restoreDescShort },
      ];
    }

    return [
      { title: ui.cloudDrafts, value: summary.draftCount, description: ui.cloudDraftsDesc },
      { title: ui.batchProjects, value: summary.batchCount, description: ui.outputDescShort },
      { title: ui.restoreBin, value: summary.recycleBinCount, description: ui.restoreDescShort },
    ];
  }, [analytics.length, isDiamondTier, isPaidTier, summary.batchCount, summary.draftCount, summary.recycleBinCount, summary.teamCount, ui.analyticsEvents, ui.analyticsEventsDesc, ui.batchProjects, ui.cloudDrafts, ui.cloudDraftsDesc, ui.outputDescShort, ui.restoreBin, ui.restoreDescShort, ui.teamDescShort, ui.teamMembers]);

  const visibleTabs = useMemo(() => {
    if (!isPaidTier) {
      return [];
    }

    if (isDiamondTier) {
      return [
        { value: "drafts", label: ui.drafts, icon: Cloud },
        { value: "batches", label: ui.batches, icon: FileStack },
        { value: "analytics", label: ui.analytics, icon: Activity },
        { value: "team", label: ui.team, icon: Users },
        { value: "tools", label: ui.tools, icon: KeyRound },
        { value: "restore", label: ui.restoreBin, icon: ArchiveRestore },
      ];
    }

    return [
      { value: "drafts", label: ui.drafts, icon: Cloud },
      { value: "batches", label: ui.batches, icon: FileStack },
      { value: "restore", label: ui.restoreBin, icon: ArchiveRestore },
    ];
  }, [isDiamondTier, isPaidTier, ui.analytics, ui.batches, ui.drafts, ui.restoreBin, ui.team, ui.tools]);

  const getRowSyncLabel = (updatedAt?: string, revokedAt?: string) => {
    if (revokedAt) {
      return `${isMs ? "Dibatalkan" : "Revoked"} ${new Date(revokedAt).toLocaleString()}`;
    }

    if (!updatedAt) {
      return isMs ? "Belum disegerakkan" : "Not synced yet";
    }

    return isMs ? "Disimpan dalam ruang kerja" : "Saved in workspace";
  };

  useEffect(() => {
    return () => {
      pendingDeletes.forEach((pendingDelete) => window.clearTimeout(pendingDelete.timeoutId));
    };
  }, [pendingDeletes]);

  const analyticsSummary = useMemo(
    () => ({
      generated: analytics.filter((event) => event.type === "poster_generated").length,
      downloaded: analytics.filter((event) => event.type === "poster_downloaded").length,
      savedDrafts: analytics.filter((event) => event.type === "draft_saved").length,
      imports: analytics.filter((event) => event.type === "csv_imported").length,
      apiKeys: analytics.filter((event) => event.type === "api_key_created").length,
    }),
    [analytics],
  );
  const adminUsageSummary = useMemo(
    () => ({
      generated: adminUsers.reduce((total, user) => total + (user.generated_posters ?? 0), 0),
      downloaded: adminUsers.reduce((total, user) => total + (user.downloaded_posters ?? 0), 0),
    }),
    [adminUsers],
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
    if (typeof window === "undefined" || !userEmail) {
      return;
    }

    const requestSource = window.sessionStorage.getItem(ENTERPRISE_REQUEST_STORAGE_KEY);
    if (!requestSource) {
      return;
    }

    const submitPendingEnterpriseRequest = async () => {
      const { error } = await supabase.rpc("submit_enterprise_request", { request_source: requestSource });

      if (error) {
        window.sessionStorage.removeItem(ENTERPRISE_REQUEST_STORAGE_KEY);
        return;
      }

      window.sessionStorage.removeItem(ENTERPRISE_REQUEST_STORAGE_KEY);
      toast({
        title: ui.requestCaptured,
        description: ui.requestCapturedDesc,
      });
    };

    void submitPendingEnterpriseRequest();
  }, [ui.requestCaptured, ui.requestCapturedDesc, userEmail]);

  useEffect(() => {
    if (!isSuperadmin) {
      setAdminUsers([]);
      setEnterpriseRequests([]);
      setAdminDataError(null);
      setIsAdminDataLoading(false);
      return;
    }

    let isActive = true;

    const loadAdminData = async () => {
      setIsAdminDataLoading(true);
      const [{ data: usersData, error: usersError }, { data: requestsData, error: requestsError }] = await Promise.all([
        supabase.rpc("admin_list_users"),
        supabase.rpc("admin_list_enterprise_requests"),
      ]);

      if (!isActive) {
        return;
      }

      if (usersError || requestsError) {
        setAdminDataError(usersError?.message ?? requestsError?.message ?? "Failed to load superadmin data.");
        setAdminUsers([]);
        setEnterpriseRequests([]);
        setIsAdminDataLoading(false);
        return;
      }

      setAdminUsers((usersData ?? []) as AdminUserSummary[]);
      setEnterpriseRequests((requestsData ?? []) as EnterpriseRequestSummary[]);
      setAdminDataError(null);
      setIsAdminDataLoading(false);
    };

    void loadAdminData();

    return () => {
      isActive = false;
    };
  }, [isSuperadmin]);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: ui.logoutFailed,
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({ title: ui.loggedOut, description: ui.signedOut });
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
        sourceLabel: `${isMs ? "draf" : "draft"}: ${draftTitle}`,
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
      toast({ title: ui.selectDrafts, description: ui.chooseDrafts });
      return;
    }

    if (plan === "premium" && selectedDrafts.length > 10) {
      toast({ title: ui.batchLimit, description: ui.batchLimitDesc });
      return;
    }

    const batch = createBatch(batchName.trim() || `Batch ${batches.length + 1}`, selectedDrafts.map((draft) => draft.poster), "manual");
    setSelectedDraftIds([]);
    setBatchName("");
    toast({ title: ui.batchCreated, description: isMs ? `${batch.items.length} poster ditambah ke ${batch.name}.` : `${batch.items.length} posters added to ${batch.name}.` });
  };

  const handleAddMember = () => {
    if (!memberName.trim() || !memberEmail.trim()) {
      toast({ title: ui.missingDetails, description: ui.missingDetailsDesc });
      return;
    }

    addTeamMember(memberName.trim(), memberEmail.trim(), memberRole);
    setMemberName("");
    setMemberEmail("");
    setMemberRole("editor");
    toast({ title: ui.inviteCreated, description: ui.inviteCreatedDesc });
  };

  const handleCreateApiKey = () => {
    const credential = createApiCredential(apiKeyName.trim() || (isMs ? "Integrasi ruang kerja" : "Workspace integration"));
    setApiKeyName(isMs ? "Integrasi dashboard" : "Dashboard integration");
    toast({
      title: ui.apiKeyCreated,
      description: `${ui.saveToken} (${maskSecret(credential.token)})`,
    });
  };

  const handleImportCsv = () => {
    const { posters, errors } = parseCsvRows(csvText, isMs);
    const job = createImportJob(csvName.trim() || (isMs ? "Import CSV" : "CSV import"), posters.length + errors.length, posters.length, errors);

    if (posters.length > 0) {
      createBatch(csvName.trim() || (isMs ? "Import CSV" : "CSV import"), posters, "csv");
    }

    toast({
      title: errors.length > 0 ? ui.csvProcessed : ui.csvImported,
      description: isMs
        ? `${job.successCount} baris sedia untuk penciptaan poster${errors.length > 0 ? `, ${errors.length} baris perlu disemak.` : "."}`
        : `${job.successCount} rows ready for poster creation${errors.length > 0 ? `, ${errors.length} rows need review.` : "."}`,
    });
  };

  const handleQuickDraft = () => {
    const draft = saveDraft(isMs ? "Draf memorial pantas" : "Quick memorial draft", createEmptyPoster());
    openDraft(draft.id, draft.title, draft.poster);
  };

  const queueDelete = (id: string, label: string, kind: PendingDeleteKind, onCommit: () => void) => {
    const timeoutId = window.setTimeout(() => {
      onCommit();
      setPendingDeletes((current) => current.filter((item) => item.id !== id));
      toast({ title: ui.deleted, description: isMs ? `${label} telah dibuang.` : `${label} has been removed.` });
    }, 5000);

    setPendingDeletes((current) => [
      ...current.filter((item) => item.id !== id),
      { id, label, kind, timeoutId },
    ]);

    toast({
      title: ui.scheduledDelete,
      description: isMs ? `${label} akan dipadam dalam 5 saat melainkan anda undo di bawah.` : `${label} will be deleted in 5 seconds unless you undo it below.`,
    });
  };

  const handleDeleteDraft = (draftId: string, draftTitle: string) => {
    queueDelete(draftId, draftTitle, "draft", () => deleteDraft(draftId));
  };

  const handleRenameDraft = (draftId: string) => {
    renameDraft(draftId, draftTitleInput);
    setRenamingDraftId(null);
    setDraftTitleInput("");
    toast({ title: ui.draftRenamed, description: isMs ? "Tajuk draf telah dikemas kini." : "The draft title has been updated." });
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
    toast({ title: ui.memberUpdated, description: isMs ? "Butiran kolaborator telah disimpan." : "The collaborator details have been saved." });
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
    toast({ title: ui.apiKeyUpdated, description: isMs ? "Label kredensial telah dikemas kini." : "The credential label has been updated." });
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
    toast({ title: ui.undoComplete, description: isMs ? `${pendingDelete.label} dikekalkan.` : `${pendingDelete.label} was kept.` });
  };

  const handleRestoreDeletedItem = (deletedItemId: string, label: string) => {
    restoreDeletedItem(deletedItemId);
    toast({ title: ui.itemRestored, description: isMs ? `${label} telah dipulihkan ke ruang kerja.` : `${label} has been restored to the workspace.` });
  };

  const handleClearDeletedItem = (deletedItemId: string, label: string) => {
    clearDeletedItem(deletedItemId);
    toast({ title: ui.removedPermanently, description: isMs ? `${label} telah dibuang dari tong pulih.` : `${label} was removed from the restore bin.` });
  };

  const startEditingBatch = (batchId: string, name: string) => {
    setEditingBatchId(batchId);
    setBatchEditName(name);
  };

  const handleUpdateBatch = (batchId: string) => {
    updateBatch(batchId, { name: batchEditName });
    setEditingBatchId(null);
    setBatchEditName("");
    toast({ title: ui.batchUpdated, description: isMs ? "Nama batch telah disimpan." : "The batch name has been saved." });
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
      title: ui.batchItemRemoved,
      description: isMs ? `${label} telah dibuang dari batch.` : `${label} was removed from the batch.`,
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
      title: ui.batchItemUpdated,
      description: isMs ? "Butiran poster telah dikemas kini dalam batch ini." : "The poster details were updated inside this batch.",
    });
  };

  const handleDuplicateBatchItem = (batchId: string, itemId: string, label: string) => {
    duplicateBatchItem(batchId, itemId);
    toast({
      title: ui.batchItemDuplicated,
      description: isMs ? `${label} telah diduplikasi dalam batch.` : `${label} was duplicated inside the batch.`,
    });
  };

  const handleRotateApiKey = (credentialId: string, name: string) => {
    const nextToken = rotateApiCredential(credentialId);
    toast({
      title: ui.apiKeyRotated,
      description: isMs ? `${name} kini menggunakan token baharu (${maskSecret(nextToken)}).` : `${name} now uses a new token (${maskSecret(nextToken)}).`,
    });
  };

  const handleCopyApiToken = async (name: string, token: string) => {
    try {
      await navigator.clipboard.writeText(token);
      toast({
        title: ui.tokenCopied,
        description: isMs ? `Token untuk ${name} telah disalin.` : `The token for ${name} has been copied.`,
      });
    } catch {
      toast({
        title: ui.tokenCopyFailed,
        description: isMs ? "Sila salin token secara manual jika perlu." : "Please copy the token manually if needed.",
        variant: "destructive",
      });
    }
  };

  const handleRevokeApiKey = (credentialId: string, name: string) => {
    revokeApiCredential(credentialId);
    toast({
      title: ui.apiKeyRevoked,
      description: isMs ? `${name} telah dibatalkan dan tidak patut digunakan lagi.` : `${name} has been revoked and should no longer be used.`,
    });
  };

  const handleAcceptMemberInvite = (memberId: string, name: string) => {
    acceptTeamMemberInvite(memberId);
    toast({
      title: ui.invitationAccepted,
      description: isMs ? `${name} kini ialah kolaborator aktif.` : `${name} is now an active collaborator.`,
    });
  };

  const handleCopyInviteLink = async (name: string, inviteLink?: string) => {
    if (!inviteLink) {
      toast({
        title: ui.inviteLinkUnavailable,
        description: ui.inviteLinkUnavailableDesc,
        variant: "destructive",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(inviteLink);
      toast({
        title: ui.inviteLinkCopied,
        description: isMs ? `Pautan kongsi ${name} sedia untuk dihantar.` : `${name}'s share link is ready to send.`,
      });
    } catch {
      toast({
        title: ui.copyFailed,
        description: inviteLink,
        variant: "destructive",
      });
    }
  };

  const handleResendInvite = (memberId: string, name: string) => {
    const inviteLink = resendTeamMemberInvite(memberId);

    toast({
      title: ui.inviteLinkRefreshed,
      description: inviteLink
        ? (isMs ? `Pautan jemputan ${name} telah diperbaharui untuk 7 hari lagi.` : `${name}'s invite link has been renewed for another 7 days.`)
        : ui.onlyPending,
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
      title: ui.itemsRestored,
      description: isMs
        ? `${selectedRestoreIds.length} item dipadam telah dipulihkan ke ruang kerja.`
        : `${selectedRestoreIds.length} deleted item${selectedRestoreIds.length === 1 ? "" : "s"} restored to the workspace.`,
    });
    setSelectedRestoreIds([]);
  };

  const handleBulkClearRestore = () => {
    if (selectedRestoreIds.length === 0) {
      return;
    }

    clearDeletedItems(selectedRestoreIds);
    toast({
      title: ui.itemsRemoved,
      description: isMs
        ? `${selectedRestoreIds.length} item dipadam telah dibuang dari tong pulih.`
        : `${selectedRestoreIds.length} deleted item${selectedRestoreIds.length === 1 ? "" : "s"} removed from the restore bin.`,
    });
    setSelectedRestoreIds([]);
  };

  if (!isAuthResolved) {
    return <main className="min-h-screen bg-background flex items-center justify-center">{ui.loading}</main>;
  }

  if (ISOLATE_DASHBOARD_RENDER) {
    return (
      <main className="min-h-screen bg-background p-4 md:p-6">
        <div className="mx-auto flex min-h-[80vh] max-w-4xl items-center justify-center">
          <Card className="w-full">
            <CardContent className="space-y-4 py-10 text-center">
              <h1 className="text-3xl font-semibold">{ui.workspaceDashboard}</h1>
              <p className="text-muted-foreground">
                {userEmail ? `${ui.signedInAs} ${userEmail}` : ui.noSession}
              </p>
              <p className="text-sm text-muted-foreground">
                Dashboard isolation mode is active.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button variant="secondary" onClick={() => navigate("/create")}>
                  {ui.openBuilder}
                </Button>
                <Button variant="destructive" onClick={signOut}>
                  {ui.signOut}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold">{ui.workspaceDashboard}</h1>
              <Badge variant={plan === "free" ? "outline" : "default"}>{planLabel}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {userEmail ? `${ui.signedInAs} ${userEmail}` : ui.noSession}
            </p>
            <p className="text-sm text-muted-foreground">
              {isPaidTier ? ui.quickAccess : ui.workspaceDesc}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <LanguageSwitcher />
            <Button variant="secondary" onClick={() => navigate("/create")}>
              {ui.openBuilder}
            </Button>
            <Button variant="outline" onClick={handleQuickDraft}>
              {ui.newDraft}
            </Button>
            <Button variant="destructive" onClick={signOut}>
              {ui.signOut}
            </Button>
          </div>
        </div>

        {pendingDeletes.length > 0 && (
          <Card>
            <CardContent className="space-y-3 py-4">
              {pendingDeletes.map((pendingDelete) => (
                <div key={pendingDelete.id} className="flex flex-col gap-2 rounded-lg border border-border p-3 md:flex-row md:items-center md:justify-between">
                  <p className="text-sm text-muted-foreground">
                    `{pendingDelete.label}` {ui.queuedDeletion}
                  </p>
                  <Button variant="outline" size="sm" onClick={() => handleUndoDelete(pendingDelete.id)}>
                    {ui.undo}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {isSuperadmin && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>{ui.superadminUsageOverview}</CardTitle>
                  <p className="text-sm text-muted-foreground">{ui.superadminUsageDesc}</p>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-border/70 p-4">
                    <p className="text-xs text-muted-foreground">{ui.generated}</p>
                    <p className="mt-2 text-3xl font-semibold">{adminUsageSummary.generated}</p>
                  </div>
                  <div className="rounded-xl border border-border/70 p-4">
                    <p className="text-xs text-muted-foreground">{ui.downloaded}</p>
                    <p className="mt-2 text-3xl font-semibold">{adminUsageSummary.downloaded}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
              <Card>
              <CardHeader>
                <CardTitle>{ui.allUsers}</CardTitle>
                <p className="text-sm text-muted-foreground">{ui.allUsersDesc}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {isAdminDataLoading ? (
                  <p className="text-sm text-muted-foreground">{ui.loading}</p>
                ) : adminDataError ? (
                  <p className="text-sm text-destructive">{adminDataError}</p>
                ) : adminUsers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{ui.noUsersYet}</p>
                ) : (
                  adminUsers.map((user) => (
                    <div key={user.user_id} className="rounded-xl border border-border/70 p-4">
                      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-1">
                          <p className="font-medium">{user.email}</p>
                          <p className="text-xs text-muted-foreground">
                            {ui.created} {new Date(user.created_at).toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {ui.lastSignIn}{" "}
                            {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : ui.neverSignedIn}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">{user.subscription_plan}</Badge>
                          <Badge>{user.app_role}</Badge>
                          <Badge variant="secondary">{ui.generated}: {user.generated_posters ?? 0}</Badge>
                          <Badge variant="secondary">{ui.downloaded}: {user.downloaded_posters ?? 0}</Badge>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{ui.enterpriseRequests}</CardTitle>
                <p className="text-sm text-muted-foreground">{ui.enterpriseRequestsDesc}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {isAdminDataLoading ? (
                  <p className="text-sm text-muted-foreground">{ui.loading}</p>
                ) : adminDataError ? (
                  <p className="text-sm text-destructive">{adminDataError}</p>
                ) : enterpriseRequests.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{ui.noEnterpriseRequestsYet}</p>
                ) : (
                  enterpriseRequests.map((request) => (
                    <div key={request.request_id} className="rounded-xl border border-border/70 p-4">
                      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-1">
                          <p className="font-medium">{request.email}</p>
                          <p className="text-xs text-muted-foreground">
                            {ui.created} {new Date(request.created_at).toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {ui.requestSource}: {request.source}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">{request.requested_plan}</Badge>
                          <Badge>{request.status}</Badge>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
            </div>
          </div>
        )}

        {!isPaidTier && currentPlanDetails ? (
          <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <Card>
              <CardHeader className="space-y-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl">{currentPlanDetails.name}</CardTitle>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{currentPlanDetails.tier}</Badge>
                      <span className="text-3xl font-semibold">
                        {currentPlanDetails.price}
                        <span className="ml-1 text-base font-normal text-muted-foreground">
                          /{currentPlanDetails.period}
                        </span>
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{currentPlanDetails.description}</p>
                  </div>
                  <Badge variant="secondary">{ui.freePlanAccessOnly}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl border border-border bg-muted/30 p-4">
                  <p className="text-sm font-medium">{ui.simplePlanSummary}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{ui.freeWorkspaceDesc}</p>
                </div>
                <div className="grid gap-3">
                  {[ui.posterPerMonth, ui.classicOnly, ui.watermarked].map((item) => (
                    <div key={item} className="flex items-start gap-3 rounded-xl border border-border/70 p-3">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{ui.posterHistory}</CardTitle>
                <p className="text-sm text-muted-foreground">{ui.posterHistoryDesc}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {freePosterHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{ui.noPosterHistory}</p>
                ) : (
                  freePosterHistory.map((event) => (
                    <div key={event.id} className="rounded-xl border border-border/70 p-4">
                      <p className="font-medium">
                        {typeof event.meta?.fullName === "string" && event.meta.fullName.length > 0
                          ? event.meta.fullName
                          : ui.untitledMemorial}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {ui.generatedOn} {new Date(event.createdAt).toLocaleString()}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {(typeof event.meta?.format === "string" ? event.meta.format : "classic")} • {typeof event.meta?.theme === "string" ? event.meta.theme : "classic"}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
        <>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>{ui.overview}</CardTitle>
            <p className="text-sm text-muted-foreground">{ui.quickAccess}</p>
          </CardHeader>
          <CardContent>
            <div className={`grid gap-4 ${isDiamondTier ? "md:grid-cols-4" : "md:grid-cols-3"}`}>
              {overviewCards.map((card) => (
                <div key={card.title} className="rounded-xl border border-border/70 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">{card.title}</p>
                  <p className="mt-2 text-3xl font-semibold">{card.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{card.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue={visibleTabs[0]?.value ?? "drafts"} className="space-y-4">
          <TabsList className={`grid h-auto gap-2 ${isDiamondTier ? "grid-cols-2 md:grid-cols-6" : "grid-cols-3"}`}>
            {visibleTabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="drafts" className="space-y-4">
            {!isPaidTier ? (
              <WorkspaceLocked
                title={isMs ? "Draf awan dibuka pada Premium" : "Cloud drafts unlock on Premium"}
                description={isMs ? "Naik taraf dari Free untuk menyimpan draf boleh guna semula dalam ruang kerja anda." : "Upgrade from Free to keep reusable drafts in your workspace and reopen them later."}
              />
            ) : (
              <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <Card>
                  <CardHeader>
                    <CardTitle>{ui.savedDrafts}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-[1fr_180px_220px]">
                      <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={draftSearch}
                          onChange={(event) => setDraftSearch(event.target.value)}
                          placeholder={ui.searchDrafts}
                          className="pl-9"
                        />
                      </div>
                      <Select value={draftThemeFilter} onValueChange={setDraftThemeFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder={t.themeLabel} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{ui.allThemes}</SelectItem>
                          <SelectItem value="classic">{t.themeClassic}</SelectItem>
                          <SelectItem value="retro">{t.themeRetro}</SelectItem>
                          <SelectItem value="premium">{t.themePremium}</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={draftFormatFilter} onValueChange={setDraftFormatFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder={t.formatLabel} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{ui.allFormats}</SelectItem>
                          <SelectItem value="classic">{t.formatClassic}</SelectItem>
                          <SelectItem value="instagram-square">{t.formatInstagramSquare}</SelectItem>
                          <SelectItem value="instagram-landscape">{t.formatInstagramLandscape}</SelectItem>
                          <SelectItem value="instagram-portrait">{t.formatInstagramPortrait}</SelectItem>
                          <SelectItem value="facebook">{t.formatFacebook}</SelectItem>
                          <SelectItem value="instagram-story">{t.formatInstagramStory}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {ui.showingDrafts} {filteredDrafts.length} {ui.of} {drafts.length} {ui.drafts.toLowerCase()}
                    </p>
                    {drafts.length === 0 ? (
                      <p className="text-sm text-muted-foreground">{ui.noDraftsYet}</p>
                    ) : filteredDrafts.length === 0 ? (
                      <p className="text-sm text-muted-foreground">{ui.noDraftsMatch}</p>
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
                              {ui.updated} {new Date(draft.updatedAt).toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {draft.poster.fullName || ui.untitledMemorial} • {draft.poster.format} • {draft.poster.theme}
                            </p>
                            <p className="text-xs text-muted-foreground">{getRowSyncLabel(draft.updatedAt)}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm" onClick={() => openDraft(draft.id, draft.title, draft.poster)}>
                              {ui.open}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteDraft(draft.id, draft.title)}>
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
                    <CardTitle>{ui.createBatchFromDrafts}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="batch-name">{ui.batchName}</Label>
                      <Input
                        id="batch-name"
                        value={batchName}
                        onChange={(event) => setBatchName(event.target.value)}
                        placeholder={ui.batchPlaceholder}
                      />
                    </div>
                    <div className="space-y-3">
                      {filteredDrafts.length === 0 ? (
                        <p className="text-sm text-muted-foreground">{ui.addDraftsFirst}</p>
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
                              <p className="text-xs text-muted-foreground">{draft.poster.fullName || ui.untitledMemorial}</p>
                            </div>
                          </label>
                        ))
                      )}
                    </div>
                    <Button className="w-full" onClick={handleCreateBatch}>
                      {ui.createBatch}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      {ui.premiumBatchHint}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="batches" className="space-y-4">
            {!isPaidTier ? (
              <WorkspaceLocked
                title={ui.batchPaidOnlyTitle}
                description={ui.batchPaidOnlyDesc}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>{ui.batchProjects}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {batches.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{ui.noBatchesYet}</p>
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
                                  {batch.items.length} {ui.postersLabel} • {batch.source} • {ui.updatedShort} {new Date(batch.updatedAt).toLocaleString()}
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
                                      placeholder={ui.fullName}
                                    />
                                    <Input
                                      value={batchItemOrganization}
                                      onChange={(event) => setBatchItemOrganization(event.target.value)}
                                      placeholder={ui.organization}
                                    />
                                  </div>
                                  <div className="grid gap-3 md:grid-cols-2">
                                    <Input
                                      value={batchItemFrom}
                                      onChange={(event) => setBatchItemFrom(event.target.value)}
                                      placeholder={ui.from}
                                    />
                                    <Input
                                      value={batchItemMessage}
                                      onChange={(event) => setBatchItemMessage(event.target.value)}
                                      placeholder={ui.shortMessage}
                                    />
                                  </div>
                                  <div className="grid gap-3 md:grid-cols-2">
                                    <Select
                                      value={batchItemTheme}
                                      onValueChange={(value) => setBatchItemTheme(value as PosterData["theme"])}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder={t.themeLabel} />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="classic">{t.themeClassic}</SelectItem>
                                        <SelectItem value="retro">{t.themeRetro}</SelectItem>
                                        <SelectItem value="premium">{t.themePremium}</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <Select
                                      value={batchItemFormat}
                                      onValueChange={(value) => setBatchItemFormat(value as PosterData["format"])}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder={t.formatLabel} />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="classic">{t.formatClassic}</SelectItem>
                                        <SelectItem value="instagram-square">{t.formatInstagramSquare}</SelectItem>
                                        <SelectItem value="instagram-landscape">{t.formatInstagramLandscape}</SelectItem>
                                        <SelectItem value="instagram-portrait">{t.formatInstagramPortrait}</SelectItem>
                                        <SelectItem value="facebook">{t.formatFacebook}</SelectItem>
                                        <SelectItem value="instagram-story">{t.formatInstagramStory}</SelectItem>
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
                                      {ui.saveItem}
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={stopEditingBatchItem}>
                                      {ui.cancel}
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
                                    <p className="text-sm font-medium">{item.poster.fullName || ui.untitledMemorial}</p>
                                    <p className="text-xs text-muted-foreground">{item.poster.organization || ui.noOrganization}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {ui.itemPosition} {itemIndex + 1} {ui.ofTotal} {batch.items.length}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {item.poster.theme} theme • {item.poster.format} format
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {ui.dragToReorder}
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
                                          item.poster.fullName || ui.untitledMemorial,
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
                                          item.poster.fullName || ui.untitledMemorial,
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
                title={ui.analyticsDiamondTitle}
                description={ui.analyticsDiamondDesc}
              />
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-5">
                  <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">{ui.generated}</p><p className="text-3xl font-semibold">{analyticsSummary.generated}</p></CardContent></Card>
                  <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">{ui.downloaded}</p><p className="text-3xl font-semibold">{analyticsSummary.downloaded}</p></CardContent></Card>
                  <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">{ui.draftSaves}</p><p className="text-3xl font-semibold">{analyticsSummary.savedDrafts}</p></CardContent></Card>
                  <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">{ui.csvImports}</p><p className="text-3xl font-semibold">{analyticsSummary.imports}</p></CardContent></Card>
                  <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">{ui.apiKeys}</p><p className="text-3xl font-semibold">{analyticsSummary.apiKeys}</p></CardContent></Card>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>{ui.recentActivity}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {analytics.length === 0 ? (
                      <p className="text-sm text-muted-foreground">{ui.analyticsEmpty}</p>
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
                title={ui.teamDiamondTitle}
                description={ui.teamDiamondDesc}
              />
            ) : (
              <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                <Card>
                  <CardHeader>
                    <CardTitle>{ui.workspaceTeam}</CardTitle>
                    <p className="text-sm text-muted-foreground">{ui.teamDescShort}</p>
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
                                <SelectItem value="pending">{isMs ? "Tertunda" : "Pending"}</SelectItem>
                                <SelectItem value="accepted">{isMs ? "Diterima" : "Accepted"}</SelectItem>
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
                                  ? `${ui.pendingSince} ${new Date(member.createdAt).toLocaleString()}`
                                  : member.acceptedAt
                                    ? `${ui.acceptedOn} ${new Date(member.acceptedAt).toLocaleString()}`
                                    : ui.acceptedCollaborator}
                              </p>
                              {member.status === "pending" && member.inviteExpiresAt && (
                                <p className="text-xs text-muted-foreground">
                                  {isInviteExpired(member.inviteExpiresAt) ? ui.inviteLinkExpired : ui.inviteLinkExpires} {new Date(member.inviteExpiresAt).toLocaleString()}
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
                                  ? ui.expired
                                  : (member.status === "pending" ? (isMs ? "tertunda" : "pending") : (isMs ? "diterima" : "accepted"))}
                              </Badge>
                              {member.status === "pending" && (
                                <Button size="sm" variant="outline" onClick={() => handleCopyInviteLink(member.name, member.inviteLink)}>
                                  {ui.copyLink}
                                </Button>
                              )}
                              {member.status === "pending" && (
                                <Button size="sm" variant="outline" onClick={() => handleResendInvite(member.id, member.name)}>
                                  {ui.resend}
                                </Button>
                              )}
                              {member.status === "pending" && !isInviteExpired(member.inviteExpiresAt) && (
                                <Button size="sm" variant="outline" onClick={() => handleAcceptMemberInvite(member.id, member.name)}>
                                  {ui.accept}
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
                    <CardTitle>{ui.addCollaborator}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="member-name">{ui.name}</Label>
                      <Input id="member-name" value={memberName} onChange={(event) => setMemberName(event.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="member-email">{ui.email}</Label>
                      <Input id="member-email" type="email" value={memberEmail} onChange={(event) => setMemberEmail(event.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>{ui.role}</Label>
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
                      {ui.addMember}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      {ui.pendingInviteHint}
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
                  <CardTitle>{ui.csvImports}</CardTitle>
                  <p className="text-sm text-muted-foreground">{isMs ? "Alat import dan integrasi lanjutan untuk operasi berskala." : "Import and integration tools for larger-scale operations."}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {plan !== "diamond" ? (
                    <p className="text-sm text-muted-foreground">{ui.csvImportReserved}</p>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="csv-name">{ui.importName}</Label>
                        <Input id="csv-name" value={csvName} onChange={(event) => setCsvName(event.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="csv-text">{ui.csvContent}</Label>
                        <Textarea id="csv-text" rows={10} value={csvText} onChange={(event) => setCsvText(event.target.value)} />
                      </div>
                      <Button className="w-full" onClick={handleImportCsv}>
                        <Upload className="mr-2 h-4 w-4" />
                        {ui.processCsv}
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
                  <CardTitle>{ui.apiAccess}</CardTitle>
                  <p className="text-sm text-muted-foreground">{isMs ? "Urus kredensial integrasi tanpa memaparkan token mentah secara terbuka." : "Manage integration credentials without exposing raw tokens openly."}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!isDiamondTier ? (
                    <p className="text-sm text-muted-foreground">{ui.apiAccessReserved}</p>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="api-key-name">{ui.keyName}</Label>
                        <Input id="api-key-name" value={apiKeyName} onChange={(event) => setApiKeyName(event.target.value)} />
                      </div>
                      <Button className="w-full" onClick={handleCreateApiKey}>
                        {ui.generateApiKey}
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
                                <Badge variant="outline">{credential.revokedAt ? ui.revoked : ui.active}</Badge>
                                <Button size="sm" variant="outline" onClick={() => handleCopyApiToken(credential.name, credential.token)}>
                                  {ui.copyToken}
                                </Button>
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
                        <p className="mt-1 break-all text-xs text-muted-foreground">
                          {ui.tokenHidden}: {maskSecret(credential.token)}
                        </p>
                      </div>
                    ))}
                    {isDiamondTier && (
                      <div className="rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
                        {ui.suggestedEndpoint}
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
                <CardTitle>{ui.restoreBin}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 md:grid-cols-[1fr_220px]">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={restoreSearch}
                      onChange={(event) => setRestoreSearch(event.target.value)}
                      placeholder={ui.searchDeleted}
                      className="pl-9"
                    />
                  </div>
                  <Select value={restoreKindFilter} onValueChange={setRestoreKindFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder={ui.itemType} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{ui.allItemTypes}</SelectItem>
                      <SelectItem value="draft">{ui.draftsType}</SelectItem>
                      <SelectItem value="batch">{ui.batchesType}</SelectItem>
                      <SelectItem value="member">{ui.membersType}</SelectItem>
                      <SelectItem value="api">{ui.apiKeysType}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-muted-foreground">
                  {ui.showingDeleted} {filteredRecycleBin.length} {ui.of} {recycleBin.length} {ui.deletedItems}
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
                      {ui.selectVisible}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={selectedRestoreIds.length === 0}
                        onClick={handleBulkRestore}
                      >
                        {ui.restoreSelected}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={selectedRestoreIds.length === 0}
                        onClick={handleBulkClearRestore}
                      >
                        {ui.removeSelected}
                      </Button>
                    </div>
                  </div>
                )}
                {recycleBin.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{ui.restoreEmpty}</p>
                ) : filteredRecycleBin.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{ui.restoreNoMatch}</p>
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
                            {item.kind} • {ui.deletedAt} {new Date(item.deletedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleRestoreDeletedItem(item.id, item.label)}>
                          {ui.restore}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleClearDeletedItem(item.id, item.label)}>
                          {ui.removePermanently}
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        </>
        )}

        <p className="text-sm text-muted-foreground">
          {ui.pricingDetails} <Link className="text-primary underline" to="/">{ui.backHome}</Link>
        </p>
      </div>
    </main>
  );
};

export default Dashboard;
