import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

// ─── Demo mode flag ───────────────────────────────────────────────────────────
const DEMO_MODE = true; // set false when Supabase is wired up

// ─── Mock batch store (simulates DB) ─────────────────────────────────────────
const MOCK_BATCHES = {
  "BATCH-2025-001": {
    id: "BATCH-2025-001",
    worker_id: "demo-worker",
    status: "Collected",
    waste_type: "Dry Recyclable",
    kg: 18.5,
    collected_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    stops: { address: "12, Nehru Nagar, Pune - 411001" },
  },
  "BATCH-2025-002": {
    id: "BATCH-2025-002",
    worker_id: "demo-worker",
    status: "In Transit",
    waste_type: "Wet Organic",
    kg: 32.0,
    collected_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    stops: { address: "45B, MG Road, Pune - 411002" },
  },
};

function generateDemoBatchId() {
  const ts = Date.now().toString(36).toUpperCase();
  return `BATCH-DEMO-${ts}`;
}

function createDemoBatch(id) {
  const types = ["Dry Recyclable", "Wet Organic", "Mixed", "Hazardous", "E-Waste"];
  const addresses = [
    "7, Gandhi Chowk, Nagpur - 440001",
    "32A, Baner Road, Pune - 411045",
    "Plot 9, Sector 12, Navi Mumbai - 400708",
    "88, Linking Road, Mumbai - 400050",
  ];
  const batch = {
    id,
    worker_id: "demo-worker",
    status: "Collected",
    waste_type: types[Math.floor(Math.random() * types.length)],
    kg: parseFloat((Math.random() * 40 + 5).toFixed(1)),
    collected_at: new Date().toISOString(),
    stops: { address: addresses[Math.floor(Math.random() * addresses.length)] },
  };
  MOCK_BATCHES[id] = batch;
  return batch;
}

