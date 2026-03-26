import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

const Register = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email || !password || !confirmPassword) {
      toast({
        title: "Sila isi semua medan",
        description: "Emel, kata laluan dan pengesahan kata laluan diperlukan.",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Kata laluan tidak sepadan",
        description: "Sila pastikan kata laluan dan pengesahan adalah sama.",
      });
      return;
    }

    setIsLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          plan: "free",
        },
      },
    });
    setIsLoading(false);

    if (error) {
      toast({
        title: "Pendaftaran gagal",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Daftar berjaya",
      description: `Sila semak emel ${email} untuk pautan pengesahan.`,
    });

    if (data.session) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Daftar Salam Takziah</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="email">Emel</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Kata Laluan</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Pengesahan Kata Laluan</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Sedang mendaftar..." : "Daftar"}
            </Button>
          </form>
          <p className="text-sm text-muted-foreground mt-4">
            Sudah ada akaun? <Link className="text-primary underline" to="/login">Log masuk</Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
};

export default Register;
