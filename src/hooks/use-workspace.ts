import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { PosterData } from "@/types/poster";
import {
  AnalyticsEvent,
  ApiCredential,
  BatchProject,
  DeletedWorkspaceItem,
  ImportJob,
  PosterDraft,
  TeamMember,
  WorkspaceRole,
  WorkspaceState,
} from "@/types/workspace";
import { SubscriptionPlan } from "@/hooks/use-subscription";

const STORAGE_PREFIX = "salam-takziah-workspace";
const REMOTE_SYNC_DEBOUNCE_MS = 400;

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const nowIso = () => new Date().toISOString();
const INVITE_EXPIRY_DAYS = 7;

const createInviteToken = () => `inv_${Math.random().toString(36).slice(2, 10)}${Math.random().toString(36).slice(2, 10)}`;

const createInviteExpiry = () => new Date(Date.now() + INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString();

const createInviteLink = (token: string) => {
  if (typeof window === "undefined") {
    return `/team-invite/${token}`;
  }

  return `${window.location.origin}/team-invite/${token}`;
};

const createEmptyState = (email: string | null): WorkspaceState => ({
  drafts: [],
  batches: [],
  analytics: [],
  team: email
    ? [
        {
          id: createId(),
          name: email.split("@")[0],
          email,
          role: "owner",
          status: "accepted",
          acceptedAt: nowIso(),
          createdAt: nowIso(),
          updatedAt: nowIso(),
        },
      ]
    : [],
  apiCredentials: [],
  importJobs: [],
  recycleBin: [],
});

export const createEmptyPoster = (): PosterData => ({
  photo: null,
  fullName: "",
  gender: "allahyarham",
  birthDate: "",
  deathDate: "",
  organization: "",
  message: "",
  from: "",
  theme: "classic",
  format: "classic",
  whiteLabel: false,
});

const normalizeTeamMember = (member: TeamMember): TeamMember => {
  const status = member.status ?? "accepted";
  const inviteToken = status === "pending" ? member.inviteToken ?? createInviteToken() : undefined;

  return {
    ...member,
    status,
    inviteToken,
    inviteLink: status === "pending" ? member.inviteLink ?? createInviteLink(inviteToken) : undefined,
    inviteExpiresAt: status === "pending" ? member.inviteExpiresAt ?? createInviteExpiry() : undefined,
    acceptedAt:
      member.acceptedAt ??
      (status === "accepted" ? member.updatedAt ?? member.createdAt : undefined),
  };
};

const normalizeWorkspaceState = (state: WorkspaceState): WorkspaceState => ({
  ...state,
  team: state.team.map(normalizeTeamMember),
});

const parseWorkspaceState = (raw: string | null, email: string | null) => {
  if (!raw) {
    return createEmptyState(email);
  }

  try {
    return normalizeWorkspaceState(JSON.parse(raw) as WorkspaceState);
  } catch {
    return createEmptyState(email);
  }
};

const isJsonArray = (value: Json): value is Json[] => Array.isArray(value);

const parseCollection = <T,>(value: Json, fallback: T[]): T[] => {
  if (!isJsonArray(value)) {
    return fallback;
  }

  return value as T[];
};

const toWorkspaceState = (
  row: {
    drafts: Json;
    batches: Json;
    analytics: Json;
    team: Json;
    api_credentials: Json;
    import_jobs: Json;
    recycle_bin: Json;
  },
  email: string | null,
): WorkspaceState => ({
  drafts: parseCollection<PosterDraft>(row.drafts, []),
  batches: parseCollection<BatchProject>(row.batches, []),
  analytics: parseCollection<AnalyticsEvent>(row.analytics, []),
  team: parseCollection<TeamMember>(row.team, email ? createEmptyState(email).team : []).map(normalizeTeamMember),
  apiCredentials: parseCollection<ApiCredential>(row.api_credentials, []),
  importJobs: parseCollection<ImportJob>(row.import_jobs, []),
  recycleBin: parseCollection<DeletedWorkspaceItem>(row.recycle_bin, []),
});

const mergeById = <T extends { id: string }>(localItems: T[], remoteItems: T[], limit: number) => {
  const merged = new Map<string, T>();

  [...remoteItems, ...localItems].forEach((item) => {
    const existing = merged.get(item.id) as (T & { updatedAt?: string; createdAt?: string }) | undefined;
    const candidate = item as T & { updatedAt?: string; createdAt?: string };

    if (!existing) {
      merged.set(item.id, item);
      return;
    }

    const existingStamp = existing.updatedAt ?? existing.createdAt ?? "";
    const candidateStamp = candidate.updatedAt ?? candidate.createdAt ?? "";

    if (candidateStamp >= existingStamp) {
      merged.set(item.id, item);
    }
  });

  return Array.from(merged.values()).slice(0, limit);
};

const mergeWorkspaceState = (localState: WorkspaceState, remoteState: WorkspaceState): WorkspaceState => ({
  drafts: mergeById(localState.drafts, remoteState.drafts, 50),
  batches: mergeById(localState.batches, remoteState.batches, 25),
  analytics: mergeById(localState.analytics, remoteState.analytics, 100),
  team: mergeById(localState.team, remoteState.team, 50),
  apiCredentials: mergeById(localState.apiCredentials, remoteState.apiCredentials, 10),
  importJobs: mergeById(localState.importJobs, remoteState.importJobs, 20),
  recycleBin: mergeById(localState.recycleBin, remoteState.recycleBin, 50),
});

const createDeletedItem = (
  kind: DeletedWorkspaceItem["kind"],
  sourceId: string,
  label: string,
  payload: DeletedWorkspaceItem["payload"],
): DeletedWorkspaceItem => ({
  id: createId(),
  sourceId,
  kind,
  label,
  deletedAt: nowIso(),
  payload,
});

const createRemoteWorkspacePayload = (state: WorkspaceState) => ({
  drafts: state.drafts as unknown as Json,
  batches: state.batches as unknown as Json,
  analytics: state.analytics as unknown as Json,
  team: state.team as unknown as Json,
  api_credentials: state.apiCredentials as unknown as Json,
  import_jobs: state.importJobs as unknown as Json,
  recycle_bin: state.recycleBin as unknown as Json,
});

const serializeWorkspaceState = (state: WorkspaceState) => JSON.stringify(createRemoteWorkspacePayload(state));

type WorkspaceSessionContext = {
  identity: string;
  userEmail: string | null;
  plan: SubscriptionPlan;
};

const readWorkspaceStateFromStorage = (storageKey: string, userEmail: string | null) => {
  if (typeof window === "undefined") {
    return createEmptyState(userEmail);
  }

  return parseWorkspaceState(window.localStorage.getItem(storageKey), userEmail);
};

const writeWorkspaceStateToStorage = (storageKey: string, nextState: WorkspaceState) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(nextState));
};

