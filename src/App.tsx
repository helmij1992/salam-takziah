import { ReactNode, useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import HomePage from "./pages/HomePage";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AuthCallback from "./pages/AuthCallback";
import MesejTakziah from "./pages/MesejTakziah";
import EnglishCondolences from "./pages/EnglishCondolences";
import UcapanWhatsapp from "./pages/UcapanWhatsapp";
import TemplateFormat from "./pages/TemplateFormat";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();
const DISABLE_AUTH_RUNTIME_LISTENERS = true;

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let loadingTimeoutId: number | undefined;

    const finishLoading = (nextAuthenticated?: boolean) => {
      if (!isMounted) {
        return;
      }

      if (typeof nextAuthenticated === "boolean") {
        setIsAuthenticated(nextAuthenticated);
      }

      setIsLoading(false);
    };

    const loadSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        finishLoading(Boolean(data.session));
      } catch {
        finishLoading(false);
      }
    };

    void loadSession();
    loadingTimeoutId = window.setTimeout(() => {
      finishLoading(false);
    }, 1500);

    if (DISABLE_AUTH_RUNTIME_LISTENERS) {
      return () => {
        isMounted = false;
        if (loadingTimeoutId) {
          window.clearTimeout(loadingTimeoutId);
        }
      };
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      finishLoading(Boolean(session));
    });

    return () => {
      isMounted = false;
      if (loadingTimeoutId) {
        window.clearTimeout(loadingTimeoutId);
      }
      authListener?.subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return <main className="min-h-screen bg-background flex items-center justify-center">Loading...</main>;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          redirectTo: `${location.pathname}${location.search}${location.hash}`,
        }}
      />
    );
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/create"
              element={(
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              )}
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route
              path="/dashboard"
              element={(
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              )}
            />
            <Route path="/mesej-takziah" element={<MesejTakziah />} />
            <Route path="/english-condolences" element={<EnglishCondolences />} />
            <Route path="/ucapan-whatsapp" element={<UcapanWhatsapp />} />
            <Route path="/template-format" element={<TemplateFormat />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
