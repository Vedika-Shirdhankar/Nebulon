import { useState } from "react";
import {
  Building2, Star, MapPin, TrendingUp, TrendingDown,
  AlertTriangle, ChevronRight, Search, Filter, Shield,
  Users, Truck, CheckCircle, Clock, XCircle, Plus
} from "lucide-react";

const CONTRACTORS = [
  {
    id: "CON-001", name: "GreenHaul Pvt Ltd", zone: "Maharashtra",
    districts: ["Mumbai", "Thane", "Pune"], score: 87,
    workers: 24, trucks: 8, activeContracts: 3,
    completionRate: 94, avgClearTime: "3.2h", citizenRating: 4.3,
    anomalies: 2, status: "ACTIVE", trend: "up",
    unresolved: 1, joinedDate: "Jan 2023",
  },
  {
    id: "CON-002", name: "EcoTrack Ltd", zone: "Maharashtra",
    districts: ["Nashik", "Aurangabad"], score: 72,
    workers: 15, trucks: 5, activeContracts: 2,
    completionRate: 81, avgClearTime: "5.1h", citizenRating: 3.8,
    anomalies: 4, status: "ACTIVE", trend: "down",
    unresolved: 3, joinedDate: "Mar 2023",
  },
  {
    id: "CON-003", name: "Capital Waste Co.", zone: "Delhi",
    districts: ["Central Delhi", "West Delhi", "North Delhi"], score: 91,
    workers: 31, trucks: 11, activeContracts: 4,
    completionRate: 97, avgClearTime: "2.8h", citizenRating: 4.6,
    anomalies: 1, status: "ACTIVE", trend: "up",
    unresolved: 0, joinedDate: "Nov 2022",
  },
  {
    id: "CON-004", name: "BangaloreGreen", zone: "Karnataka",
    districts: ["Bangalore", "Belgaum", "Mysore"], score: 38,
    workers: 18, trucks: 6, activeContracts: 2,
    completionRate: 62, avgClearTime: "9.4h", citizenRating: 2.9,
    anomalies: 9, status: "FLAGGED", trend: "down",
    unresolved: 7, joinedDate: "Jun 2023",
  },
  {
    id: "CON-005", name: "Chennai Civic Services", zone: "Tamil Nadu",
    districts: ["Chennai", "Coimbatore"], score: 79,
    workers: 20, trucks: 7, activeContracts: 2,
    completionRate: 88, avgClearTime: "4.1h", citizenRating: 4.0,
    anomalies: 2, status: "ACTIVE", trend: "up",
    unresolved: 2, joinedDate: "Feb 2023",
  },
  {
    id: "CON-006", name: "Gujarat Green Ops", zone: "Gujarat",
    districts: ["Ahmedabad", "Surat", "Vadodara"], score: 55,
    workers: 22, trucks: 8, activeContracts: 3,
    completionRate: 74, avgClearTime: "6.7h", citizenRating: 3.3,
    anomalies: 6, status: "REVIEW", trend: "down",
    unresolved: 4, joinedDate: "Apr 2023",
  },
  {
    id: "CON-007", name: "Rajasthan Eco Systems", zone: "Rajasthan",
    districts: ["Jaipur", "Jodhpur"], score: 83,
    workers: 17, trucks: 6, activeContracts: 2,
    completionRate: 91, avgClearTime: "3.7h", citizenRating: 4.2,
    anomalies: 1, status: "ACTIVE", trend: "up",
    unresolved: 1, joinedDate: "Dec 2022",
  },
  {
    id: "CON-008", name: "Kolkata Clean Pvt", zone: "West Bengal",
    districts: ["Kolkata", "Howrah"], score: 66,
    workers: 19, trucks: 7, activeContracts: 2,
    completionRate: 79, avgClearTime: "5.9h", citizenRating: 3.5,
    anomalies: 3, status: "ACTIVE", trend: "up",
    unresolved: 2, joinedDate: "May 2023",
  },
];

