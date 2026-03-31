import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { Session } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

type AuthUserState = {
  id: string;
  email: string | null;
  userMetadata: Record<string, unknown>;
  appMetadata: Record<string, unknown>;
} | null;

type AuthSessionContextValue = {
  authUser: AuthUserState;
  identity: string;
  isAuthResolved: boolean;
  isAuthenticated: boolean;
};

const AuthSessionContext = createContext<AuthSessionContextValue | undefined>(undefined);

const getAuthUserState = (session: Session | null): AuthUserState => {
  if (!session?.user) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email ?? null,
    userMetadata: (session.user.user_metadata ?? {}) as Record<string, unknown>,
    appMetadata: (session.user.app_metadata ?? {}) as Record<string, unknown>,
  };
};

const isSameAuthUserState = (left: AuthUserState, right: AuthUserState) => {
  if (left === right) {
    return true;
  }

  if (!left || !right) {
    return false;
  }

  return JSON.stringify(left) === JSON.stringify(right);
};

export const AuthSessionProvider = ({ children }: { children: ReactNode }) => {
  const [authUser, setAuthUser] = useState<AuthUserState>(null);
  const [isAuthResolved, setIsAuthResolved] = useState(false);

  useEffect(() => {
    const syncSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const nextAuthUser = getAuthUserState(data.session);
        setAuthUser((currentAuthUser) =>
          isSameAuthUserState(currentAuthUser, nextAuthUser) ? currentAuthUser : nextAuthUser,
        );
      } catch {
        setAuthUser(null);
      } finally {
        setIsAuthResolved(true);
      }
    };

    void syncSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      const nextAuthUser = getAuthUserState(nextSession);
      setAuthUser((currentAuthUser) =>
        isSameAuthUserState(currentAuthUser, nextAuthUser) ? currentAuthUser : nextAuthUser,
      );
      setIsAuthResolved(true);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthSessionContextValue>(() => ({
    authUser,
    identity: authUser?.id ?? "guest",
    isAuthResolved,
    isAuthenticated: Boolean(authUser),
  }), [authUser, isAuthResolved]);

  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>;
};

export const useAuthSession = () => {
  const context = useContext(AuthSessionContext);

  if (!context) {
    throw new Error("useAuthSession must be used within AuthSessionProvider");
  }

  return context;
};
