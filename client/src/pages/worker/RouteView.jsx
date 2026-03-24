import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../hooks/useAuth";
 
const STATUS_META = {
  Collected: { color: "#4ade80", bg: "#111b14", border: "#2d4a33", label: "COLLECTED" },
  Skipped:   { color: "#f87171", bg: "#1f0f0f", border: "#4a2020", label: "SKIPPED" },
  Arrived:   { color: "#facc15", bg: "#1f1a0a", border: "#4a3e10", label: "ARRIVED" },
  Pending:   { color: "#555",    bg: "#111",    border: "#1f1f1f", label: "PENDING" },
};
 
export default function RouteView() {
  const { user } = useAuth();
  const [stops, setStops] = useState([]);
  const [routeId, setRouteId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
 
  useEffect(() => { if (user) fetchRoute(); }, [user, date]);
 
  async function fetchRoute() {
    setLoading(true);
    const { data: route } = await supabase
      .from("routes")
      .select("id, date, stops(*)")
      .eq("worker_id", user.id)
      .eq("date", date)
      .single();
 
    if (route) {
      setRouteId(route.id);
      const sorted = [...(route.stops || [])].sort((a, b) => a.stop_order - b.stop_order);
      setStops(sorted);
    } else {
      setStops([]);
      setRouteId(null);
    }
    setLoading(false);
  }
 
  const collected = stops.filter(s => s.status === "Collected").length;
  const pct = stops.length > 0 ? Math.round((collected / stops.length) * 100) : 0;
 
  return (
    <div style={{ padding: "24px 20px", maxWidth: 680, margin: "0 auto", fontFamily: "'DM Mono', monospace" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Bebas+Neue&display=swap');`}</style>
 
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 32, letterSpacing: 4, color: "#e8e8e0" }}>MY ROUTE</div>
          <div style={{ fontSize: 11, color: "#555", letterSpacing: 2 }}>{stops.length} STOPS · {collected} DONE</div>
        </div>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          style={{ background: "#111", border: "1px solid #1f1f1f", color: "#888", padding: "6px 10px", fontSize: 11, fontFamily: "'DM Mono'", borderRadius: 3, cursor: "pointer" }}
        />
      </div>
 
      {/* Progress */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#555", letterSpacing: 1, marginBottom: 5 }}>
          <span>COMPLETION</span><span>{pct}%</span>
        </div>
        <div style={{ height: 4, background: "#1f1f1f", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: "#4ade80", borderRadius: 2, transition: "width 0.5s" }} />
        </div>
      </div>
 
      {loading && <div style={{ color: "#555", fontSize: 12, letterSpacing: 2, textAlign: "center", padding: 40 }}>LOADING ROUTE…</div>}
 
      {!loading && stops.length === 0 && (
        <div style={{ textAlign: "center", padding: 60, color: "#333", fontSize: 13, letterSpacing: 2 }}>
          NO ROUTE ASSIGNED FOR THIS DATE
        </div>
      )}
 
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {stops.map((stop, idx) => {
          const meta = STATUS_META[stop.status] || STATUS_META.Pending;
          return (
            <Link
              key={stop.id}
              to={`/worker/route/${stop.id}`}
              style={{ display: "flex", alignItems: "stretch", background: meta.bg, border: `1px solid ${meta.border}`, borderRadius: 4, textDecoration: "none", overflow: "hidden", transition: "opacity 0.15s" }}
            >
              {/* Stop number */}
              <div style={{ width: 48, display: "flex", alignItems: "center", justifyContent: "center", borderRight: `1px solid ${meta.border}`, flexShrink: 0 }}>
                <span style={{ fontFamily: "'Bebas Neue'", fontSize: 20, color: meta.color, letterSpacing: 1 }}>{idx + 1}</span>
              </div>
 
              {/* Content */}
              <div style={{ flex: 1, padding: "14px 16px" }}>
                <div style={{ fontSize: 13, color: "#e8e8e0", marginBottom: 4 }}>{stop.address}</div>
                <div style={{ display: "flex", gap: 16, fontSize: 11, color: "#666" }}>
                  <span>{stop.waste_type || "MIXED"}</span>
                  <span>{stop.time_window || "—"}</span>
                  {stop.kg_collected > 0 && <span style={{ color: "#4ade80" }}>{stop.kg_collected} kg</span>}
                </div>
                {stop.skip_reason && (
                  <div style={{ fontSize: 11, color: "#f87171", marginTop: 4 }}>Reason: {stop.skip_reason}</div>
                )}
              </div>
 
              {/* Status badge */}
              <div style={{ padding: "14px 16px", display: "flex", alignItems: "center" }}>
                <span style={{ fontSize: 10, color: meta.color, letterSpacing: 2, whiteSpace: "nowrap" }}>{meta.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
 
      {/* Summary row */}
      {stops.length > 0 && (
        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          {[
            { l: "COLLECTED", v: stops.filter(s=>s.status==="Collected").length, c: "#4ade80" },
            { l: "PENDING",   v: stops.filter(s=>s.status==="Pending").length,   c: "#facc15" },
            { l: "SKIPPED",   v: stops.filter(s=>s.status==="Skipped").length,   c: "#f87171" },
          ].map(x => (
            <div key={x.l} style={{ flex: 1, background: "#111", border: "1px solid #1f1f1f", padding: "10px", borderRadius: 3, textAlign: "center" }}>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: 22, color: x.c }}>{x.v}</div>
              <div style={{ fontSize: 9, color: "#555", letterSpacing: 2 }}>{x.l}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}