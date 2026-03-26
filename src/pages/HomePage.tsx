import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Crown, Sparkles, ArrowRight, Heart, Users, Zap } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

const HomePage = () => {
  const { t } = useLanguage();
  const [userEmail, setUserEmail] = useState<string | null>(null);

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

  const plans = [
    {
      name: "Basic Memorial",
      tier: "Free",
      price: "RM 0",
      period: "selamanya",
      description: "Sesuai untuk pengguna kasual dan pencipta kali pertama",
      icon: Heart,
      features: [
        "5 posters per month",
        "Classic format (4:3)",
        "Basic themes (Classic & Retro)",
        "Standard resolution (1080p)",
        "Photo upload & grayscale",
        "Basic form fields",
        "Standard Islamic prayers",
        "Watermarked downloads",
        "Basic support (FAQ)"
      ],
      buttonText: "Get Started Free",
      buttonVariant: "outline" as const,
      popular: false
    },
    {
      name: "Professional Memorial",
      tier: "Premium",
      price: "RM 39.90",
      period: "sebulan",
      description: "Untuk pengguna biasa, keluarga, dan organisasi kecil",
      icon: Star,
      features: [
        "Everything in Free +",
        "Unlimited posters",
        "All social media formats",
        "Premium themes & patterns",
        "High-resolution (4K)",
        "Custom condolence messages",
        "Advanced customization",
        "Batch creation (up to 10)",
        "Cloud storage & drafts",
        "Priority email support",
        "Remove watermarks",
        "Multiple export formats"
      ],
      buttonText: "Start Premium Trial",
      buttonVariant: "default" as const,
      popular: true
    },
    {
      name: "Enterprise Memorial",
      tier: "Diamond",
      price: "RM 99.90",
      period: "sebulan",
      description: "Untuk rumah pengebumian dan organisasi besar",
      icon: Crown,
      features: [
        "Everything in Premium +",
        "White-label branding",
        "Custom organization templates",
        "API access & integrations",
        "Advanced analytics",
        "Unlimited batch processing",
        "24/7 phone support",
        "Custom Arabic calligraphy",
        "Video memorial creation",
        "Multi-language support",
        "Team collaboration",
        "Advanced sharing features"
      ],
      buttonText: "Contact Sales",
      buttonVariant: "secondary" as const,
      popular: false
    }
  ];

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
              <Link to="/create">
                <Button variant="ghost">{t.homeNavCreate}</Button>
              </Link>
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
            <Link to="/create">
              <Button size="lg" className="text-lg px-8 py-6">
                {t.homeHeroCreateButton}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              {t.homeHeroExamplesButton}
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded bg-primary/10 text-primary border border-primary/20">
              🇲🇾 Reka Bentuk Malaysia
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded bg-secondary/10 text-secondary border border-secondary/20">
              🕋 Khat & Motif Islamik Sedia
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded bg-accent/10 text-accent border border-accent/20">
              📱 Media Sosial Teroptimum
            </span>
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
                      Most Popular
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
          <Link to="/create">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              {t.homeCtaButton}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="w-6 h-6 text-primary" />
                <span className="font-bold">Salam Takziah</span>
              </div>
              <p className="text-muted-foreground text-sm">
                {t.homeFooterTagline}
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{t.homeNavProduct || "Product"}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/create" className="hover:text-foreground">{t.homeNavCreate}</Link></li>
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