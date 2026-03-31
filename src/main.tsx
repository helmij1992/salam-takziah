const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

root.innerHTML = `
  <div style="min-height:100vh;padding:40px 24px;background:#ffffff;color:#111111;font-family:Arial,sans-serif;">
    <div style="max-width:720px;margin:0 auto;border:1px solid #d4d4d8;border-radius:24px;padding:40px;text-align:center;background:#ffffff;">
      <h1 style="margin:0;font-size:40px;font-weight:700;">Plain DOM Isolation</h1>
      <p style="margin:16px 0 0;font-size:18px;line-height:1.6;">
        The root is mounted with plain DOM only. React and the normal app tree are disabled.
      </p>
    </div>
  </div>
`;
