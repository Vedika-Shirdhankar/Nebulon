import { useState } from "react";
import {
  User, Star, TrendingUp, TrendingDown, AlertTriangle,
  ChevronRight, Search, CheckCircle, Clock, Users,
  MapPin, BarChart2, Plus, Shield, Activity
} from "lucide-react";

const WORKERS = [
  { id: "WK-101", name: "Ravi Kumar",     contractor: "GreenHaul Pvt",    zone: "Mumbai",       score: 91, route: "MH-R14", status: "ON_ROUTE",  completionRate: 97, rating: 4.7, anomalies: 0, attendance: 98, joinedDate: "Feb 2023", trend: "up"   },
  { id: "WK-102", name: "Suresh Patil",   contractor: "EcoTrack Ltd",      zone: "Thane",        score: 74, route: "MH-R22", status: "ON_ROUTE",  completionRate: 83, rating: 3.9, anomalies: 2, attendance: 91, joinedDate: "Apr 2023", trend: "up"   },
  { id: "WK-103", name: "Amit Singh",     contractor: "Swachh Systems",    zone: "Pune",         score: 85, route: "MH-R08", status: "COMPLETED", completionRate: 92, rating: 4.4, anomalies: 1, attendance: 95, joinedDate: "Jan 2023", trend: "up"   },
  { id: "WK-104", name: "Kiran More",     contractor: "CityClean Co.",     zone: "Nashik",       score: 48, route: "MH-R31", status: "IDLE",      completionRate: 61, rating: 3.1, anomalies: 5, attendance: 78, joinedDate: "Jul 2023", trend: "down" },
  { id: "WK-105", name: "Deepak Rane",    contractor: "GreenHaul Pvt",     zone: "Aurangabad",   score: 79, route: "MH-R19", status: "ON_ROUTE",  completionRate: 88, rating: 4.1, anomalies: 1, attendance: 93, joinedDate: "Mar 2023", trend: "up"   },
  { id: "WK-201", name: "Mohit Sharma",   contractor: "Capital Waste Co.", zone: "Central Delhi",score: 94, route: "DL-R04", status: "ON_ROUTE",  completionRate: 99, rating: 4.8, anomalies: 0, attendance: 99, joinedDate: "Dec 2022", trend: "up"   },
  { id: "WK-202", name: "Pradeep Gupta",  contractor: "Capital Waste Co.", zone: "West Delhi",   score: 33, route: "DL-R11", status: "ABSENT",    completionRate: 44, rating: 2.4, anomalies: 8, attendance: 62, joinedDate: "Aug 2023", trend: "down" },
  { id: "WK-301", name: "Venkat Reddy",   contractor: "BangaloreGreen",    zone: "Bangalore",    score: 44, route: "KA-R07", status: "ON_ROUTE",  completionRate: 61, rating: 2.9, anomalies: 3, attendance: 81, joinedDate: "Jun 2023", trend: "down" },
  { id: "WK-302", name: "Sanjay Nayak",   contractor: "BangaloreGreen",    zone: "Belgaum",      score: 58, route: "KA-R15", status: "ON_ROUTE",  completionRate: 72, rating: 3.5, anomalies: 1, attendance: 87, joinedDate: "Jun 2023", trend: "up"   },
  { id: "WK-401", name: "Murugan R.",     contractor: "Chennai Civic",     zone: "Chennai",      score: 82, route: "TN-R02", status: "ON_ROUTE",  completionRate: 90, rating: 4.3, anomalies: 1, attendance: 96, joinedDate: "Feb 2023", trend: "up"   },
  { id: "WK-501", name: "Nilesh Patel",   contractor: "Gujarat Green",     zone: "Ahmedabad",    score: 69, route: "GJ-R09", status: "ON_ROUTE",  completionRate: 77, rating: 3.7, anomalies: 2, attendance: 89, joinedDate: "May 2023", trend: "up"   },
  { id: "WK-502", name: "Dinesh Shah",    contractor: "Gujarat Green",     zone: "Surat",        score: 41, route: "GJ-R16", status: "ABSENT",    completionRate: 55, rating: 2.7, anomalies: 6, attendance: 70, joinedDate: "Sep 2023", trend: "down" },
];

