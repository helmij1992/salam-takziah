import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Crown, Sparkles, ArrowRight, Users, Zap } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { PosterData } from "@/types/poster";

const exampleAccentMap = {
  classic: "from-stone-100 via-zinc-100 to-amber-50",
  retro: "from-amber-100 via-orange-50 to-rose-50",
  premium: "from-slate-900 via-emerald-900 to-stone-800",
} as const;

const HomePage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const examplesSectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUserEmail(data.session?.user?.email ?? null);
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUserEmail(session?.user?.email ?? null);
      if (event === "SIGNED_OUT") {
        setUserEmail(null);
      }
    });

    return () => authListener?.subscription.unsubscribe();
  }, []);

  const planIconMap = {
    basic: Sparkles,
    pro: Star,
    enterprise: Crown,
  } as const;

  const planButtonVariantMap = {
    basic: "outline",
    pro: "default",
    enterprise: "secondary",
  } as const;

  const plans = t.homePlans.map((plan) => ({
    ...plan,
    icon: planIconMap[plan.id],
    buttonVariant: planButtonVariantMap[plan.id],
  }));

  const features = [
    {
      icon: Sparkles,
      title: t.homeFeature1Title,
      description: t.homeFeature1Desc
    },
    {
      icon: Users,
      title: t.homeFeature2Title,
      description: t.homeFeature2Desc
    },
    {
      icon: Zap,
      title: t.homeFeature3Title,
      description: t.homeFeature3Desc
    }
  ];

  const examples = useMemo(
    () =>
      t.homeExamples.map((example) => ({
        ...example,
        poster: {
          photo: null,
          fullName: example.fullName,
          gender: example.fullName.toLowerCase().includes("almarhumah") ? "almarhumah" : "allahyarham",
          birthDate: "",
          deathDate: "",
          organization: example.organization,
          message:
            t.homeExamplesPreviewLabel === "Pratonton gaya"
              ? "Semoga Allah SWT mengampuni segala dosa, merahmati rohnya, dan menempatkannya dalam kalangan orang beriman."
              : "May Allah forgive their shortcomings, grant mercy upon their soul, and place them among the righteous.",
          from: example.from,
          theme: example.theme,
          format: example.format,
          whiteLabel: false,
        } satisfies PosterData,
        accentClassName: exampleAccentMap[example.theme],
      })),
    [t.homeExamples, t.homeExamplesPreviewLabel],
  );
  const createNavLabel = userEmail ? t.homeNavCreate : "Login untuk Cipta Poster";
  const createHeroLabel = userEmail ? t.homeHeroCreateButton : "Login untuk Cipta Poster";
  const createCtaLabel = userEmail ? t.homeCtaButton : "Login untuk Mula Mencipta";

  const handleScrollToExamples = () => {
    examplesSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleStartCreating = () => {
    navigate(userEmail ? "/create" : "/login", {
      state: userEmail ? undefined : { redirectTo: "/create" },
    });
  };

  const handleUseExample = (poster: PosterData, title: string) => {
    navigate(userEmail ? "/create" : "/login", {
      state: {
        redirectTo: "/create",
        ...(userEmail
          ? {
              draftPoster: poster,
              sourceLabel: `example: ${title}`,
              draftTitle: title,
            }
          : {}),
      },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🕌</span>
              <span className="text-xl font-bold tracking-wide">Salam Takziah</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={handleStartCreating}>{createNavLabel}</Button>
              {userEmail ? (
                <>
                  <span className="text-sm text-muted-foreground">{userEmail}</span>
                  <Link to="/dashboard">
                    <Button variant="default">Dashboard</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="outline">Login</Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="secondary">Register</Button>
                  </Link>
                </>
              )}
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            {t.homeHeroTitle}
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t.homeHeroSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-6" onClick={handleStartCreating}>
              {createHeroLabel}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6" onClick={handleScrollToExamples}>
              {t.homeHeroExamplesButton}
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded bg-primary text-primary-foreground border border-primary">
              🇲🇾 Reka Bentuk Malaysia
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded bg-secondary text-secondary-foreground border border-secondary">
              🕋 Khat & Motif Islamik Sedia
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded bg-accent text-accent-foreground border border-accent">
              📱 Media Sosial Teroptimum
            </span>
          </div>
        </div>
      </section>

      <section ref={examplesSectionRef} className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t.homeExamplesTitle}</h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              {t.homeExamplesSubtitle}
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {examples.map((example) => (
              <Card key={example.id} className="overflow-hidden border-border/80">
                <div className={`border-b border-border/70 bg-gradient-to-br ${example.accentClassName} p-6 ${example.theme === "premium" ? "text-white" : "text-foreground"}`}>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <Badge variant={example.theme === "premium" ? "secondary" : "outline"}>
                      {example.label}
                    </Badge>
                    <span className={`text-xs ${example.theme === "premium" ? "text-white/80" : "text-muted-foreground"}`}>
                      {t.homeExamplesPreviewLabel}
                    </span>
                  </div>
                  <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
                    <p className={`text-xs uppercase tracking-[0.2em] ${example.theme === "premium" ? "text-white/70" : "text-muted-foreground"}`}>
                      Salam Takziah
                    </p>
                    <p className="mt-3 text-lg font-semibold leading-snug">{example.poster.fullName}</p>
                    <p className={`mt-2 text-sm ${example.theme === "premium" ? "text-white/80" : "text-muted-foreground"}`}>
                      {example.poster.organization}
                    </p>
                    <div className={`mt-6 flex flex-wrap gap-2 text-xs ${example.theme === "premium" ? "text-white/80" : "text-muted-foreground"}`}>
                      <span className="rounded-full border border-current/20 px-3 py-1">{example.theme}</span>
                      <span className="rounded-full border border-current/20 px-3 py-1">{example.format}</span>
                    </div>
                  </div>
                </div>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl">{example.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{example.description}</p>
                  <div className="rounded-lg bg-muted/50 p-4 text-sm">
                    <p className="font-medium">{example.poster.from}</p>
                    <p className="mt-2 text-muted-foreground line-clamp-3">{example.poster.message}</p>
                  </div>
                  <Button className="w-full" onClick={() => handleUseExample(example.poster, example.title)}>
                    {t.homeExamplesUseButton}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t.homeFeaturesTitle}</h2>
            <p className="text-muted-foreground text-lg">
              {t.homeFeaturesSubtitle}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <feature.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex justify-end gap-2 mb-6">
            <LanguageSwitcher />
          </div>

          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{t.homePricingTitle}</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t.homePricingSubtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1">
                      {t.homePlanPopularBadge}
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <plan.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="text-sm text-muted-foreground mb-2">{plan.tier}</div>
                  <div className="text-4xl font-bold">
                    {plan.price}
                    <span className="text-lg font-normal text-muted-foreground">
                      /{plan.period}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-2">{plan.description}</p>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    variant={plan.buttonVariant}
                    size="lg"
                  >
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              {t.homeTrialText}
            </p>
            <p className="text-sm text-muted-foreground">
              {t.homeSavingsText}
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-3xl font-bold mb-4">{t.homeCtaTitle}</h2>
          <p className="text-lg mb-8 opacity-90">
            {t.homeCtaSubtitle}
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8 py-6" onClick={handleStartCreating}>
            {createCtaLabel}
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-2xl">🌙</span>
                <span className="font-bold">Salam Takziah</span>
              </div>
              <p className="text-muted-foreground text-sm">
                {t.homeFooterTagline}
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{t.homeNavProduct || "Product"}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button type="button" onClick={handleStartCreating} className="hover:text-foreground">{createNavLabel}</button></li>
                <li><a href="#" className="hover:text-foreground">{t.homeNavTemplates}</a></li>
                <li><a href="#" className="hover:text-foreground">{t.homeNavPricing}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{t.homeNavSupport || "Support"}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">{t.homeNavHelp}</a></li>
                <li><a href="#" className="hover:text-foreground">{t.homeNavContact}</a></li>
                <li><a href="#" className="hover:text-foreground">{t.homeNavStatus}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{t.homeNavCompany || "Company"}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">{t.homeNavAbout}</a></li>
                <li><a href="#" className="hover:text-foreground">{t.homeNavBlog}</a></li>
                <li><a href="#" className="hover:text-foreground">{t.homeNavPrivacy}</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground text-sm">
            <p>© 2025 Salam Takziah. Semoga Allah merahmati arwah yang telah pergi.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
