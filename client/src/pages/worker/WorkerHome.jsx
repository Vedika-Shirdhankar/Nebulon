import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const STATUS_COLOR = {
  Collected: "#4ade80",
  Skipped: "#f87171",
  Arrived: "#facc15",
  Pending: "#555",
};

export default function WorkerHome() {
  const [stats, setStats] = useState({
    total: 0,
    collected: 0,
    skipped: 0,
    pending: 0,
    kgToday: 0,
  });
  const [nextStop, setNextStop] = useState(null);
  const [complaints, setComplaints] = useState(0);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);

    // simulate delay
    await new Promise((res) => setTimeout(res, 800));

    // 🔥 FAKE DATA
    const stops = [
      {
        id: "1",
        address: "Andheri West, Mumbai",
        waste_type: "Dry Waste",
        time_window: "9:00 AM - 10:00 AM",
        status: "Collected",
        kg_collected: 12,
      },
      {
        id: "2",
        address: "Bandra East, Mumbai",
        waste_type: "Wet Waste",
        time_window: "10:30 AM - 11:30 AM",
        status: "Pending",
        kg_collected: 0,
      },
      {
        id: "3",
        address: "Juhu Beach Road",
        waste_type: "Mixed Waste",
        time_window: "12:00 PM - 1:00 PM",
        status: "Skipped",
        kg_collected: 0,
      },
      {
        id: "4",
        address: "Powai Lake Area",
        waste_type: "Dry Waste",
        time_window: "2:00 PM - 3:00 PM",
        status: "Collected",
        kg_collected: 18,
      },
    ];

    const collected = stops.filter((s) => s.status === "Collected").length;
    const skipped = stops.filter((s) => s.status === "Skipped").length;
    const pending = stops.filter((s) => s.status === "Pending").length;
    const kgToday = stops.reduce(
      (sum, s) => sum + (s.kg_collected || 0),
      0
    );

    setStats({
      total: stops.length,
      collected,
      skipped,
      pending,
      kgToday,
    });

    const next = stops.find((s) => s.status === "Pending");
    setNextStop(next || null);

    setComplaints(2);
    setScore(76);

    setLoading(false);
  }

  // ✅ FIXED pct
  const pct =
    stats.total > 0
      ? Math.round((stats.collected / stats.total) * 100)
      : 0;

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "60vh",
          color: "#555",
          fontFamily: "'DM Mono', monospace",
          letterSpacing: 2,
          fontSize: 13,
        }}
      >
        LOADING…
      </div>
    );

  return (
    <div style={{ padding: "24px 20px", maxWidth: 680, margin: "0 auto" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Bebas+Neue&display=swap');`}</style>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            fontFamily: "'Bebas Neue'",
            fontSize: 36,
            letterSpacing: 4,
            color: "#e8e8e0",
          }}
        >
          TODAY'S SHIFT
        </div>
        <div
          style={{
            fontSize: 11,
            color: "#555",
            letterSpacing: 2,
          }}
        >
          {new Date()
            .toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })
            .toUpperCase()}
        </div>
      </div>

      {/* Progress */}
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 6,
            fontSize: 11,
            color: "#555",
          }}
        >
          <span>ROUTE PROGRESS</span>
          <span style={{ color: pct === 100 ? "#4ade80" : "#e8e8e0" }}>
            {pct}%
          </span>
        </div>
        <div
          style={{
            height: 6,
            background: "#1f1f1f",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              background: pct === 100 ? "#4ade80" : "#facc15",
              transition: "width 0.6s ease",
            }}
          />
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginBottom: 24,
        }}
      >
        {[
          { label: "STOPS DONE", value: stats.collected, color: "#4ade80" },
          { label: "PENDING", value: stats.pending, color: "#facc15" },
          { label: "SKIPPED", value: stats.skipped, color: "#f87171" },
          {
            label: "KG COLLECTED",
            value: `${stats.kgToday} kg`,
            color: "#60a5fa",
          },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: "#111",
              border: "1px solid #1f1f1f",
              padding: "16px",
              borderRadius: 4,
            }}
          >
            <div style={{ fontSize: 10, color: "#555" }}>{s.label}</div>
            <div
              style={{
                fontFamily: "'Bebas Neue'",
                fontSize: 32,
                color: s.color,
              }}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Next Stop */}
      {nextStop && (
        <div
          style={{
            background: "#111b14",
            border: "1px solid #2d4a33",
            padding: 20,
            borderRadius: 4,
            marginBottom: 20,
          }}
        >
          <div style={{ color: "#4ade80", fontSize: 10 }}>
            NEXT STOP
          </div>
          <div style={{ fontSize: 16, color: "#e8e8e0" }}>
            {nextStop.address}
          </div>
          <div style={{ fontSize: 12, color: "#888" }}>
            {nextStop.waste_type} · {nextStop.time_window}
          </div>

          <Link to={`/worker/route/${nextStop.id}`}>
            GO TO STOP →
          </Link>
        </div>
      )}

      {/* Complaints */}
      {complaints > 0 && (
        <div style={{ marginBottom: 20 }}>
          {complaints} complaints pending
        </div>
      )}

      {/* Score */}
      {score !== null && (
        <div>
          Score: {score}/100
        </div>
      )}
    </div>
  );
}