const STATUS_CFG = {
  ON_ROUTE:  { color: "#22c55e", bg: "rgba(34,197,94,0.12)",  border: "rgba(34,197,94,0.3)",  label: "On Route"  },
  COMPLETED: { color: "#3b82f6", bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.3)", label: "Completed" },
  IDLE:      { color: "#6b7280", bg: "rgba(107,114,128,0.1)", border: "rgba(107,114,128,0.3)",label: "Idle"      },
  ABSENT:    { color: "#ef4444", bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.3)",  label: "Absent"    },
};

function ScoreChip({ score }) {
  const color = score >= 80 ? "#22c55e" : score >= 55 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
      width: 44, height: 44, borderRadius: 11,
      background: `${color}12`, border: `1.5px solid ${color}30`, flexDirection: "column", flexShrink: 0 }}>
      <span style={{ fontSize: 15, fontWeight: 800, color, fontFamily: "'Syne',sans-serif", lineHeight: 1 }}>{score}</span>
    </div>
  );
}

function StarRow({ rating }) {
  return (
    <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={9}
          fill={i <= Math.round(rating) ? "#f59e0b" : "none"}
          color={i <= Math.round(rating) ? "#f59e0b" : "rgba(255,255,255,0.2)"} />
      ))}
      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginLeft: 3 }}>{rating}</span>
    </div>
  );
}

