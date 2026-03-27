import { PosterData } from "@/types/poster";

export type WorkspaceRole = "owner" | "admin" | "editor" | "viewer";
export type TeamMemberStatus = "pending" | "accepted";
export type BatchSource = "manual" | "csv";
export type ImportStatus = "draft" | "processed" | "failed";
export type DeletedWorkspaceKind = "draft" | "batch" | "member" | "api";

export interface PosterDraft {
  id: string;
  title: string;
  poster: PosterData;
  createdAt: string;
  updatedAt: string;
}

export interface BatchItem {
  id: string;
  poster: PosterData;
}

export interface BatchProject {
  id: string;
  name: string;
  source: BatchSource;
  items: BatchItem[];
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsEvent {
  id: string;
  type:
    | "poster_generated"
    | "draft_saved"
    | "draft_loaded"
    | "batch_created"
    | "batch_loaded"
    | "csv_imported"
    | "team_member_added"
    | "api_key_created";
  createdAt: string;
  meta?: Record<string, string | number | boolean>;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: WorkspaceRole;
  status: TeamMemberStatus;
  inviteToken?: string;
  inviteLink?: string;
  inviteExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
  acceptedAt?: string;
}

export interface ApiCredential {
  id: string;
  name: string;
  token: string;
  createdAt: string;
  updatedAt: string;
  lastUsedAt?: string;
  revokedAt?: string;
}

export interface ImportJob {
  id: string;
  name: string;
  rowCount: number;
  successCount: number;
  status: ImportStatus;
  createdAt: string;
  errorRows: string[];
}

export interface DeletedWorkspaceItem {
  id: string;
  sourceId: string;
  kind: DeletedWorkspaceKind;
  label: string;
  deletedAt: string;
  payload: PosterDraft | BatchProject | TeamMember | ApiCredential;
}

export interface WorkspaceState {
  drafts: PosterDraft[];
  batches: BatchProject[];
  analytics: AnalyticsEvent[];
  team: TeamMember[];
  apiCredentials: ApiCredential[];
  importJobs: ImportJob[];
  recycleBin: DeletedWorkspaceItem[];
}
