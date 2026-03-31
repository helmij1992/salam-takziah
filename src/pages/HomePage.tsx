import { Link, useNavigate, type To } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Sparkles, ArrowRight, Users, Zap } from "lucide-react";
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
  } as const;

  const planButtonVariantMap = {
    basic: "outline",
    pro: "default",
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
  const createHeroLabel = userEmail ? t.homeHeroCreateButton : "Login untuk Cipta Poster";
  const createCtaLabel = userEmail ? t.homeCtaButton : "Login untuk Mula Mencipta";

  const handleScrollToExamples = () => {
    examplesSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleScrollToPricing = () => {
    const pricingSection = document.getElementById("pricing");
    pricingSection?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleStartCreating = () => {
    navigate(userEmail ? "/create" : "/login", {
      state: userEmail ? undefined : { redirectTo: "/create" },
    });
  };

  const getPlanRedirectTarget = (planId: string) => {
    return planId === "pro" ? "/dashboard" : "/create";
  };

  const getPlanActionTarget = (planId: string): To => {
    if (userEmail) {
      return getPlanRedirectTarget(planId);
    }

    return "/register";
  };

  const getPlanActionState = (planId: string): Record<string, unknown> | undefined => {
    if (userEmail) {
      return undefined;
    }
    return { redirectTo: getPlanRedirectTarget(planId), selectedPlan: planId };
  };

  const handlePlanAction = async (planId: string) => {
    if (!userEmail) {
      navigate(getPlanActionTarget(planId), {
        state: getPlanActionState(planId),
      });
      return;
    }

    navigate(getPlanRedirectTarget(planId));
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
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🕌</span>
              <span className="text-xl font-bold tracking-wide">Salam Takziah</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="hidden items-center gap-2 md:flex">
                <button type="button" onClick={handleScrollToExamples} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  {t.homeHeroExamplesButton}
                </button>
                <button type="button" onClick={handleScrollToPricing} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  {t.homeNavPricing}
                </button>
              </div>
              {userEmail ? (
                <>
                  <span className="hidden text-sm text-muted-foreground md:inline">{userEmail}</span>
                  <Link to="/dashboard">
                    <Button variant="default">Dashboard</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="outline">{t.homeLoginButton}</Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="secondary">{t.homeRegisterButton}</Button>
                  </Link>
                </>
              )}
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 md:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(196,149,89,0.18),_transparent_32%),radial-gradient(circle_at_80%_20%,_rgba(26,88,76,0.14),_transparent_30%)]" />
        <div className="container relative mx-auto max-w-6xl">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="max-w-3xl">
              <Badge variant="outline" className="mb-5 rounded-full px-4 py-1.5 text-xs tracking-[0.18em]">
                SALAM TAKZIAH
              </Badge>
              <h1 className="text-4xl font-bold leading-tight text-foreground md:text-6xl">
                {t.homeHeroTitle}
              </h1>
              <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
                {t.homeHeroSubtitle}
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Button size="lg" className="text-lg px-8 py-6" onClick={handleStartCreating}>
                  {createHeroLabel}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6" onClick={handleScrollToExamples}>
                  {t.homeHeroExamplesButton}
                </Button>
              </div>
              <div className="mt-8 flex flex-wrap gap-3 text-sm">
                <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 shadow-sm">
                  🇲🇾 {t.homeFeature2Title}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 shadow-sm">
                  🕋 {t.homeFeature1Title}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 shadow-sm">
                  📱 {t.homeFeature3Title}
                </span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="border-border/70 bg-card/90 shadow-sm sm:col-span-2">
                <CardContent className="grid gap-4 p-6 sm:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">{t.homePricingSummaryLabel}</p>
                    <p className="mt-2 text-2xl font-semibold">{t.homePricingSummaryValue}</p>
                    <p className="text-sm text-muted-foreground">{t.homeNavPricing}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t.homeExamplesPreviewLabel}</p>
                    <p className="mt-2 text-2xl font-semibold">{t.homeExamplesSummaryValue}</p>
                    <p className="text-sm text-muted-foreground">{t.homeExamplesTitle}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t.homeFeature3Title}</p>
                    <p className="mt-2 text-2xl font-semibold">{t.homeQualitySummaryValue}</p>
                    <p className="text-sm text-muted-foreground">{t.homeFeature3Desc}</p>
                  </div>
                </CardContent>
              </Card>

              {examples.slice(0, 2).map((example) => (
                <Card key={example.id} className="overflow-hidden border-border/70 shadow-sm">
                  <div className={`h-24 bg-gradient-to-br ${example.accentClassName}`} />
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <Badge variant="outline">{example.label}</Badge>
                      <span className="text-xs text-muted-foreground">{example.format}</span>
                    </div>
                    <p className="mt-4 text-lg font-semibold">{example.poster.fullName}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{example.title}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section ref={examplesSectionRef} className="px-4 py-16">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t.homeExamplesTitle}</h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              {t.homeExamplesSubtitle}
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {examples.map((example) => (
              <Card key={example.id} className="overflow-hidden border-border/80 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
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
      <section className="bg-muted/30 px-4 py-16">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t.homeFeaturesTitle}</h2>
            <p className="text-muted-foreground text-lg">
              {t.homeFeaturesSubtitle}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-border/70 text-center p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
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
      <section id="pricing" className="px-4 py-20">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 rounded-full px-4 py-1.5">
              {t.homeNavPricing}
            </Badge>
            <h2 className="text-4xl font-bold mb-4">{t.homePricingTitle}</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t.homePricingSubtitle}
            </p>
          </div>

          <div className="grid gap-8 max-w-5xl mx-auto md:grid-cols-2">
            {plans.map((plan, index) => (
              <div key={index} className={plan.popular ? "pt-5" : ""}>
                <Card
                  className={`relative border-border/80 shadow-sm ${plan.popular ? 'border-primary shadow-xl md:-translate-y-2' : ''}`}
                >
                  <div className={`absolute inset-x-0 top-0 h-1 ${plan.popular ? "bg-primary" : "bg-border"}`} />
                  {plan.popular && (
                    <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2">
                      <Badge className="whitespace-nowrap bg-primary px-4 py-1 text-primary-foreground shadow-sm">
                        {t.homePlanPopularBadge}
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="pb-4 pt-8 text-center">
                    <plan.icon className="mx-auto mb-4 h-12 w-12 text-primary" />
                    <CardTitle className="text-2xl leading-tight">{plan.name}</CardTitle>
                    <div className="mb-2 text-sm text-muted-foreground">{plan.tier}</div>
                    <div className="flex flex-col items-center justify-center gap-1 sm:flex-row sm:items-end">
                      <span className="text-4xl font-bold leading-none">{plan.price}</span>
                      <span className="text-base font-medium text-muted-foreground sm:pb-1">
                        /{plan.period}
                      </span>
                    </div>
                    <p className="mt-3 text-balance text-muted-foreground">{plan.description}</p>
                  </CardHeader>

                  <CardContent>
                    <ul className="mb-6 space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <Check className="mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                          <span className="text-sm leading-6">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className="w-full"
                      variant={plan.buttonVariant}
                      size="lg"
                      onClick={() => {
                        void handlePlanAction(plan.id);
                      }}
                    >
                      {plan.buttonText}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-12 max-w-3xl rounded-3xl border bg-muted/30 p-6 text-center">
            <p className="mb-3 text-muted-foreground">
              {t.homeTrialText}
            </p>
            <p className="text-sm text-muted-foreground">
              {t.homeSavingsText}
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#0f172a_0%,#1f5f4f_50%,#c18a4b_100%)] px-6 py-12 text-primary-foreground shadow-xl md:px-10">
            <h2 className="text-3xl font-bold mb-4">{t.homeCtaTitle}</h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-primary-foreground/85">
              {t.homeCtaSubtitle}
            </p>
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6" onClick={handleStartCreating}>
              {createCtaLabel}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
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
                <li><button type="button" onClick={handleStartCreating} className="hover:text-foreground">{t.homeNavCreate}</button></li>
                <li><button type="button" onClick={handleScrollToExamples} className="hover:text-foreground">{t.homeNavTemplates}</button></li>
                <li><button type="button" onClick={handleScrollToPricing} className="hover:text-foreground">{t.homeNavPricing}</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{t.homeNavSupport || "Support"}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button type="button" onClick={handleScrollToPricing} className="hover:text-foreground">{t.homeNavHelp}</button></li>
                <li><Link to="/register" className="hover:text-foreground">{t.homeNavContact}</Link></li>
                <li><Link to="/login" className="hover:text-foreground">{t.homeNavStatus}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{t.homeNavCompany || "Company"}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button type="button" onClick={handleScrollToExamples} className="hover:text-foreground">{t.homeNavAbout}</button></li>
                <li><button type="button" onClick={handleScrollToPricing} className="hover:text-foreground">{t.homeNavBlog}</button></li>
                <li><Link to="/register" className="hover:text-foreground">{t.homeNavPrivacy}</Link></li>
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
