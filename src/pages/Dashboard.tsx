import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useSubscription } from "@/hooks/use-subscription";
import { useLanguage } from "@/contexts/LanguageContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { plan } = useSubscription();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const activeFeatures =
    plan === "premium"
      ? [
          "Everything in Free +",
          "Unlimited posters",
          "All social media formats",
          "Premium themes & patterns",
          "High-resolution (4K)",
          "Custom condolence messages",
          "Advanced customization",
          "Remove watermarks",
          "Multiple export formats",
        ]
      : plan === "diamond"
        ? [
            "Everything in Premium +",
            "White-label branding",
            "Custom organization templates",
            "Multi-language support",
            "Advanced sharing features",
          ]
        : [
            "5 posters per month",
            "Classic format (4:3)",
            "Basic themes (Classic & Retro)",
            "Standard resolution (1080p)",
            "Watermarked downloads",
          ];

  const planLabel =
    plan === "premium"
      ? t.dashboardPlanPremium
      : plan === "diamond"
        ? t.dashboardPlanDiamond
        : t.dashboardPlanFree;
  const enterprisePendingFeatures =
    plan === "diamond"
      ? [
          "API access & integrations",
          "Advanced analytics",
          "Unlimited batch processing",
          "24/7 phone support",
          "Custom Arabic calligraphy",
          "Video memorial creation",
          "Team collaboration",
        ]
      : [];

  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user?.email) {
        setUserEmail(data.session.user.email);
      }
      setLoading(false);
    };

    loadSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        navigate("/");
      } else if (session?.user?.email) {
        setUserEmail(session.user.email);
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

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">Loading...</main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-4 flex items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Dashboard Salam Takziah</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              {userEmail
                ? `Selamat datang, ${userEmail}`
                : "Tiada sesi log masuk ditemui. Sila log masuk semula."}
            </p>
            <div className="rounded-lg border border-border p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-muted-foreground">{t.dashboardPlanLabel}</span>
                <Badge variant={plan === "free" ? "outline" : "default"}>{planLabel}</Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">{t.dashboardFeaturesLabel}</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {activeFeatures.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </div>
              {enterprisePendingFeatures.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">{t.dashboardEnterprisePendingLabel}</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {enterprisePendingFeatures.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="secondary" onClick={() => navigate("/create")}>
                Buka Penjana Poster
              </Button>
              <Button variant="destructive" onClick={signOut}>
                Log Keluar
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Ingin lihat harga dan info? <Link className="text-primary underline" to="/">Kembali ke Muka Utama</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default Dashboard;
