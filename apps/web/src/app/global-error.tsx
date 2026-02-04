"use client";

import { useEffect } from "react";

// ============================================================================
// Global Error Handler
// Catches errors in root layout. Must include its own html/body tags.
// ============================================================================

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#030712",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ textAlign: "center", color: "#f5f5f5", padding: "2rem" }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              margin: "0 auto 1.5rem",
            }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#f87171"
              strokeWidth="2"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>

          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            Something went wrong
          </h1>

          <p style={{ color: "rgba(151, 254, 237, 0.7)", marginBottom: "1.5rem" }}>
            A critical error occurred. Please try again.
          </p>

          <button
            onClick={reset}
            style={{
              padding: "0.75rem 1.5rem",
              fontSize: "1rem",
              fontWeight: 500,
              color: "#fff",
              backgroundColor: "#35A29F",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              marginRight: "0.5rem",
            }}
          >
            Try Again
          </button>

          <button
            onClick={() => (window.location.href = "/")}
            style={{
              padding: "0.75rem 1.5rem",
              fontSize: "1rem",
              fontWeight: 500,
              color: "#35A29F",
              backgroundColor: "transparent",
              border: "1px solid #35A29F",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Go Home
          </button>
        </div>
      </body>
    </html>
  );
}
