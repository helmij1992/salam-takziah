import { ReactNode } from "react";
import { Link, To } from "react-router-dom";
import { Clock3, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";

interface AuthShellProps {
  title: string;
  subtitle: string;
  eyebrow: string;
  form: ReactNode;
  switchPrompt: string;
  switchLabel: string;
  switchTo: To;
  switchState?: Record<string, unknown>;
}

const AuthShell = ({
  title,
  subtitle,
  eyebrow,
  form,
  switchPrompt,
  switchLabel,
  switchTo,
}: AuthShellProps) => {
  const { t } = useLanguage();
  const authHighlights = [
    {
      icon: ShieldCheck,
      title: t.authHighlightSecurityTitle,
      description: t.authHighlightSecurityDesc,
    },
    {
      icon: Sparkles,
      title: t.authHighlightMemorialTitle,
      description: t.authHighlightMemorialDesc,
    },
    {
      icon: Clock3,
      title: t.authHighlightResumeTitle,
      description: t.authHighlightResumeDesc,
    },
  ];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(214,180,72,0.16),_transparent_28%),linear-gradient(180deg,_hsl(var(--background))_0%,_hsl(var(--muted))_100%)] px-4 py-6 md:px-8 lg:px-12">
    <div className="mx-auto flex max-w-7xl items-center justify-between pb-6">
      <Link to="/" className="flex items-center gap-3">
        <div className="rounded-2xl border border-border bg-card px-3 py-2 shadow-sm">🕌</div>
        <div>
          <p className="text-lg font-semibold tracking-wide">Salam Takziah</p>
          <p className="text-sm text-muted-foreground">{t.authBrandTagline}</p>
        </div>
      </Link>
      <LanguageSwitcher />
    </div>

    <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative overflow-hidden rounded-[2rem] border border-border/80 bg-[linear-gradient(135deg,_rgba(23,23,23,0.98),_rgba(44,44,44,0.95))] p-8 text-white shadow-xl lg:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(212,175,55,0.20),_transparent_22%),radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.08),_transparent_28%)]" />
        <div className="relative space-y-8">
          <Badge variant="secondary" className="rounded-full bg-white/10 px-4 py-1 text-white hover:bg-white/10">
            {eyebrow}
          </Badge>
          <div className="space-y-4">
            <h1 className="max-w-xl text-4xl font-semibold leading-tight lg:text-5xl">
              {t.authShellHeadline}
            </h1>
            <p className="max-w-2xl text-base text-white/78 lg:text-lg">
              {t.authShellSubtitle}
            </p>
          </div>

          <div className="grid gap-4">
            {authHighlights.map((highlight) => (
              <div key={highlight.title} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-white/10 p-3">
                    <highlight.icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">{highlight.title}</p>
                    <p className="text-sm text-white/72">{highlight.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex items-center">
        <div className="w-full rounded-[2rem] border border-border/80 bg-card/95 p-6 shadow-xl backdrop-blur md:p-8 lg:p-10">
          <div className="mb-8 space-y-3">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">{eyebrow}</p>
            <h2 className="text-3xl font-semibold text-foreground">{title}</h2>
            <p className="text-muted-foreground">{subtitle}</p>
          </div>

          {form}

          <div className="mt-6 rounded-2xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            {switchPrompt}{" "}
            <Link className="font-medium text-foreground underline underline-offset-4" to={switchTo}>
              {switchLabel}
            </Link>
          </div>
        </div>
      </section>
    </div>
    </main>
  );
};

export default AuthShell;
