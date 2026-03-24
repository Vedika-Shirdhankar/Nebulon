import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../hooks/useAuth";
 
const STATUS_META = {
  Assigned:   { color: "#facc15", bg: "#1f1a0a", border: "#4a3e10" },
  "En Route": { color: "#60a5fa", bg: "#0e1826", border: "#1e3a5f" },
  Reached:    { color: "#a78bfa", bg: "#130e26", border: "#3d2d6b" },
  Cleared:    { color: "#4ade80", bg: "#111b14", border: "#2d4a33" },
  Rejected:   { color: "#f87171", bg: "#1f0f0f", border: "#4a2020" },
};
 
const SEVERITY_COLOR = { low: "#4ade80", medium: "#facc15", high: "#f87171" };
 
export default function ComplaintAssigned() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("active");
 
  useEffect(() => { if (user) fetchComplaints(); }, [user, filter]);
 
  async function fetchComplaints() {
    setLoading(true);
    let query = supabase
      .from("complaints")
      .select("*")
      .eq("assigned_worker_id", user.id)
      .order("reported_at", { ascending: false });
 
    if (filter === "active") query = query.in("status", ["Assigned", "En Route", "Reached"]);
    if (filter === "cleared") query = query.eq("status", "Cleared");
    if (filter === "rejected") query = query.eq("status", "Rejected");
 
    const { data } = await query;
    setComplaints(data || []);
    setLoading(false);
  }
 
  const activeCount = complaints.filter(c => ["Assigned","En Route","Reached"].includes(c.status)).length;
 
  return (
    <div style={{ padding: "24px 20px", maxWidth: 680, margin: "0 auto", fontFamily: "'DM Mono', monospace" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Bebas+Neue&display=swap');`}</style>
 
      <div style={{ fontFamily: "'Bebas Neue'", fontSize: 32, letterSpacing: 4, color: "#e8e8e0", marginBottom: 4 }}>MY COMPLAINTS</div>
      {activeCount > 0 && (
        <div style={{ display: "inline-block", background: "#1f1a0a", border: "1px solid #4a3e10", color: "#facc15", fontSize: 10, letterSpacing: 2, padding: "3px 10px", borderRadius: 20, marginBottom: 20 }}>
          {activeCount} REQUIRE ACTION
        </div>
      )}
 
      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, borderBottom: "1px solid #1f1f1f", paddingBottom: 16 }}>
        {["active", "cleared", "rejected", "all"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{ padding: "7px 14px", background: filter === f ? "#1f1f1f" : "none", border: filter === f ? "1px solid #333" : "1px solid transparent", color: filter === f ? "#e8e8e0" : "#555", fontSize: 10, letterSpacing: 2, fontFamily: "inherit", cursor: "pointer", borderRadius: 3 }}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>
 
      {loading && <div style={{ color: "#555", textAlign: "center", padding: 40, letterSpacing: 2, fontSize: 12 }}>LOADING…</div>}
 
      {!loading && complaints.length === 0 && (
        <div style={{ color: "#333", textAlign: "center", padding: 60, letterSpacing: 2, fontSize: 13 }}>
          NO COMPLAINTS IN THIS VIEW
        </div>
      )}
 
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {complaints.map(c => {
          const meta = STATUS_META[c.status] || STATUS_META.Assigned;
          return (
            <Link
              key={c.id}
              to={`/worker/complaints/${c.id}`}
              style={{ display: "block", background: meta.bg, border: `1px solid ${meta.border}`, borderRadius: 4, padding: "16px 18px", textDecoration: "none" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div style={{ fontSize: 11, color: "#555", letterSpacing: 1 }}>#{c.id.slice(-8).toUpperCase()}</div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {c.severity && (
                    <span style={{ fontSize: 9, color: SEVERITY_COLOR[c.severity] || "#888", letterSpacing: 2, border: `1px solid ${SEVERITY_COLOR[c.severity] || "#555"}`, padding: "2px 7px", borderRadius: 10 }}>
                      {c.severity.toUpperCase()}
                    </span>
                  )}
                  <span style={{ fontSize: 10, color: meta.color, letterSpacing: 2 }}>{c.status.toUpperCase()}</span>
                </div>
              </div>
 
              <div style={{ fontSize: 13, color: "#e8e8e0", marginBottom: 4 }}>{c.description?.slice(0, 80) || "No description"}…</div>
              <div style={{ fontSize: 11, color: "#666" }}>{c.address}</div>
 
              {c.photo_url && (
                <div style={{ marginTop: 10, fontSize: 10, color: "#555", letterSpacing: 1 }}>📷 PHOTO ATTACHED</div>
              )}
 
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 10, color: "#444" }}>
                <span>{c.waste_type || "UNCLASSIFIED"}</span>
                <span>{new Date(c.reported_at).toLocaleDateString("en-IN")}</span>
              </div>
 
              {c.status === "Rejected" && c.rejection_reason && (
                <div style={{ marginTop: 8, fontSize: 11, color: "#f87171", borderTop: "1px solid #4a2020", paddingTop: 8 }}>
                  Rejected: {c.rejection_reason}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
 