import { createRoot } from "react-dom/client";

function StaticIsolationApp() {
  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "40px 24px",
        backgroundColor: "#ffffff",
        color: "#111111",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "720px",
          margin: "0 auto",
          border: "1px solid #d4d4d8",
          borderRadius: "24px",
          padding: "40px",
          textAlign: "center",
          backgroundColor: "#ffffff",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "40px", fontWeight: 700 }}>
          Static Root Isolation
        </h1>
        <p style={{ margin: "16px 0 0", fontSize: "18px", lineHeight: 1.6 }}>
          The React root is still mounted, but CSS and the normal app tree are
          disabled.
        </p>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<StaticIsolationApp />);
