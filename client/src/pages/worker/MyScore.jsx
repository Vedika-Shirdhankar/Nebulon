import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../hooks/useAuth";
 
const METRIC_INFO = {
  route_completion: { label: "Route Completion Rate", desc: "% of assigned stops completed", max: 100, unit: "%" },
  batches_scanned: { label: "Batches Scanned", desc: "QR batches generated and updated", max: null, unit: "" },
  citizen_rating:  { label: "Citizen Rating", desc: "Average star rating from pickups", max: 5, unit: "/ 5" },
  rejection_rate:  { label: "Clearance Rejection Rate", desc: "% of clearances rejected by citizens", max: 100, unit: "%", inverse: true },
  attendance:      { label: "Attendance Score", desc: "Days present vs assigned", max: 100, unit: "%" },
};
 
function scoreColor(score) {
  if (score >= 70) return "#4ade80";
  if (score >= 40) return "#facc15";
  return "#f87171";
}
 
function RingGauge({ score }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = scoreColor(score);
  return (
    <svg width={140} height={140} viewBox="0 0 140 140">
      <circle cx={70} cy={70} r={r} fill="none" stroke="#1f1f1f" strokeWidth={10} />
      <circle cx={70} cy={70} r={r} fill="none" stroke={color} strokeWidth={10}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 70 70)" style={{ transition: "stroke-dasharray 1s ease" }}
      />
      <text x={70} y={66} textAnchor="middle" fill={color} fontSize={28} fontFamily="'Bebas Neue', sans-serif" letterSpacing={2}>{score}</text>
      <text x={70} y={82} textAnchor="middle" fill="#555" fontSize={10} fontFamily="'DM Mono', monospace" letterSpacing={2}>/ 100</text>
    </svg>
  );
}
 
function MetricBar({ value, max, inverse, color }) {
  const pct = max ? Math.min((value / max) * 100, 100) : Math.min(value, 100);
  const barColor = inverse ? (pct > 30 ? "#f87171" : "#4ade80") : (pct >= 70 ? "#4ade80" : pct >= 40 ? "#facc15" : "#f87171");
  return (
    <div style={{ height: 4, background: "#1f1f1f", borderRadius: 2, overflow: "hidden", marginTop: 6 }}>
      <div style={{ height: "100%", width: `${pct}%`, background: barColor, borderRadius: 2, transition: "width 0.8s ease" }} />
    </div>
  );
}
 
