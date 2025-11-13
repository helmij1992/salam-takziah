import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const EnglishCondolences = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            🌍 English Condolences
          </h1>
          <p className="text-muted-foreground mt-2">
            Professional and respectful condolence messages in English for workplace or multicultural settings
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Formal Condolence Messages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <p className="font-medium mb-2">Message 1:</p>
                <p className="text-muted-foreground">
                  "Please accept my deepest condolences on the passing of [Name]. May Allah grant them Jannah and give you and your family strength during this difficult time."
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <p className="font-medium mb-2">Message 2:</p>
                <p className="text-muted-foreground">
                  "I am deeply saddened to hear about the loss of [Name]. My thoughts and prayers are with you and your family. May Allah have mercy on their soul and grant you patience and comfort."
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <p className="font-medium mb-2">Message 3:</p>
                <p className="text-muted-foreground">
                  "We are heartbroken to learn of [Name]'s passing. Please know that our prayers are with you during this sorrowful time. May Allah bless their soul with eternal peace."
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Workplace Condolence Messages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <p className="font-medium mb-2">For Colleagues:</p>
                <p className="text-muted-foreground">
                  "On behalf of [Company/Team Name], we extend our heartfelt condolences to you and your family. We are keeping you in our thoughts and prayers during this difficult time. Please take all the time you need."
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <p className="font-medium mb-2">For Professional Context:</p>
                <p className="text-muted-foreground">
                  "We were deeply saddened to hear about your loss. Our entire team sends its condolences and support. May you find comfort in the memories you shared and strength in the love of family and friends."
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Short & Simple Condolences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground border-l-4 border-primary pl-4">
                "My deepest sympathies to you and your family. May [Name] rest in peace."
              </p>
              <p className="text-muted-foreground border-l-4 border-primary pl-4">
                "Sending love and prayers your way during this difficult time."
              </p>
              <p className="text-muted-foreground border-l-4 border-primary pl-4">
                "My heart goes out to you. May Allah grant you strength and comfort."
              </p>
              <p className="text-muted-foreground border-l-4 border-primary pl-4">
                "Words cannot express how sorry I am for your loss. You are in my prayers."
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tips for English Condolences</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                <li>Keep the message sincere and heartfelt</li>
                <li>Acknowledge the pain and loss the family is experiencing</li>
                <li>Offer specific help if possible (e.g., "Please let me know if you need anything")</li>
                <li>Avoid clichés like "They're in a better place" unless culturally appropriate</li>
                <li>Respect religious and cultural differences in your wording</li>
                <li>Follow up with the family after the immediate mourning period</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t border-border mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 Ucapan Takziah dengan Doa & Ingatan. May peace be upon those who have passed.</p>
        </div>
      </footer>
    </div>
  );
};

export default EnglishCondolences;
