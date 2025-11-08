import { useState } from "react";
import PosterForm from "@/components/PosterForm";
import PosterPreview from "@/components/PosterPreview";
import InfoSections from "@/components/InfoSections";
import { PosterData } from "@/types/poster";

const Index = () => {
  const [posterData, setPosterData] = useState<PosterData | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-foreground">
            Penjana Poster Takziah Islam
          </h1>
          <p className="text-center text-muted-foreground mt-2">
            Cipta poster takziah yang elegan dan penuh hormat
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Form Section */}
          <div>
            <PosterForm onGenerate={setPosterData} />
          </div>

          {/* Preview Section */}
          <div className="lg:sticky lg:top-8 h-fit">
            <PosterPreview data={posterData} />
          </div>
        </div>

        {/* Info Sections */}
        <div className="mt-16">
          <InfoSections />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 Penjana Poster Takziah Islam. Semoga Allah merahmati arwah yang telah pergi.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