const STATUS_CONFIG = {
  ACTIVE:  { color: "#22c55e", bg: "rgba(34,197,94,0.12)",  border: "rgba(34,197,94,0.3)",  label: "Active"  },
  REVIEW:  { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)", label: "Under Review" },
  FLAGGED: { color: "#ef4444", bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.3)",  label: "Flagged" },
};

function ScoreBadge({ score }) {
  const color = score >= 80 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";
  const bg    = score >= 80 ? "rgba(34,197,94,0.1)" : score >= 50 ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)";
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      width: 48, height: 48, borderRadius: 12,
      background: bg, border: `1.5px solid ${color}33`,
      flexDirection: "column", flexShrink: 0,
    }}>
      <span style={{ fontSize: 16, fontWeight: 800, color, fontFamily: "'Syne', sans-serif", lineHeight: 1 }}>{score}</span>
      <span style={{ fontSize: 8, color: `${color}99`, letterSpacing: "0.05em", marginTop: 1 }}>SCORE</span>
    </div>
  );
}

function StarRow({ rating }) {
  return (
    <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={10}
          fill={i <= Math.round(rating) ? "#f59e0b" : "none"}
          color={i <= Math.round(rating) ? "#f59e0b" : "rgba(255,255,255,0.2)"}
        />
      ))}
      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginLeft: 3 }}>{rating}</span>
    </div>
  );
}

