import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const STATUS_META = {
  Assigned:   { color: "#eab308", bg: "#1a1608", border: "#3d3512" },
  "En Route": { color: "#3b82f6", bg: "#0d1b2a", border: "#1e3a5f" },
  Reached:    { color: "#8b5cf6", bg: "#140f2e", border: "#3d2d6b" },
  Cleared:    { color: "#22c55e", bg: "#0f1f14", border: "#1f3d2a" },
  Rejected:   { color: "#ef4444", bg: "#1a0f0f", border: "#3d1f1f" },
};

const SEVERITY_COLOR = {
  low: "#22c55e",
  medium: "#eab308",
  high: "#ef4444",
};

export default function ComplaintAssigned() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("active");

  useEffect(() => {
    fetchComplaints();
  }, [filter]);

  async function fetchComplaints() {
    setLoading(true);
    await new Promise(res => setTimeout(res, 500));

    const data = [
      { id: "cmp001", description: "Garbage not collected since 2 days", address: "Andheri West", status: "Assigned", severity: "high" },
      { id: "cmp002", description: "Overflowing dustbin near road", address: "Bandra East", status: "En Route", severity: "medium" },
      { id: "cmp003", description: "Illegal dumping spotted", address: "Juhu Beach", status: "Reached", severity: "high" },
      { id: "cmp004", description: "Garbage cleared successfully", address: "Powai", status: "Cleared", severity: "low" },
      { id: "cmp005", description: "Wrong complaint reported", address: "Ghatkopar", status: "Rejected", severity: "low", rejection_reason: "Invalid issue" },
    ];

    let filtered = data;

    if (filter === "active") {
      filtered = data.filter(c => ["Assigned", "En Route", "Reached"].includes(c.status));
    }
    if (filter === "cleared") {
      filtered = data.filter(c => c.status === "Cleared");
    }
    if (filter === "rejected") {
      filtered = data.filter(c => c.status === "Rejected");
    }

    setComplaints(filtered);
    setLoading(false);
  }

  const activeCount = complaints.filter(c =>
    ["Assigned", "En Route", "Reached"].includes(c.status)
  ).length;

  return (
    <div style={{ padding: 20, maxWidth: 700, margin: "auto", color: "#fff" }}>

      {/* HEADER */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ marginBottom: 4 }}>My Complaints</h2>
        <div style={{ fontSize: 12, color: "#888" }}>
          {activeCount} active cases
        </div>
      </div>

      {/* FILTER TABS */}
      <div style={{
        display: "flex",
        gap: 10,
        marginBottom: 20,
        background: "#111",
        padding: 6,
        borderRadius: 10,
        border: "1px solid #222"
      }}>
        {["active", "cleared", "rejected", "all"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              flex: 1,
              padding: "8px 0",
              borderRadius: 8,
              border: "none",
              background: filter === f ? "#222" : "transparent",
              color: filter === f ? "#fff" : "#666",
              cursor: "pointer",
              fontSize: 12
            }}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* LOADING */}
      {loading && (
        <div style={{ textAlign: "center", padding: 40, color: "#666" }}>
          Loading complaints...
        </div>
      )}

      {/* EMPTY */}
      {!loading && complaints.length === 0 && (
        <div style={{ textAlign: "center", color: "#666" }}>
          No complaints found
        </div>
      )}

      {/* LIST */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {complaints.map(c => {
          const meta = STATUS_META[c.status];

          return (
            <Link
              key={c.id}
              to="#"
              style={{
                background: "#111",
                border: "1px solid #222",
                borderRadius: 12,
                padding: 14,
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}
            >
              {/* TOP ROW */}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: "#666" }}>
                  #{c.id.toUpperCase()}
                </span>

                <div style={{ display: "flex", gap: 8 }}>
                  {/* Severity */}
                  <span style={{
                    fontSize: 10,
                    color: SEVERITY_COLOR[c.severity],
                    border: `1px solid ${SEVERITY_COLOR[c.severity]}`,
                    padding: "2px 8px",
                    borderRadius: 20
                  }}>
                    {c.severity.toUpperCase()}
                  </span>

                  {/* Status */}
                  <span style={{
                    fontSize: 10,
                    color: meta.color,
                    border: `1px solid ${meta.border}`,
                    background: meta.bg,
                    padding: "2px 8px",
                    borderRadius: 20
                  }}>
                    {c.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* DESCRIPTION */}
              <div style={{ fontSize: 14, marginBottom: 4 }}>
                {c.description}
              </div>

              {/* ADDRESS */}
              <div style={{ fontSize: 12, color: "#888" }}>
                {c.address}
              </div>

              {/* REJECTED REASON */}
              {c.status === "Rejected" && (
                <div style={{ marginTop: 6, color: "#ef4444", fontSize: 12 }}>
                  {c.rejection_reason}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}