export default function WorkerList({ onSelectWorker }) {
  const [search, setSearch]           = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterZone, setFilterZone]   = useState("ALL");
  const [filterContractor, setFilterContractor] = useState("ALL");
  const [sortBy, setSortBy]           = useState("score");

  const zones       = ["ALL", ...new Set(WORKERS.map(w => w.zone))];
  const contractors = ["ALL", ...new Set(WORKERS.map(w => w.contractor))];

  const filtered = WORKERS
    .filter(w => {
      const matchSearch     = w.name.toLowerCase().includes(search.toLowerCase()) || w.id.toLowerCase().includes(search.toLowerCase());
      const matchStatus     = filterStatus === "ALL" || w.status === filterStatus;
      const matchZone       = filterZone === "ALL" || w.zone === filterZone;
      const matchContractor = filterContractor === "ALL" || w.contractor === filterContractor;
      return matchSearch && matchStatus && matchZone && matchContractor;
    })
    .sort((a, b) => sortBy === "score" ? b.score - a.score : a.name.localeCompare(b.name));

  const stats = [
    { label: "Total Workers", val: WORKERS.length, color: "#3b82f6", icon: Users },
    { label: "On Route Today", val: WORKERS.filter(w=>w.status==="ON_ROUTE").length, color: "#22c55e", icon: Activity },
    { label: "Absent / Idle", val: WORKERS.filter(w=>w.status==="ABSENT"||w.status==="IDLE").length, color: "#f59e0b", icon: Clock },
    { label: "Flagged Workers", val: WORKERS.filter(w=>w.anomalies>3).length, color: "#ef4444", icon: AlertTriangle },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 99px; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
      <div style={{
        minHeight: "100vh", background: "linear-gradient(135deg,#0a1a0f 0%,#0d1b2a 50%,#0a1628 100%)",
        fontFamily: "'DM Sans',sans-serif", color: "#fff", padding: "28px 32px",
      }}>

        {/* Header */}
        <div style={{ marginBottom: 28, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10,
            background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            <User size={18} color="#22c55e" />
          </div>
          <div>
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, lineHeight: 1 }}>
              Waste Worker Management
            </h1>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>
              Track performance, attendance, and credibility scores
            </p>
          </div>
        </div>

        {/* Stats */}
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
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
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
            { val: filterStatus, setter: setFilterStatus,
              options: [["ALL","All Status"],["ON_ROUTE","On Route"],["COMPLETED","Completed"],["IDLE","Idle"],["ABSENT","Absent"]] },
            { val: filterContractor, setter: setFilterContractor,
              options: contractors.map(c => [c, c === "ALL" ? "All Contractors" : c]) },
            { val: sortBy, setter: setSortBy,
              options: [["score","Sort: Score"],["name","Sort: Name"]] },
          ].map(({ val, setter, options }, idx) => (
            <select key={idx} value={val} onChange={e => setter(e.target.value)}
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10, padding: "9px 12px", color: "rgba(255,255,255,0.75)",
                fontSize: 12, outline: "none", cursor: "pointer" }}>
              {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 16, overflow: "hidden" }}>

          <div style={{ display: "grid",
            gridTemplateColumns: "44px 1fr 150px 110px 110px 100px 80px 90px 80px",
            padding: "10px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)",
            background: "rgba(255,255,255,0.02)" }}>
            {["Score","Worker","Contractor","Zone","Route","Completion","Rating","Anomalies","Status"].map(h => (
              <span key={h} style={{ fontSize: 10, color: "rgba(255,255,255,0.35)",
                fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase" }}>{h}</span>
            ))}
          </div>

          {filtered.map((w, i) => {
            const st = STATUS_CFG[w.status];
            return (
              <div key={w.id}
                onClick={() => onSelectWorker?.(w)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "44px 1fr 150px 110px 110px 100px 80px 90px 80px",
                  padding: "13px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)",
                  alignItems: "center", cursor: "pointer",
                  animation: `fadeUp 0.35s ease ${i * 35}ms both`,
                  transition: "background 0.2s",
                  background: w.status === "ABSENT" ? "rgba(239,68,68,0.025)" : "transparent",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                onMouseLeave={e => e.currentTarget.style.background = w.status === "ABSENT" ? "rgba(239,68,68,0.025)" : "transparent"}
              >
                <ScoreChip score={w.score} />

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8,
                      background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <User size={13} color="rgba(255,255,255,0.5)" />
                    </div>
                    <div>
                      <p style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13 }}>{w.name}</p>
                      <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{w.id}</p>
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>{w.contractor}</p>

                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <MapPin size={11} color="rgba(255,255,255,0.3)" />
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}>{w.zone}</span>
                </div>

                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)",
                  fontFamily: "'Syne',sans-serif", fontWeight: 600 }}>{w.route}</span>

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 700,
                      color: w.completionRate >= 85 ? "#22c55e" : w.completionRate >= 65 ? "#f59e0b" : "#ef4444" }}>
                      {w.completionRate}%
                    </span>
                    {w.trend === "up" ? <TrendingUp size={11} color="#22c55e" /> : <TrendingDown size={11} color="#ef4444" />}
                  </div>
                  <div style={{ height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 99, width: 70 }}>
                    <div style={{ height: "100%", borderRadius: 99, width: `${w.completionRate}%`,
                      background: w.completionRate >= 85 ? "#22c55e" : w.completionRate >= 65 ? "#f59e0b" : "#ef4444" }} />
                  </div>
                </div>

                <StarRow rating={w.rating} />

                <span style={{ fontSize: 13, fontWeight: 600,
                  color: w.anomalies === 0 ? "rgba(255,255,255,0.3)" : w.anomalies <= 2 ? "#f59e0b" : "#ef4444" }}>
                  {w.anomalies > 0 ? `⚠ ${w.anomalies}` : "—"}
                </span>

                <div style={{ display: "inline-flex", padding: "4px 10px", borderRadius: 99,
                  background: st.bg, border: `1px solid ${st.border}` }}>
                  <span style={{ fontSize: 10, color: st.color, fontWeight: 600 }}>{st.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 12 }}>
          Showing {filtered.length} of {WORKERS.length} workers
        </p>
      </div>
    </>
  );
}