export default function ContractorList({ onSelectContractor }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterZone, setFilterZone] = useState("ALL");
  const [sortBy, setSortBy] = useState("score");

  const zones = ["ALL", ...new Set(CONTRACTORS.map(c => c.zone))];

  const filtered = CONTRACTORS
    .filter(c => {
      const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.id.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === "ALL" || c.status === filterStatus;
      const matchZone   = filterZone === "ALL" || c.zone === filterZone;
      return matchSearch && matchStatus && matchZone;
    })
    .sort((a, b) => sortBy === "score" ? b.score - a.score : a.name.localeCompare(b.name));

  const stats = [
    { label: "Total Contractors", val: CONTRACTORS.length,                          color: "#3b82f6", icon: Building2 },
    { label: "Active",            val: CONTRACTORS.filter(c=>c.status==="ACTIVE").length,  color: "#22c55e", icon: CheckCircle },
    { label: "Flagged / Review",  val: CONTRACTORS.filter(c=>c.status!=="ACTIVE").length, color: "#ef4444", icon: AlertTriangle },
    { label: "Avg Score",         val: Math.round(CONTRACTORS.reduce((a,c)=>a+c.score,0)/CONTRACTORS.length), color: "#f59e0b", icon: Star },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 99px; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
      <div style={{
        minHeight: "100vh", background: "linear-gradient(135deg,#0a1a0f 0%,#0d1b2a 50%,#0a1628 100%)",
        fontFamily: "'DM Sans',sans-serif", color: "#fff", padding: "28px 32px",
      }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10,
              background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Building2 size={18} color="#3b82f6" />
            </div>
            <div>
              <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, lineHeight: 1 }}>
                Contractor Management
              </h1>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>
                Manage contracts, zones, and credibility scores
              </p>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 28 }}>
          {stats.map(({ label, val, color, icon: Icon }, i) => (
            <div key={label} style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 14, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14,
              animation: `fadeUp 0.4s ease ${i * 60}ms both`,
            }}>
              <div style={{ width: 40, height: 40, borderRadius: 10,
                background: `${color}15`, border: `1px solid ${color}30`,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={18} color={color} />
              </div>
              <div>
                <p style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Syne',sans-serif", color }}>{val}</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <Search size={13} color="rgba(255,255,255,0.35)"
              style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or ID..."
              style={{ width: "100%", background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
                padding: "9px 12px 9px 34px", color: "#fff", fontSize: 13, outline: "none" }} />
          </div>

          {[
            { label: "Status", val: filterStatus, setter: setFilterStatus,
              options: [["ALL","All Status"],["ACTIVE","Active"],["REVIEW","Under Review"],["FLAGGED","Flagged"]] },
            { label: "Zone", val: filterZone, setter: setFilterZone,
              options: zones.map(z => [z, z === "ALL" ? "All Zones" : z]) },
            { label: "Sort", val: sortBy, setter: setSortBy,
              options: [["score","Sort: Score"],["name","Sort: Name"]] },
          ].map(({ val, setter, options }) => (
            <select key={val} value={val} onChange={e => setter(e.target.value)}
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10, padding: "9px 12px", color: "rgba(255,255,255,0.75)",
                fontSize: 12, outline: "none", cursor: "pointer" }}>
              {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          ))}

          <button style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px",
            borderRadius: 10, border: "1px solid rgba(34,197,94,0.35)",
            background: "rgba(34,197,94,0.08)", color: "#22c55e",
            fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            <Plus size={13} /> Assign Contractor
          </button>
        </div>

        {/* Table */}
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 16, overflow: "hidden" }}>

          {/* Table header */}
          <div style={{ display: "grid",
            gridTemplateColumns: "48px 1fr 120px 110px 100px 110px 90px 90px 120px",
            padding: "10px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)",
            background: "rgba(255,255,255,0.02)" }}>
            {["Score","Contractor","Zone","Workers","Trucks","Completion","Anomalies","Status",""].map(h => (
              <span key={h} style={{ fontSize: 10, color: "rgba(255,255,255,0.35)",
                fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase" }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          {filtered.map((c, i) => {
            const st = STATUS_CONFIG[c.status];
            return (
              <div key={c.id}
                onClick={() => onSelectContractor?.(c)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "48px 1fr 120px 110px 100px 110px 90px 90px 120px",
                  padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)",
                  alignItems: "center", cursor: "pointer",
                  animation: `fadeUp 0.35s ease ${i * 40}ms both`,
                  transition: "background 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <ScoreBadge score={c.score} />

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14 }}>{c.name}</span>
                    {c.status === "FLAGGED" && <AlertTriangle size={12} color="#ef4444" />}
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{c.id}</span>
                    <StarRow rating={c.citizenRating} />
                  </div>
                </div>

                <div>
                  <p style={{ fontSize: 12, color: "#fff", fontWeight: 500 }}>{c.zone}</p>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
                    {c.districts.length} districts
                  </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Users size={13} color="rgba(255,255,255,0.4)" />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{c.workers}</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Truck size={13} color="rgba(255,255,255,0.4)" />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{c.trucks}</span>
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 700,
                      color: c.completionRate >= 90 ? "#22c55e" : c.completionRate >= 70 ? "#f59e0b" : "#ef4444" }}>
                      {c.completionRate}%
                    </span>
                    {c.trend === "up" ? <TrendingUp size={12} color="#22c55e" /> : <TrendingDown size={12} color="#ef4444" />}
                  </div>
                  <div style={{ height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 99, width: 70 }}>
                    <div style={{ height: "100%", borderRadius: 99, width: `${c.completionRate}%`,
                      background: c.completionRate >= 90 ? "#22c55e" : c.completionRate >= 70 ? "#f59e0b" : "#ef4444" }} />
                  </div>
                </div>

                <span style={{ fontSize: 13, fontWeight: 600,
                  color: c.anomalies <= 2 ? "rgba(255,255,255,0.6)" : c.anomalies <= 5 ? "#f59e0b" : "#ef4444" }}>
                  {c.anomalies > 0 ? `⚠ ${c.anomalies}` : "—"}
                </span>

                <div style={{ display: "inline-flex", padding: "4px 10px", borderRadius: 99,
                  background: st.bg, border: `1px solid ${st.border}` }}>
                  <span style={{ fontSize: 10, color: st.color, fontWeight: 600 }}>{st.label}</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 4,
                  color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
                  View Details <ChevronRight size={14} />
                </div>
              </div>
            );
          })}
        </div>

        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 12 }}>
          Showing {filtered.length} of {CONTRACTORS.length} contractors
        </p>
      </div>
    </>
  );
}