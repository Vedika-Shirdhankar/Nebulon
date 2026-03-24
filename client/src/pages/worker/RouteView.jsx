import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const STATUS_META = {
  Collected: { color: "#22c55e", bg: "#0f1f14", border: "#1f3d2a", label: "COLLECTED" },
  Skipped:   { color: "#ef4444", bg: "#1a0f0f", border: "#3d1f1f", label: "SKIPPED" },
  Arrived:   { color: "#eab308", bg: "#1a1608", border: "#3d3512", label: "ARRIVED" },
  Pending:   { color: "#888", bg: "#111", border: "#222", label: "PENDING" },
};

export default function RouteView() {
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    fetchRoute();
  }, [date]);

  async function fetchRoute() {
    setLoading(true);
    await new Promise(res => setTimeout(res, 600));

    const fakeStops = [
      { id: "1", stop_order: 1, address: "Andheri West", waste_type: "Dry", time_window: "9:00 - 10:00", status: "Collected", kg_collected: 12 },
      { id: "2", stop_order: 2, address: "Bandra East", waste_type: "Wet", time_window: "10:30 - 11:30", status: "Pending" },
      { id: "3", stop_order: 3, address: "Juhu Beach", waste_type: "Mixed", time_window: "12:00 - 1:00", status: "Skipped", skip_reason: "House locked" },
      { id: "4", stop_order: 4, address: "Powai Lake", waste_type: "Dry", time_window: "2:00 - 3:00", status: "Arrived" },
      { id: "5", stop_order: 5, address: "Ghatkopar", waste_type: "Wet", time_window: "3:30 - 4:30", status: "Pending" },
    ];

    setStops(fakeStops.sort((a, b) => a.stop_order - b.stop_order));
    setLoading(false);
  }

  const collected = stops.filter(s => s.status === "Collected").length;
  const pct = stops.length ? Math.round((collected / stops.length) * 100) : 0;

  return (
    <div style={{ padding: 20, maxWidth: 700, margin: "auto", color: "#fff" }}>

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 25 }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: "bold" }}>My Route</div>
          <div style={{ fontSize: 12, color: "#888" }}>
            {collected} / {stops.length} completed
          </div>
        </div>

        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          style={{
            background: "#111",
            border: "1px solid #222",
            color: "#aaa",
            padding: "6px 10px",
            borderRadius: 6
          }}
        />
      </div>

      {/* PROGRESS CARD */}
      <div style={{
        background: "#111",
        border: "1px solid #222",
        borderRadius: 12,
        padding: 16,
        marginBottom: 20
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#888" }}>
          <span>Progress</span>
          <span>{pct}%</span>
        </div>

        <div style={{
          height: 6,
          background: "#222",
          borderRadius: 4,
          marginTop: 6,
          overflow: "hidden"
        }}>
          <div style={{
            width: `${pct}%`,
            height: "100%",
            background: "#22c55e",
            transition: "width 0.6s ease"
          }} />
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div style={{ textAlign: "center", padding: 40, color: "#666" }}>
          Loading route...
        </div>
      )}

      {/* STOPS */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {stops.map((stop, idx) => {
          const meta = STATUS_META[stop.status];

          return (
            <Link
              key={stop.id}
              to={`/worker/route/${stop.id}`}
              style={{
                display: "flex",
                alignItems: "center",
                background: "#111",
                border: "1px solid #222",
                borderRadius: 12,
                padding: 14,
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}
            >
              {/* NUMBER */}
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: meta.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: meta.color,
                fontWeight: "bold"
              }}>
                {idx + 1}
              </div>

              {/* INFO */}
              <div style={{ flex: 1, marginLeft: 14 }}>
                <div style={{ fontSize: 14 }}>{stop.address}</div>
                <div style={{ fontSize: 11, color: "#888" }}>
                  {stop.waste_type} • {stop.time_window}
                </div>

                {stop.kg_collected > 0 && (
                  <div style={{ color: "#22c55e", fontSize: 11 }}>
                    {stop.kg_collected} kg collected
                  </div>
                )}

                {stop.skip_reason && (
                  <div style={{ color: "#ef4444", fontSize: 11 }}>
                    {stop.skip_reason}
                  </div>
                )}
              </div>

              {/* STATUS BADGE */}
              <div style={{
                fontSize: 10,
                padding: "4px 10px",
                borderRadius: 20,
                border: `1px solid ${meta.border}`,
                color: meta.color,
                background: meta.bg
              }}>
                {meta.label}
              </div>
            </Link>
          );
        })}
      </div>

      {/* SUMMARY */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 10,
        marginTop: 20
      }}>
        {[
          { l: "Collected", v: collected, c: "#22c55e" },
          { l: "Pending", v: stops.filter(s => s.status === "Pending").length, c: "#eab308" },
          { l: "Skipped", v: stops.filter(s => s.status === "Skipped").length, c: "#ef4444" },
        ].map(x => (
          <div key={x.l} style={{
            background: "#111",
            border: "1px solid #222",
            padding: 12,
            borderRadius: 10,
            textAlign: "center"
          }}>
            <div style={{ fontSize: 20, color: x.c }}>{x.v}</div>
            <div style={{ fontSize: 11, color: "#888" }}>{x.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}