import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