const fetchRemoteWorkspaceState = async (identity: string, userEmail: string | null) => {
  const { data, error } = await supabase
    .from("workspace_state")
    .select("drafts, batches, analytics, team, api_credentials, import_jobs, recycle_bin")
    .eq("user_id", identity)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return toWorkspaceState(data, userEmail);
};

const persistRemoteWorkspaceState = async (identity: string, nextState: WorkspaceState) => {
  const { error } = await supabase.from("workspace_state").upsert(
    {
      user_id: identity,
      ...createRemoteWorkspacePayload(nextState),
    },
    {
      onConflict: "user_id",
    },
  );

  if (error) {
    throw error;
  }
};

export const useWorkspace = ({ identity, userEmail, plan }: WorkspaceSessionContext) => {
  const [state, setState] = useState<WorkspaceState>(() => createEmptyState(userEmail));
  const [isRemoteReady, setIsRemoteReady] = useState(false);
  const [remoteError, setRemoteError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [syncAttempt, setSyncAttempt] = useState(0);
  const skipNextRemoteSyncRef = useRef(false);
  const lastRemoteSnapshotRef = useRef<string | null>(null);
  const lastRemoteUpdatedAtRef = useRef<string | null>(null);

  const storageKey = useMemo(() => `${STORAGE_PREFIX}:${identity}`, [identity]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const nextState = parseWorkspaceState(window.localStorage.getItem(storageKey), userEmail);
    setState((currentState) => {
      if (nextState.team.length > 0 || !userEmail) {
        return nextState;
      }

      return {
        ...nextState,
        team:
          currentState.team.length > 0
            ? currentState.team
            : [
                {
                  id: createId(),
                  name: userEmail.split("@")[0],
                  email: userEmail,
                  role: "owner",
                  status: "accepted",
                  acceptedAt: nowIso(),
                  createdAt: nowIso(),
                  updatedAt: nowIso(),
                },
              ],
      };
    });
  }, [storageKey, userEmail]);

  useEffect(() => {
    let isActive = true;

    const hydrateRemoteState = async () => {
      if (identity === "guest") {
        setIsRemoteReady(false);
        setRemoteError(null);
        setIsSyncing(false);
        lastRemoteSnapshotRef.current = null;
        lastRemoteUpdatedAtRef.current = null;
        return;
      }

      setIsSyncing(true);
      const { data, error } = await supabase
        .from("workspace_state")
        .select("drafts, batches, analytics, team, api_credentials, import_jobs, recycle_bin, updated_at")
        .eq("user_id", identity)
        .maybeSingle();

      if (!isActive) {
        return;
      }

      if (error) {
        setRemoteError(error.message);
        setIsRemoteReady(false);
        setIsSyncing(false);
        return;
      }

      if (!data) {
        setRemoteError(null);
        setIsRemoteReady(true);
        setIsSyncing(false);
        lastRemoteSnapshotRef.current = null;
        lastRemoteUpdatedAtRef.current = null;
        return;
      }

      const remoteState = toWorkspaceState(data, userEmail);
      skipNextRemoteSyncRef.current = true;
      setState((currentState) => {
        const mergedState = mergeWorkspaceState(currentState, remoteState);
        const currentSnapshot = serializeWorkspaceState(currentState);
        const mergedSnapshot = serializeWorkspaceState(mergedState);

        lastRemoteSnapshotRef.current = mergedSnapshot;

        if (mergedSnapshot === currentSnapshot) {
          return currentState;
        }

        return mergedState;
      });
      setRemoteError(null);
      setIsRemoteReady(true);
      if (lastRemoteUpdatedAtRef.current !== data.updated_at) {
        lastRemoteUpdatedAtRef.current = data.updated_at;
        setLastSyncedAt(data.updated_at);
      }
      setIsSyncing(false);
    };

    hydrateRemoteState();

    return () => {
      isActive = false;
    };
  }, [identity, userEmail, syncAttempt]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state, storageKey]);

  useEffect(() => {
    if (identity === "guest" || !isRemoteReady) {
      return;
    }

    const stateSnapshot = serializeWorkspaceState(state);

    if (lastRemoteSnapshotRef.current === stateSnapshot) {
      return;
    }

    if (skipNextRemoteSyncRef.current) {
      skipNextRemoteSyncRef.current = false;
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      setIsSyncing(true);
      const { data, error } = await supabase
        .from("workspace_state")
        .upsert(
          {
            user_id: identity,
            ...createRemoteWorkspacePayload(state),
          },
          {
            onConflict: "user_id",
          },
        )
        .select("updated_at")
        .single();

      if (error) {
        setRemoteError(error.message);
      } else {
        lastRemoteSnapshotRef.current = stateSnapshot;
        setRemoteError(null);
        if (lastRemoteUpdatedAtRef.current !== data.updated_at) {
          lastRemoteUpdatedAtRef.current = data.updated_at;
          setLastSyncedAt(data.updated_at);
        }
      }
      setIsSyncing(false);
    }, REMOTE_SYNC_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [identity, isRemoteReady, state]);

  const trackEvent = useCallback((event: Omit<AnalyticsEvent, "id" | "createdAt">) => {
    setState((currentState) => ({
      ...currentState,
      analytics: [
        {
          id: createId(),
          createdAt: nowIso(),
          meta: {
            plan,
            ...event.meta,
          },
          type: event.type,
        },
        ...currentState.analytics,
      ].slice(0, 100),
    }));
  }, [plan]);

  const saveDraft = useCallback((title: string, poster: PosterData, draftId?: string) => {
    const timestamp = nowIso();
    const nextDraft: PosterDraft = {
      id: draftId ?? createId(),
      title: title.trim() || poster.fullName || "Untitled draft",
      poster,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    setState((currentState) => {
      const existingDraft = currentState.drafts.find((draft) => draft.id === nextDraft.id);
      const drafts = existingDraft
        ? currentState.drafts.map((draft) =>
            draft.id === nextDraft.id
              ? { ...nextDraft, createdAt: draft.createdAt, updatedAt: timestamp }
              : draft,
          )
        : [nextDraft, ...currentState.drafts].slice(0, 50);

      return {
        ...currentState,
        drafts,
      };
    });

    trackEvent({
      type: "draft_saved",
      meta: {
        title: nextDraft.title,
      },
    });

    return nextDraft;
  }, [trackEvent]);

  const deleteDraft = useCallback((draftId: string) => {
    setState((currentState) => {
      const draft = currentState.drafts.find((item) => item.id === draftId);
      if (!draft) {
        return currentState;
      }

      return {
        ...currentState,
        drafts: currentState.drafts.filter((item) => item.id !== draftId),
        recycleBin: [createDeletedItem("draft", draft.id, draft.title, draft), ...currentState.recycleBin].slice(0, 50),
      };
    });
  }, []);

  const renameDraft = useCallback((draftId: string, title: string) => {
    const timestamp = nowIso();

    setState((currentState) => ({
      ...currentState,
      drafts: currentState.drafts.map((draft) =>
        draft.id === draftId
          ? {
              ...draft,
              title: title.trim() || draft.title,
              updatedAt: timestamp,
            }
          : draft,
      ),
    }));
  }, []);

  const updateBatch = useCallback((batchId: string, updates: Pick<BatchProject, "name">) => {
    const timestamp = nowIso();

    setState((currentState) => ({
      ...currentState,
      batches: currentState.batches.map((batch) =>
        batch.id === batchId
          ? {
              ...batch,
              ...updates,
              name: updates.name.trim() || batch.name,
              updatedAt: timestamp,
            }
          : batch,
      ),
    }));
  }, []);

  const deleteBatch = useCallback((batchId: string) => {
    setState((currentState) => {
      const batch = currentState.batches.find((item) => item.id === batchId);
      if (!batch) {
        return currentState;
      }

      return {
        ...currentState,
        batches: currentState.batches.filter((item) => item.id !== batchId),
        recycleBin: [createDeletedItem("batch", batch.id, batch.name, batch), ...currentState.recycleBin].slice(0, 50),
      };
    });
  }, []);

  const reorderBatchItem = useCallback((batchId: string, itemId: string, direction: "up" | "down") => {
    const timestamp = nowIso();

    setState((currentState) => ({
      ...currentState,
      batches: currentState.batches.map((batch) => {
        if (batch.id !== batchId) {
          return batch;
        }

        const index = batch.items.findIndex((item) => item.id === itemId);
        if (index === -1) {
          return batch;
        }

        const nextIndex = direction === "up" ? index - 1 : index + 1;
        if (nextIndex < 0 || nextIndex >= batch.items.length) {
          return batch;
        }

        const items = [...batch.items];
        const [movedItem] = items.splice(index, 1);
        items.splice(nextIndex, 0, movedItem);

        return {
          ...batch,
          items,
          updatedAt: timestamp,
        };
      }),
    }));
  }, []);

  const moveBatchItem = useCallback((batchId: string, itemId: string, targetIndex: number) => {
    const timestamp = nowIso();

    setState((currentState) => ({
      ...currentState,
      batches: currentState.batches.map((batch) => {
        if (batch.id !== batchId) {
          return batch;
        }

        const currentIndex = batch.items.findIndex((item) => item.id === itemId);
        if (currentIndex === -1) {
          return batch;
        }

        const boundedTargetIndex = Math.max(0, Math.min(targetIndex, batch.items.length - 1));
        if (boundedTargetIndex === currentIndex) {
          return batch;
        }

        const items = [...batch.items];
        const [movedItem] = items.splice(currentIndex, 1);
        items.splice(boundedTargetIndex, 0, movedItem);

        return {
          ...batch,
          items,
          updatedAt: timestamp,
        };
      }),
    }));
  }, []);

  const updateBatchItem = useCallback((batchId: string, itemId: string, poster: PosterData) => {
    const timestamp = nowIso();

    setState((currentState) => ({
      ...currentState,
      batches: currentState.batches.map((batch) =>
        batch.id === batchId
          ? {
              ...batch,
              items: batch.items.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      poster,
                    }
                  : item,
              ),
              updatedAt: timestamp,
            }
          : batch,
      ),
    }));
  }, []);

  const duplicateBatchItem = useCallback((batchId: string, itemId: string) => {
    const timestamp = nowIso();

    setState((currentState) => ({
      ...currentState,
      batches: currentState.batches.map((batch) => {
        if (batch.id !== batchId) {
          return batch;
        }

        const currentIndex = batch.items.findIndex((item) => item.id === itemId);
        if (currentIndex === -1) {
          return batch;
        }

        const sourceItem = batch.items[currentIndex];
        const items = [...batch.items];
        items.splice(currentIndex + 1, 0, {
          id: createId(),
          poster: {
            ...sourceItem.poster,
          },
        });

        return {
          ...batch,
          items,
          updatedAt: timestamp,
        };
      }),
    }));
  }, []);

  const removeBatchItem = useCallback((batchId: string, itemId: string) => {
    const timestamp = nowIso();

    setState((currentState) => ({
      ...currentState,
      batches: currentState.batches
        .map((batch) =>
          batch.id === batchId
            ? {
                ...batch,
                items: batch.items.filter((item) => item.id !== itemId),
                updatedAt: timestamp,
              }
            : batch,
        )
        .filter((batch) => batch.items.length > 0),
    }));
  }, []);

  const createBatch = useCallback((name: string, posters: PosterData[], source: BatchProject["source"]) => {
    const timestamp = nowIso();
    const batch: BatchProject = {
      id: createId(),
      name,
      source,
      createdAt: timestamp,
      updatedAt: timestamp,
      items: posters.map((poster) => ({
        id: createId(),
        poster,
      })),
    };

    setState((currentState) => ({
      ...currentState,
      batches: [batch, ...currentState.batches].slice(0, 25),
    }));

    trackEvent({
      type: source === "csv" ? "csv_imported" : "batch_created",
      meta: {
        count: posters.length,
        source,
      },
    });

    return batch;
  }, [trackEvent]);

  const addTeamMember = useCallback((name: string, email: string, role: WorkspaceRole) => {
    const timestamp = nowIso();
    const inviteToken = createInviteToken();
    const member: TeamMember = {
      id: createId(),
      name,
      email,
      role,
      status: "pending",
      inviteToken,
      inviteLink: createInviteLink(inviteToken),
      inviteExpiresAt: createInviteExpiry(),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    setState((currentState) => ({
      ...currentState,
      team: [member, ...currentState.team],
    }));

    trackEvent({
      type: "team_member_added",
      meta: {
        role,
      },
    });

    return member;
  }, [trackEvent]);

  const updateTeamMember = useCallback((memberId: string, updates: Pick<TeamMember, "name" | "email" | "role" | "status">) => {
    const timestamp = nowIso();

    setState((currentState) => ({
      ...currentState,
      team: currentState.team.map((member) =>
        member.id === memberId
          ? {
              ...member,
              ...updates,
              acceptedAt:
                updates.status === "accepted" && member.status !== "accepted"
                  ? timestamp
                  : member.acceptedAt,
              inviteToken:
                updates.status === "accepted" ? undefined : member.inviteToken,
              inviteLink:
                updates.status === "accepted" ? undefined : member.inviteLink,
              inviteExpiresAt:
                updates.status === "accepted" ? undefined : member.inviteExpiresAt,
              updatedAt: timestamp,
            }
          : member,
      ),
    }));
  }, []);

  const acceptTeamMemberInvite = useCallback((memberId: string) => {
    const timestamp = nowIso();

    setState((currentState) => ({
      ...currentState,
      team: currentState.team.map((member) =>
        member.id === memberId
          ? {
              ...member,
              status: "accepted",
              acceptedAt: member.acceptedAt ?? timestamp,
              inviteToken: undefined,
              inviteLink: undefined,
              inviteExpiresAt: undefined,
              updatedAt: timestamp,
            }
          : member,
      ),
    }));
  }, []);

  const resendTeamMemberInvite = useCallback((memberId: string) => {
    const timestamp = nowIso();
    const inviteToken = createInviteToken();
    let nextLink: string | null = null;

    setState((currentState) => ({
      ...currentState,
      team: currentState.team.map((member) => {
        if (member.id !== memberId || member.status !== "pending") {
          return member;
        }

        nextLink = createInviteLink(inviteToken);

        return {
          ...member,
          inviteToken,
          inviteLink: nextLink,
          inviteExpiresAt: createInviteExpiry(),
          updatedAt: timestamp,
        };
      }),
    }));

    return nextLink;
  }, []);

  const deleteTeamMember = useCallback((memberId: string) => {
    setState((currentState) => {
      const member = currentState.team.find((item) => item.id === memberId);
      if (!member) {
        return currentState;
      }

      return {
        ...currentState,
        team: currentState.team.filter((item) => item.id !== memberId),
        recycleBin: [createDeletedItem("member", member.id, member.name, member), ...currentState.recycleBin].slice(0, 50),
      };
    });
  }, []);

  const createApiCredential = useCallback((name: string) => {
    const timestamp = nowIso();
    const credential: ApiCredential = {
      id: createId(),
      name,
      createdAt: timestamp,
      updatedAt: timestamp,
      token: `stk_${Math.random().toString(36).slice(2, 10)}${Math.random().toString(36).slice(2, 10)}`,
    };

    setState((currentState) => ({
      ...currentState,
      apiCredentials: [credential, ...currentState.apiCredentials].slice(0, 10),
    }));

    trackEvent({
      type: "api_key_created",
      meta: {
        name,
      },
    });

    return credential;
  }, [trackEvent]);

  const updateApiCredential = useCallback((credentialId: string, name: string) => {
    const timestamp = nowIso();

    setState((currentState) => ({
      ...currentState,
      apiCredentials: currentState.apiCredentials.map((credential) =>
        credential.id === credentialId
          ? {
              ...credential,
              name: name.trim() || credential.name,
              updatedAt: timestamp,
            }
          : credential,
      ),
    }));
  }, []);

  const rotateApiCredential = useCallback((credentialId: string) => {
    const timestamp = nowIso();
    const nextToken = `stk_${Math.random().toString(36).slice(2, 10)}${Math.random().toString(36).slice(2, 10)}`;

    setState((currentState) => ({
      ...currentState,
      apiCredentials: currentState.apiCredentials.map((credential) =>
        credential.id === credentialId
          ? {
              ...credential,
              token: nextToken,
              updatedAt: timestamp,
              revokedAt: undefined,
            }
          : credential,
      ),
    }));

    return nextToken;
  }, []);

  const revokeApiCredential = useCallback((credentialId: string) => {
    const timestamp = nowIso();

    setState((currentState) => ({
      ...currentState,
      apiCredentials: currentState.apiCredentials.map((credential) =>
        credential.id === credentialId
          ? {
              ...credential,
              revokedAt: timestamp,
              updatedAt: timestamp,
            }
          : credential,
      ),
    }));
  }, []);

  const deleteApiCredential = useCallback((credentialId: string) => {
    setState((currentState) => {
      const credential = currentState.apiCredentials.find((item) => item.id === credentialId);
      if (!credential) {
        return currentState;
      }

      return {
        ...currentState,
        apiCredentials: currentState.apiCredentials.filter((item) => item.id !== credentialId),
        recycleBin: [createDeletedItem("api", credential.id, credential.name, credential), ...currentState.recycleBin].slice(0, 50),
      };
    });
  }, []);

  const restoreDeletedItem = useCallback((deletedItemId: string) => {
    setState((currentState) => {
      const deletedItem = currentState.recycleBin.find((item) => item.id === deletedItemId);
      if (!deletedItem) {
        return currentState;
      }

      const recycleBin = currentState.recycleBin.filter((item) => item.id !== deletedItemId);

      if (deletedItem.kind === "draft") {
        return {
          ...currentState,
          drafts: [deletedItem.payload as PosterDraft, ...currentState.drafts].slice(0, 50),
          recycleBin,
        };
      }

      if (deletedItem.kind === "batch") {
        return {
          ...currentState,
          batches: [deletedItem.payload as BatchProject, ...currentState.batches].slice(0, 25),
          recycleBin,
        };
      }

      if (deletedItem.kind === "member") {
        return {
          ...currentState,
          team: [deletedItem.payload as TeamMember, ...currentState.team].slice(0, 50),
          recycleBin,
        };
      }

      return {
        ...currentState,
        apiCredentials: [deletedItem.payload as ApiCredential, ...currentState.apiCredentials].slice(0, 10),
        recycleBin,
      };
    });
  }, []);

  const restoreDeletedItems = useCallback((deletedItemIds: string[]) => {
    setState((currentState) => {
      const restoreSet = new Set(deletedItemIds);
      const itemsToRestore = currentState.recycleBin.filter((item) => restoreSet.has(item.id));
      if (itemsToRestore.length === 0) {
        return currentState;
      }

      const draftsToRestore: PosterDraft[] = [];
      const batchesToRestore: BatchProject[] = [];
      const teamToRestore: TeamMember[] = [];
      const apiToRestore: ApiCredential[] = [];

      itemsToRestore.forEach((item) => {
        if (item.kind === "draft") {
          draftsToRestore.push(item.payload as PosterDraft);
        } else if (item.kind === "batch") {
          batchesToRestore.push(item.payload as BatchProject);
        } else if (item.kind === "member") {
          teamToRestore.push(item.payload as TeamMember);
        } else {
          apiToRestore.push(item.payload as ApiCredential);
        }
      });

      return {
        ...currentState,
        drafts: [...draftsToRestore, ...currentState.drafts].slice(0, 50),
        batches: [...batchesToRestore, ...currentState.batches].slice(0, 25),
        team: [...teamToRestore, ...currentState.team].slice(0, 50),
        apiCredentials: [...apiToRestore, ...currentState.apiCredentials].slice(0, 10),
        recycleBin: currentState.recycleBin.filter((item) => !restoreSet.has(item.id)),
      };
    });
  }, []);

  const clearDeletedItem = useCallback((deletedItemId: string) => {
    setState((currentState) => ({
      ...currentState,
      recycleBin: currentState.recycleBin.filter((item) => item.id !== deletedItemId),
    }));
  }, []);

  const clearDeletedItems = useCallback((deletedItemIds: string[]) => {
    const clearSet = new Set(deletedItemIds);

    setState((currentState) => ({
      ...currentState,
      recycleBin: currentState.recycleBin.filter((item) => !clearSet.has(item.id)),
    }));
  }, []);

  const createImportJob = useCallback((name: string, rowCount: number, successCount: number, errorRows: string[]) => {
    const job: ImportJob = {
      id: createId(),
      name,
      rowCount,
      successCount,
      errorRows,
      createdAt: nowIso(),
      status: errorRows.length > 0 ? "failed" : "processed",
    };

    setState((currentState) => ({
      ...currentState,
      importJobs: [job, ...currentState.importJobs].slice(0, 20),
    }));

    return job;
  }, []);

  const summary = {
    draftCount: state.drafts.length,
    batchCount: state.batches.length,
    teamCount: state.team.length,
    recycleBinCount: state.recycleBin.length,
    totalGenerated: state.analytics.filter((event) => event.type === "poster_generated").length,
  };

  const retryRemoteSync = () => {
    setRemoteError(null);
    setSyncAttempt((current) => current + 1);
  };

  return {
    ...state,
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
  };
};

