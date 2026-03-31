import { createRoot } from "react-dom/client";
import "./index.css";

function StaticIsolationApp() {
  return (
    <main className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-3xl rounded-3xl border bg-card p-10 text-center shadow-sm">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">
          Static Root Isolation
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          The React root is still mounted, but the normal app tree is disabled.
        </p>
      </div>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<StaticIsolationApp />);
