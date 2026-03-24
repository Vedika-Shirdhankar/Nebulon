import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../hooks/useAuth";
 
const STATUS_COLOR = {
  Collected: "#4ade80",
  Skipped: "#f87171",
  Arrived: "#facc15",
  Pending: "#555",
};
 
export default function WorkerHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, collected: 0, skipped: 0, pending: 0, kgToday: 0 });
  const [nextStop, setNextStop] = useState(null);
  const [complaints, setComplaints] = useState(0);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);
 
  async function fetchData() {
    setLoading(true);
    const today = new Date().toISOString().split("T")[0];
 
    const { data: routes } = await supabase
      .from("routes")
      .select("*, stops(*)")
      .eq("worker_id", user.id)
      .eq("date", today)
      .single();
 
    if (routes?.stops) {
      const stops = routes.stops;
      const collected = stops.filter(s => s.status === "Collected").length;
      const skipped = stops.filter(s => s.status === "Skipped").length;
      const pending = stops.filter(s => s.status === "Pending").length;
      const kgToday = stops.reduce((sum, s) => sum + (s.kg_collected || 0), 0);
      setStats({ total: stops.length, collected, skipped, pending, kgToday });
      const next = stops.find(s => s.status === "Pending");
      setNextStop(next || null);
    }
 
    const { count } = await supabase
      .from("complaints")
      .select("id", { count: "exact", head: true })
      .eq("assigned_worker_id", user.id)
      .eq("status", "Assigned");
    setComplaints(count || 0);
 
    const { data: worker } = await supabase
      .from("workers")
      .select("credibility_score")
      .eq("user_id", user.id)
      .single();
    setScore(worker?.credibility_score ?? null);
 
    setLoading(false);
  }
 
  const pct = stats.total > 0 ? Math.round((stats.collected / stats.total) * 100) : 0;
 
  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "#555", fontFamily: "'DM Mono', monospace", letterSpacing: 2, fontSize: 13 }}>
      LOADING…
    </div>
  );
 
  return (
    <div style={{ padding: "24px 20px", maxWidth: 680, margin: "0 auto" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Bebas+Neue&display=swap');`}</style>
 
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: 36, letterSpacing: 4, color: "#e8e8e0" }}>TODAY'S SHIFT</div>
        <div style={{ fontSize: 11, color: "#555", letterSpacing: 2 }}>{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" }).toUpperCase()}</div>
      </div>
 
      {/* Progress bar */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 11, color: "#555", letterSpacing: 1 }}>
          <span>ROUTE PROGRESS</span>
          <span style={{ color: pct === 100 ? "#4ade80" : "#e8e8e0" }}>{pct}%</span>
        </div>
        <div style={{ height: 6, background: "#1f1f1f", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? "#4ade80" : "#facc15", transition: "width 0.6s ease", borderRadius: 3 }} />
        </div>
      </div>
 
      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
        {[
          { label: "STOPS DONE", value: stats.collected, color: "#4ade80" },
          { label: "PENDING", value: stats.pending, color: "#facc15" },
          { label: "SKIPPED", value: stats.skipped, color: "#f87171" },
          { label: "KG COLLECTED", value: `${stats.kgToday} kg`, color: "#60a5fa" },
        ].map(s => (
          <div key={s.label} style={{ background: "#111", border: "1px solid #1f1f1f", padding: "16px", borderRadius: 4 }}>
            <div style={{ fontSize: 10, color: "#555", letterSpacing: 2, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 32, color: s.color, letterSpacing: 2 }}>{s.value}</div>
          </div>
        ))}
      </div>
 
      {/* Next stop */}
      {nextStop && (
        <div style={{ background: "#111b14", border: "1px solid #2d4a33", padding: 20, borderRadius: 4, marginBottom: 20 }}>
          <div style={{ fontSize: 10, color: "#4ade80", letterSpacing: 3, marginBottom: 8 }}>NEXT STOP</div>
          <div style={{ fontSize: 16, color: "#e8e8e0", marginBottom: 4 }}>{nextStop.address}</div>
          <div style={{ fontSize: 12, color: "#888" }}>{nextStop.waste_type} · {nextStop.time_window}</div>
          <Link to={`/worker/route/${nextStop.id}`} style={{ display: "inline-block", marginTop: 14, padding: "10px 20px", background: "#4ade80", color: "#000", fontSize: 12, fontFamily: "'DM Mono'", letterSpacing: 2, textDecoration: "none", borderRadius: 3, fontWeight: 500 }}>
            GO TO STOP →
          </Link>
        </div>
      )}
 
      {!nextStop && stats.total > 0 && (
        <div style={{ background: "#111b14", border: "1px solid #2d4a33", padding: 20, borderRadius: 4, marginBottom: 20, textAlign: "center" }}>
          <div style={{ fontSize: 22, marginBottom: 6 }}>✓</div>
          <div style={{ fontSize: 13, color: "#4ade80", letterSpacing: 2 }}>ALL STOPS COMPLETE</div>
        </div>
      )}
 
      {/* Complaint alert */}
      {complaints > 0 && (
        <Link to="/worker/complaints" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#1f1208", border: "1px solid #4a3020", padding: "16px 20px", borderRadius: 4, marginBottom: 20, textDecoration: "none" }}>
          <div>
            <div style={{ fontSize: 10, color: "#fb923c", letterSpacing: 2, marginBottom: 4 }}>COMPLAINTS ASSIGNED</div>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 28, color: "#fb923c" }}>{complaints} PENDING</div>
          </div>
          <div style={{ fontSize: 24 }}>→</div>
        </Link>
      )}
 
      {/* Score */}
      {score !== null && (
        <Link to="/worker/score" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#111", border: "1px solid #1f1f1f", padding: "16px 20px", borderRadius: 4, textDecoration: "none" }}>
          <div>
            <div style={{ fontSize: 10, color: "#555", letterSpacing: 2, marginBottom: 4 }}>MY CREDIBILITY SCORE</div>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 28, color: score >= 70 ? "#4ade80" : score >= 40 ? "#facc15" : "#f87171", letterSpacing: 2 }}>
              {score} / 100
            </div>
          </div>
          <div style={{ fontSize: 12, color: "#555" }}>VIEW DETAILS →</div>
        </Link>
      )}
    </div>
  );
}