export const useWorkspaceActions = ({ identity, userEmail, plan }: WorkspaceSessionContext) => {
  const storageKey = useMemo(() => `${STORAGE_PREFIX}:${identity}`, [identity]);

  const getCurrentWorkspaceState = useCallback(async () => {
    const localState = readWorkspaceStateFromStorage(storageKey, userEmail);

    if (identity === "guest") {
      return localState;
    }

    const remoteState = await fetchRemoteWorkspaceState(identity, userEmail);
    return remoteState ? mergeWorkspaceState(localState, remoteState) : localState;
  }, [identity, storageKey, userEmail]);

  const persistWorkspaceState = useCallback(async (nextState: WorkspaceState) => {
    writeWorkspaceStateToStorage(storageKey, nextState);

    if (identity === "guest") {
      return;
    }

    await persistRemoteWorkspaceState(identity, nextState);
  }, [identity, storageKey]);

  const trackEvent = useCallback(async (event: Omit<AnalyticsEvent, "id" | "createdAt">) => {
    const currentState = await getCurrentWorkspaceState();
    const nextState = {
      ...currentState,
      analytics: [
        {
          id: createId(),
          createdAt: nowIso(),
          meta: {
            plan,
            ...event.meta,
          },
          type: event.type,
        },
        ...currentState.analytics,
      ].slice(0, 100),
    };

    await persistWorkspaceState(nextState);
  }, [getCurrentWorkspaceState, persistWorkspaceState, plan]);

  const saveDraft = useCallback(async (title: string, poster: PosterData, draftId?: string) => {
    const currentState = await getCurrentWorkspaceState();
    const timestamp = nowIso();
    const nextDraft: PosterDraft = {
      id: draftId ?? createId(),
      title: title.trim() || poster.fullName || "Untitled draft",
      poster,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const existingDraft = currentState.drafts.find((draft) => draft.id === nextDraft.id);
    const drafts = existingDraft
      ? currentState.drafts.map((draft) =>
          draft.id === nextDraft.id
            ? { ...nextDraft, createdAt: draft.createdAt, updatedAt: timestamp }
            : draft,
        )
      : [nextDraft, ...currentState.drafts].slice(0, 50);

    const nextState = {
      ...currentState,
      drafts,
      analytics: [
        {
          id: createId(),
          createdAt: timestamp,
          meta: {
            plan,
            title: nextDraft.title,
          },
          type: "draft_saved" as const,
        },
        ...currentState.analytics,
      ].slice(0, 100),
    };

    await persistWorkspaceState(nextState);

    return nextDraft;
  }, [getCurrentWorkspaceState, persistWorkspaceState, plan]);

  return {
    saveDraft,
    trackEvent,
  };
};
