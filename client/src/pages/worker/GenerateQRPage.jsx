import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../hooks/useAuth";
import QRCode from "qrcode"; // ✅ FIXED

export default function GenerateQR() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const canvasRef = useRef(null);

  const [batchId, setBatchId] = useState(searchParams.get("batchId") || "");
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [error, setError] = useState("");

  // Auto-load if batchId from URL
  useEffect(() => {
    if (batchId) handleGenerate(batchId);
  }, []);

  async function handleGenerate(id = batchId) {
    setError("");
    setGenerated(false);
    setBatch(null);

    if (!id.trim()) {
      setError("Enter a Batch ID.");
      return;
    }

    setLoading(true);

    const { data } = await supabase
      .from("batches")
      .select("*, stops(address)")
      .eq("id", id.trim())
      .single();

    if (!data) {
      setError("Batch not found.");
      setLoading(false);
      return;
    }

    setBatch(data);

    // QR content = public tracking URL
    const qrContent = `${window.location.origin}/track/${data.id}`;

    setTimeout(() => {
      if (canvasRef.current) {
        QRCode.toCanvas(
          canvasRef.current,
          qrContent,
          {
            width: 240,
            margin: 2,
            color: { dark: "#e8e8e0", light: "#0d0d0d" },
          },
          (err) => {
            if (!err) setGenerated(true);
          }
        );
      }
    }, 50);

    setLoading(false);
  }

  async function handleNewBatch() {
    setError("");
    setLoading(true);

    const { data, error: err } = await supabase
  .from("batches")
  .insert({
    worker_id: user?.id || "demo-worker",
    status: "Collected",
    collected_at: new Date().toISOString(),
  })
  .select("id")
  .single();

    if (err || !data) {
      setError("Failed to create batch.");
      setLoading(false);
      return;
    }

    setBatchId(data.id);
    handleGenerate(data.id);
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div style={{ padding: "24px 20px", maxWidth: 560, margin: "0 auto", fontFamily: "'DM Mono', monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Bebas+Neue&display=swap');
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); }
        }
      `}</style>

      <div style={{ fontFamily: "'Bebas Neue'", fontSize: 32, letterSpacing: 4, color: "#e8e8e0", marginBottom: 6 }}>
        GENERATE QR
      </div>

      <div style={{ fontSize: 11, color: "#555", letterSpacing: 2, marginBottom: 28 }}>
        ATTACH TO WASTE BATCH
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input
          value={batchId}
          onChange={(e) => setBatchId(e.target.value)}
          placeholder="Enter Batch ID…"
          style={{
            flex: 1,
            background: "#111",
            border: "1px solid #1f1f1f",
            color: "#e8e8e0",
            padding: "12px",
            fontSize: 12,
            fontFamily: "inherit",
            borderRadius: 3,
            outline: "none",
          }}
          onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
        />

        <button
          onClick={() => handleGenerate()}
          disabled={loading}
          style={{
            padding: "12px 18px",
            background: "#4ade80",
            color: "#000",
            border: "none",
            fontSize: 11,
            letterSpacing: 2,
            fontFamily: "inherit",
            cursor: "pointer",
            borderRadius: 3,
            fontWeight: 500,
            whiteSpace: "nowrap",
          }}
        >
          {loading ? "…" : "LOAD"}
        </button>
      </div>

      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <span style={{ fontSize: 11, color: "#333", letterSpacing: 1 }}>— OR —</span>
      </div>

      <button
        onClick={handleNewBatch}
        disabled={loading}
        style={{
          width: "100%",
          padding: "12px",
          background: "#111",
          border: "1px solid #1f1f1f",
          color: "#888",
          fontSize: 11,
          letterSpacing: 2,
          fontFamily: "inherit",
          cursor: "pointer",
          borderRadius: 3,
          marginBottom: 28,
        }}
      >
        + CREATE NEW BATCH & GENERATE QR
      </button>

      {error && (
        <div
          style={{
            background: "#1f0f0f",
            border: "1px solid #4a2020",
            color: "#f87171",
            padding: "10px 14px",
            borderRadius: 3,
            fontSize: 12,
            marginBottom: 20,
          }}
        >
          {error}
        </div>
      )}

      {/* QR Output */}
      {batch && (
        <div
          id="print-area"
          style={{
            background: "#0d0d0d",
            border: "1px solid #2d4a33",
            borderRadius: 4,
            padding: 28,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: "'Bebas Neue'",
              fontSize: 14,
              color: "#4ade80",
              letterSpacing: 4,
              marginBottom: 16,
            }}
          >
            WASTETRACK · BATCH QR
          </div>

          <canvas ref={canvasRef} style={{ borderRadius: 4 }} />

          {generated && (
            <>
              <div style={{ marginTop: 16, fontSize: 11, color: "#555", letterSpacing: 1 }}>
                BATCH ID
              </div>

              <div style={{ fontSize: 13, color: "#e8e8e0", letterSpacing: 2, marginBottom: 12 }}>
                {batch.id}
              </div>

              <button
                onClick={handlePrint}
                style={{
                  padding: "10px 24px",
                  background: "none",
                  border: "1px solid #4ade80",
                  color: "#4ade80",
                  fontSize: 11,
                  letterSpacing: 2,
                  fontFamily: "inherit",
                  cursor: "pointer",
                  borderRadius: 3,
                }}
              >
                PRINT / SAVE QR
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}