export default function MyScore() {
  const { user } = useAuth();
  const [worker, setWorker] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => { if (user) fetchScore(); }, [user]);
 
  async function fetchScore() {
    setLoading(true);
    const { data } = await supabase
      .from("workers")
      .select("*, score_history(*)")
      .eq("user_id", user.id)
      .single();
    setWorker(data);
    const sorted = [...(data?.score_history || [])].sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at));
    setHistory(sorted.slice(0, 30));
    setLoading(false);
  }
 
  if (loading) return <div style={{ color: "#555", fontFamily: "'DM Mono'", textAlign: "center", padding: 60, letterSpacing: 2 }}>LOADING…</div>;
  if (!worker) return <div style={{ color: "#f87171", fontFamily: "'DM Mono'", textAlign: "center", padding: 60 }}>Worker profile not found.</div>;
 
  const score = worker.credibility_score ?? 0;
  const color = scoreColor(score);
  const projected = worker.projected_payout ?? null;
 
  const metrics = [
    { key: "route_completion", value: worker.route_completion_pct ?? 0 },
    { key: "citizen_rating",   value: worker.avg_citizen_rating ?? 0 },
    { key: "rejection_rate",   value: worker.clearance_rejection_pct ?? 0 },
    { key: "attendance",       value: worker.attendance_score ?? 0 },
  ];
 
  const improvements = metrics
    .filter(m => {
      const info = METRIC_INFO[m.key];
      if (info.inverse) return m.value > 30;
      const pct = info.max ? (m.value / info.max) * 100 : m.value;
      return pct < 70;
    })
    .map(m => METRIC_INFO[m.key].label);
 
  return (
    <div style={{ padding: "24px 20px", maxWidth: 600, margin: "0 auto", fontFamily: "'DM Mono', monospace" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Bebas+Neue&display=swap');`}</style>
 
      <div style={{ fontFamily: "'Bebas Neue'", fontSize: 32, letterSpacing: 4, color: "#e8e8e0", marginBottom: 4 }}>MY SCORE</div>
      <div style={{ fontSize: 11, color: "#555", letterSpacing: 2, marginBottom: 28 }}>UPDATED EVERY 24 HOURS</div>
 
      {/* Main score ring */}
      <div style={{ display: "flex", alignItems: "center", gap: 28, background: "#111", border: `1px solid ${color}22`, padding: "24px", borderRadius: 6, marginBottom: 24 }}>
        <RingGauge score={score} />
        <div>
          <div style={{ fontSize: 10, color: "#555", letterSpacing: 2, marginBottom: 6 }}>CREDIBILITY SCORE</div>
          <div style={{
            display: "inline-block", padding: "4px 12px", borderRadius: 20, fontSize: 11, letterSpacing: 2,
            background: score >= 70 ? "#111b14" : score >= 40 ? "#1f1a0a" : "#1f0f0f",
            color, border: `1px solid ${color}55`,
          }}>
            {score >= 70 ? "GOOD STANDING" : score >= 40 ? "NEEDS IMPROVEMENT" : "AT RISK"}
          </div>
 
          {projected !== null && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 10, color: "#555", letterSpacing: 2, marginBottom: 4 }}>PROJECTED PAYOUT</div>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: 26, color: "#60a5fa", letterSpacing: 2 }}>
                ₹{projected.toLocaleString("en-IN")}
              </div>
              <div style={{ fontSize: 10, color: "#555" }}>THIS MONTH</div>
            </div>
          )}
        </div>
      </div>
 
      {/* Metric breakdown */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 10, color: "#555", letterSpacing: 2, marginBottom: 14 }}>SCORE BREAKDOWN</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {metrics.map(m => {
            const info = METRIC_INFO[m.key];
            return (
              <div key={m.key} style={{ background: "#111", border: "1px solid #1f1f1f", padding: "14px 16px", borderRadius: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                  <span style={{ fontSize: 12, color: "#ccc" }}>{info.label}</span>
                  <span style={{ fontSize: 13, color: info.inverse && m.value > 30 ? "#f87171" : scoreColor(info.max ? (m.value / info.max) * 100 : m.value) }}>
                    {typeof m.value === "number" ? (Number.isInteger(m.value) ? m.value : m.value.toFixed(1)) : m.value}{info.unit}
                  </span>
                </div>
                <div style={{ fontSize: 10, color: "#444", marginBottom: 4 }}>{info.desc}</div>
                <MetricBar value={m.value} max={info.max} inverse={info.inverse} />
              </div>
            );
          })}
        </div>
      </div>
 
      {/* Improvement tips */}
      {improvements.length > 0 && (
        <div style={{ background: "#1f1a0a", border: "1px solid #4a3e10", padding: 16, borderRadius: 4, marginBottom: 24 }}>
          <div style={{ fontSize: 10, color: "#facc15", letterSpacing: 2, marginBottom: 10 }}>HOW TO IMPROVE</div>
          {improvements.map((tip, i) => (
            <div key={i} style={{ display: "flex", gap: 8, fontSize: 11, color: "#888", marginBottom: 6 }}>
              <span style={{ color: "#facc15" }}>→</span>
              <span>Improve your <strong style={{ color: "#ccc" }}>{tip}</strong></span>
            </div>
          ))}
        </div>
      )}
 
      {/* Score history */}
      {history.length > 1 && (
        <div>
          <div style={{ fontSize: 10, color: "#555", letterSpacing: 2, marginBottom: 14 }}>SCORE HISTORY (LAST 30 DAYS)</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 80 }}>
            {history.slice().reverse().map((h, i) => {
              const s = h.score ?? 0;
              const barH = Math.max(4, (s / 100) * 72);
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                  <div
                    title={`${new Date(h.recorded_at).toLocaleDateString("en-IN")}: ${s}`}
                    style={{ width: "100%", height: barH, background: scoreColor(s), borderRadius: 2, opacity: 0.8, transition: "height 0.6s ease" }}
                  />
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#444", marginTop: 4 }}>
            <span>30 DAYS AGO</span><span>TODAY</span>
          </div>
        </div>
      )}
 
      {/* Anomalies on this worker */}
      {worker.anomaly_count > 0 && (
        <div style={{ marginTop: 24, background: "#1f0f0f", border: "1px solid #4a2020", padding: 16, borderRadius: 4 }}>
          <div style={{ fontSize: 10, color: "#f87171", letterSpacing: 2, marginBottom: 8 }}>ACTIVE ANOMALY FLAGS</div>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 28, color: "#f87171" }}>{worker.anomaly_count}</div>
          <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>Contact your supervisor to resolve these flags. Each unresolved anomaly deducts from your score.</div>
        </div>
      )}
    </div>
  );
}