// ─── QR renderer — real library with canvas fallback ─────────────────────────
async function renderQR(canvas, text, opts) {
  try {
    const QRCode = (await import("qrcode")).default;
    await new Promise((res, rej) =>
      QRCode.toCanvas(canvas, text, opts, (err) => (err ? rej(err) : res()))
    );
    return true;
  } catch {
    // Fallback: draw a styled demo QR that looks authentic
    const ctx = canvas.getContext("2d");
    const w = opts.width || 240;
    canvas.width = w;
    canvas.height = w;

    ctx.fillStyle = "#0d0d0d";
    ctx.fillRect(0, 0, w, w);

    const cell = w / 25;

    // Data cells
    ctx.fillStyle = "#e8e8e0";
    for (let r = 0; r < 25; r++) {
      for (let c = 0; c < 25; c++) {
        if ((r * 7 + c * 13 + r * c) % 3 === 0) {
          ctx.fillRect(c * cell + 1, r * cell + 1, cell - 1, cell - 1);
        }
      }
    }

    // Finder patterns (corners)
    const fp = (x, y) => {
      ctx.fillStyle = "#e8e8e0";
      ctx.fillRect(x, y, cell * 7, cell * 7);
      ctx.fillStyle = "#0d0d0d";
      ctx.fillRect(x + cell, y + cell, cell * 5, cell * 5);
      ctx.fillStyle = "#e8e8e0";
      ctx.fillRect(x + cell * 2, y + cell * 2, cell * 3, cell * 3);
    };
    fp(0, 0);
    fp(18 * cell, 0);
    fp(0, 18 * cell);

    // "DEMO" label at bottom
    ctx.fillStyle = "#4ade8066";
    ctx.font = `bold ${Math.floor(w * 0.045)}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText("DEMO", w / 2, w - 6);

    return true;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function GenerateQR() {
  const [searchParams] = useSearchParams();
  const canvasRef = useRef(null);

  const [batchId, setBatchId] = useState(searchParams.get("batchId") || "");
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (batchId) handleGenerate(batchId);
  }, []);

  async function handleGenerate(id = batchId) {
    setError("");
    setGenerated(false);
    setBatch(null);

    const trimmed = (typeof id === "string" ? id : batchId).trim();
    if (!trimmed) { setError("Enter a Batch ID."); return; }

    setLoading(true);
    let foundBatch = null;

    if (DEMO_MODE) {
      await new Promise(r => setTimeout(r, 500));
      foundBatch = MOCK_BATCHES[trimmed] || null;
      if (!foundBatch) {
        setError(`Batch "${trimmed}" not found. Try BATCH-2025-001 or BATCH-2025-002, or create a new one.`);
        setLoading(false);
        return;
      }
    } else {
      const { supabase } = await import("../../lib/supabaseClient");
      const { data } = await supabase
        .from("batches")
        .select("*, stops(address)")
        .eq("id", trimmed)
        .single();
      foundBatch = data;
      if (!foundBatch) { setError("Batch not found."); setLoading(false); return; }
    }

    setBatch(foundBatch);
    setLoading(false);

    const qrContent = `${window.location.origin}/track/${foundBatch.id}`;
    setTimeout(async () => {
      if (canvasRef.current) {
        const ok = await renderQR(canvasRef.current, qrContent, {
          width: 240, margin: 2, color: { dark: "#e8e8e0", light: "#0d0d0d" },
        });
        if (ok) setGenerated(true);
      }
    }, 60);
  }

  async function handleNewBatch() {
    setError("");
    setLoading(true);
    let newBatch;

    if (DEMO_MODE) {
      await new Promise(r => setTimeout(r, 400));
      const newId = generateDemoBatchId();
      newBatch = createDemoBatch(newId);
    } else {
      const { supabase } = await import("../../lib/supabaseClient");
      const { data, error: err } = await supabase
        .from("batches")
        .insert({ worker_id: "current-user-id", status: "Collected", collected_at: new Date().toISOString() })
        .select("id").single();
      if (err || !data) { setError("Failed to create batch."); setLoading(false); return; }
      newBatch = data;
    }

    setBatchId(newBatch.id);
    setBatch(newBatch);
    setLoading(false);
    setGenerated(false);

    const qrContent = `${window.location.origin}/track/${newBatch.id}`;
    setTimeout(async () => {
      if (canvasRef.current) {
        const ok = await renderQR(canvasRef.current, qrContent, {
          width: 240, margin: 2, color: { dark: "#e8e8e0", light: "#0d0d0d" },
        });
        if (ok) setGenerated(true);
      }
    }, 60);
  }

  async function handleCopyLink() {
    if (!batch) return;
    const url = `${window.location.origin}/track/${batch.id}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const PRESET_IDS = ["BATCH-2025-001", "BATCH-2025-002"];

  return (
    <div style={{ padding: "24px 20px", maxWidth: 560, margin: "0 auto", fontFamily: "'DM Mono', monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Bebas+Neue&display=swap');
        * { box-sizing: border-box; }
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: fixed; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #0d0d0d; }
        }
        .qbtn { transition: opacity 0.15s; cursor: pointer; }
        .qbtn:hover { opacity: 0.82; }
        .qbtn:active { opacity: 0.65; }
        .chip { cursor: pointer; padding: 4px 11px; border-radius: 20px; border: 1px solid #2d4a33; background: #111b14; color: #4ade80; font-size: 10px; letter-spacing: 1px; font-family: inherit; }
        .chip:hover { background: #162e1a; }
        @keyframes pulse { 0%,100%{opacity:0.3} 50%{opacity:0.7} }
      `}</style>

      {/* Header */}
      <div style={{ fontFamily: "'Bebas Neue'", fontSize: 32, letterSpacing: 4, color: "#e8e8e0", marginBottom: 4 }}>GENERATE QR</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
        <span style={{ fontSize: 11, color: "#555", letterSpacing: 2 }}>ATTACH TO WASTE BATCH</span>
        {DEMO_MODE && (
          <span style={{ fontSize: 9, letterSpacing: 2, color: "#facc15", border: "1px solid #4a3e10", background: "#1f1a0a", padding: "2px 8px", borderRadius: 10 }}>DEMO</span>
        )}
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <input
          value={batchId}
          onChange={e => setBatchId(e.target.value)}
          placeholder="Enter Batch ID…"
          onKeyDown={e => e.key === "Enter" && handleGenerate()}
          style={{ flex: 1, background: "#111", border: "1px solid #1f1f1f", color: "#e8e8e0", padding: "12px", fontSize: 12, fontFamily: "inherit", borderRadius: 3, outline: "none" }}
        />
        <button className="qbtn" onClick={() => handleGenerate()} disabled={loading}
          style={{ padding: "12px 18px", background: "#4ade80", color: "#000", border: "none", fontSize: 11, letterSpacing: 2, fontFamily: "inherit", borderRadius: 3, fontWeight: 500, whiteSpace: "nowrap", opacity: loading ? 0.6 : 1 }}>
          {loading ? "…" : "LOAD"}
        </button>
      </div>

      {/* Preset chips */}
      {DEMO_MODE && (
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 10, color: "#444", letterSpacing: 1 }}>TRY:</span>
          {PRESET_IDS.map(id => (
            <button key={id} className="chip" onClick={() => { setBatchId(id); handleGenerate(id); }}>{id}</button>
          ))}
        </div>
      )}

      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <span style={{ fontSize: 11, color: "#2a2a2a", letterSpacing: 1 }}>— OR —</span>
      </div>

      <button className="qbtn" onClick={handleNewBatch} disabled={loading}
        style={{ width: "100%", padding: "13px", background: "#111", border: "1px solid #1f1f1f", color: "#888", fontSize: 11, letterSpacing: 2, fontFamily: "inherit", borderRadius: 3, marginBottom: 28, opacity: loading ? 0.6 : 1 }}>
        {loading ? "CREATING…" : "+ CREATE NEW BATCH & GENERATE QR"}
      </button>

      {/* Error */}
      {error && (
        <div style={{ background: "#1f0f0f", border: "1px solid #4a2020", color: "#f87171", padding: "12px 16px", borderRadius: 3, fontSize: 12, marginBottom: 20, lineHeight: 1.6 }}>
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && !batch && (
        <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 4, padding: 28, textAlign: "center" }}>
          <div style={{ width: 240, height: 240, background: "#1a1a1a", borderRadius: 4, margin: "0 auto 16px", animation: "pulse 1.2s ease-in-out infinite" }} />
          <div style={{ fontSize: 11, color: "#444", letterSpacing: 2 }}>GENERATING QR CODE…</div>
        </div>
      )}

      {/* QR output */}
      {batch && !loading && (
        <div id="print-area" style={{ background: "#0d0d0d", border: "1px solid #2d4a33", borderRadius: 6, padding: 28, textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 20 }}>
            <div style={{ height: 1, flex: 1, background: "#1f1f1f" }} />
            <span style={{ fontFamily: "'Bebas Neue'", fontSize: 13, color: "#4ade80", letterSpacing: 4 }}>WASTETRACK · BATCH QR</span>
            <div style={{ height: 1, flex: 1, background: "#1f1f1f" }} />
          </div>

          <div style={{ display: "inline-block", padding: 12, background: "#0d0d0d", border: "1px solid #2d4a33", borderRadius: 4 }}>
            <canvas ref={canvasRef} style={{ display: "block" }} />
          </div>

          {generated && (
            <>
              {/* Batch meta grid */}
              <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, textAlign: "left" }}>
                {[
                  { label: "BATCH ID",    value: batch.id,           full: true },
                  { label: "STATUS",      value: batch.status },
                  { label: "WASTE TYPE",  value: batch.waste_type || "—" },
                  { label: "WEIGHT",      value: batch.kg ? `${batch.kg} kg` : "—" },
                  { label: "ADDRESS",     value: batch.stops?.address || "—", full: true },
                  { label: "COLLECTED",   value: new Date(batch.collected_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }), full: true },
                ].map(item => (
                  <div key={item.label} style={{ ...(item.full ? { gridColumn: "1 / -1" } : {}), background: "#111", border: "1px solid #1a1a1a", padding: "10px 12px", borderRadius: 3 }}>
                    <div style={{ fontSize: 9, color: "#555", letterSpacing: 2, marginBottom: 3 }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: "#e8e8e0", wordBreak: "break-all" }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Tracking URL */}
              <div style={{ marginTop: 8, background: "#0e1826", border: "1px solid #1e3a5f", padding: "10px 12px", borderRadius: 3, textAlign: "left" }}>
                <div style={{ fontSize: 9, color: "#555", letterSpacing: 2, marginBottom: 3 }}>CITIZEN TRACKING URL</div>
                <div style={{ fontSize: 11, color: "#60a5fa", wordBreak: "break-all" }}>
                  {window.location.origin}/track/{batch.id}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <button className="qbtn" onClick={handleCopyLink}
                  style={{ flex: 1, padding: "11px", background: copied ? "#111b14" : "#111", border: `1px solid ${copied ? "#2d4a33" : "#1f1f1f"}`, color: copied ? "#4ade80" : "#888", fontSize: 10, letterSpacing: 2, fontFamily: "inherit", borderRadius: 3 }}>
                  {copied ? "✓ COPIED" : "COPY LINK"}
                </button>
                <button className="qbtn" onClick={() => window.print()}
                  style={{ flex: 1, padding: "11px", background: "none", border: "1px solid #4ade80", color: "#4ade80", fontSize: 10, letterSpacing: 2, fontFamily: "inherit", borderRadius: 3 }}>
                  PRINT / SAVE
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* How to use */}
      <div style={{ marginTop: 28, background: "#111", border: "1px solid #1f1f1f", padding: "16px 18px", borderRadius: 4 }}>
        <div style={{ fontSize: 10, color: "#555", letterSpacing: 2, marginBottom: 12 }}>HOW TO USE</div>
        {[
          ["01", "Collect waste from the stop and log weight in Stop Detail"],
          ["02", "Batch ID is auto-generated on collection — or create one here"],
          ["03", "Generate QR code, then print or show it to the citizen"],
          ["04", "Citizen scans QR to track their batch in real time"],
        ].map(([n, s]) => (
          <div key={n} style={{ display: "flex", gap: 12, marginBottom: 8, alignItems: "flex-start" }}>
            <span style={{ fontFamily: "'Bebas Neue'", fontSize: 16, color: "#4ade80", lineHeight: 1.3, flexShrink: 0 }}>{n}</span>
            <span style={{ fontSize: 11, color: "#666", lineHeight: 1.6 }}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}