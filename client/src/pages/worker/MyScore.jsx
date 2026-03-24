import { useEffect, useState } from "react";

const METRIC_INFO = {
  route_completion: { label: "Route Completion", max: 100, unit: "%" },
  citizen_rating: { label: "Citizen Rating", max: 5, unit: "/5" },
  rejection_rate: { label: "Rejection Rate", max: 100, unit: "%", inverse: true },
  attendance: { label: "Attendance", max: 100, unit: "%" },
};

function scoreColor(score) {
  if (score >= 70) return "#22c55e";
  if (score >= 40) return "#eab308";
  return "#ef4444";
}

function RingGauge({ score }) {
  const r = 50;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = scoreColor(score);

  return (
    <svg width={130} height={130}>
      <circle cx={65} cy={65} r={r} fill="none" stroke="#1f1f1f" strokeWidth={8} />
      <circle
        cx={65}
        cy={65}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={8}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 65 65)"
        style={{ transition: "all 0.8s ease" }}
      />
      <text x={65} y={65} textAnchor="middle" dy="6" fill={color} fontSize={26} fontWeight="bold">
        {score}
      </text>
    </svg>
  );
}

export default function MyScore() {
  const [worker, setWorker] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setWorker({
        credibility_score: 72,
        projected_payout: 18500,
        route_completion_pct: 82,
        avg_citizen_rating: 4.2,
        clearance_rejection_pct: 12,
        attendance_score: 90,
        anomaly_count: 1,
      });

      setHistory(
        Array.from({ length: 30 }, () => ({
          score: Math.floor(50 + Math.random() * 40),
        }))
      );

      setLoading(false);
    }, 600);
  }, []);

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: 60, color: "#888" }}>
        Loading Dashboard...
      </div>
    );

  const score = worker.credibility_score;

  const metrics = [
    { key: "route_completion", value: worker.route_completion_pct },
    { key: "citizen_rating", value: worker.avg_citizen_rating },
    { key: "rejection_rate", value: worker.clearance_rejection_pct },
    { key: "attendance", value: worker.attendance_score },
  ];

  return (
    <div style={{ padding: 20, maxWidth: 700, margin: "auto", color: "#fff" }}>
      
      {/* Header */}
      <h2 style={{ marginBottom: 20 }}>My Performance</h2>

      {/* Score Card */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 20,
        background: "#111",
        padding: 20,
        borderRadius: 12,
        border: "1px solid #222",
        marginBottom: 20
      }}>
        <RingGauge score={score} />

        <div>
          <div style={{ fontSize: 14, color: "#888" }}>Credibility Score</div>
          <div style={{ fontSize: 28, fontWeight: "bold", color: scoreColor(score) }}>
            {score} / 100
          </div>

          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 12, color: "#888" }}>Projected Earnings</div>
            <div style={{ fontSize: 22, color: "#60a5fa" }}>
              ₹{worker.projected_payout.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 12,
        marginBottom: 20
      }}>
        {metrics.map((m) => {
          const info = METRIC_INFO[m.key];
          const pct = info.max ? (m.value / info.max) * 100 : m.value;

          return (
            <div key={m.key} style={{
              background: "#111",
              padding: 14,
              borderRadius: 10,
              border: "1px solid #222"
            }}>
              <div style={{ fontSize: 12, color: "#888" }}>{info.label}</div>
              <div style={{ fontSize: 18, fontWeight: "bold" }}>
                {m.value}{info.unit}
              </div>

              {/* Progress bar */}
              <div style={{
                height: 5,
                background: "#222",
                borderRadius: 3,
                marginTop: 6
              }}>
                <div style={{
                  width: `${pct}%`,
                  height: "100%",
                  background: scoreColor(pct),
                  borderRadius: 3,
                  transition: "width 0.6s ease"
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* History */}
      <div style={{
        background: "#111",
        padding: 16,
        borderRadius: 12,
        border: "1px solid #222",
        marginBottom: 20
      }}>
        <div style={{ marginBottom: 10, color: "#888" }}>Last 30 Days</div>

        <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 80 }}>
          {history.map((h, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${h.score}%`,
                background: scoreColor(h.score),
                borderRadius: 2,
                opacity: 0.8
              }}
            />
          ))}
        </div>
      </div>

      {/* Warning */}
      {worker.anomaly_count > 0 && (
        <div style={{
          background: "#1a0f0f",
          border: "1px solid #7f1d1d",
          padding: 14,
          borderRadius: 10,
          color: "#ef4444"
        }}>
          ⚠ {worker.anomaly_count} issue(s) detected. Resolve to improve score.
        </div>
      )}
    </div>
  );
}