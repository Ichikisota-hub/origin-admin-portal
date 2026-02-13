import React from 'react';

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f172a",
        color: "white",
        fontFamily: "sans-serif"
      }}
    >
      <div
        style={{
          textAlign: "center",
          background: "#020617",
          padding: "40px",
          borderRadius: "16px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
          border: "1px solid rgba(255,255,255,0.1)"
        }}
      >
        <h1 style={{ fontSize: "32px", marginBottom: "10px", fontWeight: "bold" }}>
          ORIGIN ADMIN PORTAL
        </h1>

        <p style={{ opacity: 0.7, marginBottom: "30px" }}>
          管理ダッシュボード
        </p>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <a
            href="#/players"
            style={{
              background: "#2563eb",
              padding: "12px 24px",
              borderRadius: "10px",
              textDecoration: "none",
              color: "white",
              fontWeight: "600",
              transition: "opacity 0.2s"
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = "0.8")}
            onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
          >
            プレイヤー管理
          </a>

          <a
            href="#/ranking"
            style={{
              background: "#16a34a",
              padding: "12px 24px",
              borderRadius: "10px",
              textDecoration: "none",
              color: "white",
              fontWeight: "600",
              transition: "opacity 0.2s"
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = "0.8")}
            onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
          >
            ランキング
          </a>
        </div>
      </div>
    </main>
  );
}
