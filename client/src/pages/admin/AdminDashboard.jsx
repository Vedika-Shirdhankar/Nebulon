import { useState, useEffect, useRef } from "react";
import {
  Trash2, AlertTriangle, TruckIcon, Users, CheckCircle,
  XCircle, Clock, TrendingUp, TrendingDown, Activity,
  Bell, ChevronRight, Zap, Shield, BarChart2, MapPin
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

// ── Fake data ────────────────────────────────────────────────────────────────
const wasteVolumeData = [
  { day: "Mon", collected: 420, target: 500 },
  { day: "Tue", collected: 480, target: 500 },
  { day: "Wed", collected: 310, target: 500 },
  { day: "Thu", collected: 560, target: 500 },
  { day: "Fri", collected: 490, target: 500 },
  { day: "Sat", collected: 380, target: 500 },
  { day: "Sun", collected: 290, target: 500 },
];

const wasteTypeData = [
  { name: "Recyclable", value: 38, color: "#22c55e" },
  { name: "Organic", value: 29, color: "#3b82f6" },
  { name: "Hazardous", value: 11, color: "#f59e0b" },
  { name: "General", value: 22, color: "#6b7280" },
];

const anomalyFeed = [
  { id: 1, type: "GHOST_PICKUP", severity: "HIGH", message: "Truck #TK-042 marked collected 1.2km from site", time: "2m ago", contractor: "GreenHaul Pvt Ltd" },
  { id: 2, type: "BATCH_STAGNATION", severity: "MEDIUM", message: "Batch #WB-1892 stuck In-Transit for 8hrs", time: "14m ago", contractor: "CityClean Co." },
  { id: 3, type: "COMPLAINT_SURGE", severity: "HIGH", message: "Dharavi zone: 67% spike above 7-day avg", time: "31m ago", contractor: "N/A" },
  { id: 4, type: "ROUTE_DEVIATION", severity: "MEDIUM", message: "Worker WK-119 visited stops out of sequence", time: "45m ago", contractor: "EcoTrack Ltd" },
  { id: 5, type: "DISPOSAL_MISMATCH", severity: "HIGH", message: "Recyclable batch #WB-1744 logged as Landfill", time: "1h ago", contractor: "GreenHaul Pvt Ltd" },
  { id: 6, type: "CREDIBILITY_CLIFF", severity: "HIGH", message: "Contractor CityClean Co. score dropped to 38", time: "2h ago", contractor: "CityClean Co." },
];

const recentComplaints = [
  { id: "CMP-441", zone: "Andheri East", status: "PENDING", citizen: "Priya S.", time: "5m ago", severity: "HIGH" },
  { id: "CMP-440", zone: "Bandra West", status: "ASSIGNED", citizen: "Rahul M.", time: "18m ago", severity: "MEDIUM" },
  { id: "CMP-439", zone: "Dharavi", status: "CLEARED", citizen: "Meena K.", time: "42m ago", severity: "LOW" },
  { id: "CMP-438", zone: "Kurla", status: "APPROVED", citizen: "Arjun T.", time: "1h ago", severity: "MEDIUM" },
];

const topContractors = [
  { name: "EcoTrack Ltd", score: 91, batches: 142, zone: "North Mumbai" },
  { name: "Swachh Systems", score: 87, batches: 118, zone: "Pune Central" },
  { name: "GreenHaul Pvt", score: 74, batches: 203, zone: "Thane" },
  { name: "CityClean Co.", score: 38, batches: 89, zone: "Dharavi", flagged: true },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
const severityColor = (s) =>
  s === "HIGH" ? "#ef4444" : s === "MEDIUM" ? "#f59e0b" : "#22c55e";

const statusConfig = {
  PENDING:  { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", label: "Pending" },
  ASSIGNED: { color: "#3b82f6", bg: "rgba(59,130,246,0.12)", label: "Assigned" },
  CLEARED:  { color: "#8b5cf6", bg: "rgba(139,92,246,0.12)", label: "Cleared" },
  APPROVED: { color: "#22c55e", bg: "rgba(34,197,94,0.12)",  label: "Approved" },
};

// ── Sub-components ────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, trend, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), delay); }, [delay]);

  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(24px)",
      transition: "opacity 0.6s ease, transform 0.6s ease",
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 16,
      padding: "20px 24px",
      cursor: "default",
      position: "relative",
      overflow: "hidden",
    }}
      onMouseEnter={e => {
        e.currentTarget.style.background = "rgba(255,255,255,0.07)";
        e.currentTarget.style.border = "1px solid rgba(255,255,255,0.15)";
        e.currentTarget.style.transform = "translateY(-3px)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = "rgba(255,255,255,0.04)";
        e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80,
        background: "radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)",
        borderRadius: "0 16px 0 80px" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, fontFamily: "'DM Sans', sans-serif",
            letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>{label}</p>
          <p style={{ color: "#fff", fontSize: 28, fontFamily: "'Syne', sans-serif",
            fontWeight: 700, lineHeight: 1 }}>{value}</p>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 6,
            fontFamily: "'DM Sans', sans-serif" }}>{sub}</p>
        </div>
        <div style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.2)",
          borderRadius: 12, padding: 10 }}>
          <Icon size={20} color="#22c55e" />
        </div>
      </div>
      {trend && (
        <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 6 }}>
          {trend > 0
            ? <TrendingUp size={14} color="#22c55e" />
            : <TrendingDown size={14} color="#ef4444" />}
          <span style={{ fontSize: 12, color: trend > 0 ? "#22c55e" : "#ef4444",
            fontFamily: "'DM Sans', sans-serif" }}>
            {Math.abs(trend)}% vs yesterday
          </span>
        </div>
      )}
    </div>
  );
}

function AnomalyCard({ item, idx }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), idx * 80); }, [idx]);

  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateX(0)" : "translateX(-20px)",
      transition: "opacity 0.5s ease, transform 0.5s ease",
      display: "flex", alignItems: "flex-start", gap: 12,
      padding: "12px 14px",
      borderRadius: 10,
      marginBottom: 6,
      background: "rgba(255,255,255,0.02)",
      border: `1px solid ${severityColor(item.severity)}22`,
      cursor: "pointer",
    }}
      onMouseEnter={e => {
        e.currentTarget.style.background = `${severityColor(item.severity)}0d`;
        e.currentTarget.style.border = `1px solid ${severityColor(item.severity)}44`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = "rgba(255,255,255,0.02)";
        e.currentTarget.style.border = `1px solid ${severityColor(item.severity)}22`;
      }}
    >
      <div style={{ width: 8, height: 8, borderRadius: "50%", marginTop: 5, flexShrink: 0,
        background: severityColor(item.severity),
        boxShadow: `0 0 8px ${severityColor(item.severity)}` }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 10, color: severityColor(item.severity),
            fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
            letterSpacing: "0.06em" }}>{item.type.replace(/_/g, " ")}</span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)",
            fontFamily: "'DM Sans', sans-serif" }}>{item.time}</span>
        </div>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.75)",
          fontFamily: "'DM Sans', sans-serif", margin: "3px 0",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.message}</p>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)",
          fontFamily: "'DM Sans', sans-serif" }}>{item.contractor}</span>
      </div>
    </div>
  );
}

function ScoreBar({ score, flagged }) {
  const color = score >= 75 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ flex: 1, height: 5, background: "rgba(255,255,255,0.08)", borderRadius: 99, overflow: "hidden" }}>
      <div style={{ width: `${score}%`, height: "100%", borderRadius: 99,
        background: flagged ? "#ef4444" : color,
        transition: "width 1s ease",
        boxShadow: flagged ? "0 0 6px #ef4444" : `0 0 6px ${color}` }} />
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [headerVisible, setHeaderVisible] = useState(false);
  const [liveCount, setLiveCount] = useState(14203);
  const [pulseAnomaly, setPulseAnomaly] = useState(false);

  useEffect(() => {
    setTimeout(() => setHeaderVisible(true), 100);
    const interval = setInterval(() => {
      setLiveCount(c => c + Math.floor(Math.random() * 3));
    }, 2000);
    const pulse = setInterval(() => setPulseAnomaly(p => !p), 1500);
    return () => { clearInterval(interval); clearInterval(pulse); };
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 99px; }
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
          70% { box-shadow: 0 0 0 8px rgba(239,68,68,0); }
          100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0a1a0f 0%, #0d1b2a 50%, #0a1628 100%)",
        fontFamily: "'DM Sans', sans-serif",
        color: "#fff",
        position: "relative",
        overflow: "hidden",
      }}>

        {/* Background mesh */}
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
          <div style={{ position: "absolute", top: "10%", left: "5%", width: 400, height: 400,
            background: "radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 65%)", borderRadius: "50%" }} />
          <div style={{ position: "absolute", bottom: "20%", right: "10%", width: 500, height: 500,
            background: "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 65%)", borderRadius: "50%" }} />
          <div style={{ position: "absolute", top: "50%", left: "40%", width: 300, height: 300,
            background: "radial-gradient(circle, rgba(34,197,94,0.03) 0%, transparent 65%)", borderRadius: "50%" }} />
        </div>

        <div style={{ position: "relative", zIndex: 1 }}>

          {/* Top navbar */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 32px", height: 64,
            background: "rgba(0,0,0,0.3)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            backdropFilter: "blur(12px)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8,
                background: "linear-gradient(135deg, #22c55e, #3b82f6)",
                display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Trash2 size={16} color="#fff" />
              </div>
              <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700,
                fontSize: 16, letterSpacing: "-0.02em" }}>WasteTrack</span>
              <span style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)",
                color: "#22c55e", fontSize: 10, padding: "2px 8px", borderRadius: 99,
                fontWeight: 600, letterSpacing: "0.06em" }}>ADMIN</span>
            </div>

            {/* Live ticker */}
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 99, padding: "6px 16px", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e",
                animation: "pulse-ring 1.5s infinite" }} />
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
                {liveCount.toLocaleString()} batches tracked live
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ position: "relative", cursor: "pointer" }}>
                <Bell size={18} color="rgba(255,255,255,0.6)" />
                <div style={{ position: "absolute", top: -4, right: -4, width: 14, height: 14,
                  background: "#ef4444", borderRadius: "50%", display: "flex",
                  alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700,
                  animation: "pulse-ring 1.5s infinite" }}>6</div>
              </div>
              <div style={{ width: 34, height: 34, borderRadius: "50%",
                background: "linear-gradient(135deg, #22c55e, #3b82f6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13 }}>A</div>
            </div>
          </div>

          {/* Main content */}
          <div style={{ padding: "28px 32px", maxWidth: 1440, margin: "0 auto" }}>

            {/* Page header */}
            <div style={{
              opacity: headerVisible ? 1 : 0,
              transform: headerVisible ? "translateY(0)" : "translateY(-16px)",
              transition: "opacity 0.7s ease, transform 0.7s ease",
              marginBottom: 28,
            }}>
              <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800,
                fontSize: 30, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                Command{" "}
                <span style={{ background: "linear-gradient(90deg, #22c55e, #3b82f6)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Center
                </span>
              </h1>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 4 }}>
                Tuesday, 24 March 2026 · All 28 states monitored
              </p>
            </div>

            {/* Stat cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
              <StatCard icon={TruckIcon}   label="Active Trucks"     value="1,284"  sub="Across 28 states"        trend={4.2}  delay={0}   />
              <StatCard icon={Trash2}      label="Batches Today"     value="8,419"  sub="94.2% on-time"           trend={2.1}  delay={80}  />
              <StatCard icon={AlertTriangle} label="Open Anomalies"  value="23"     sub="6 high severity"         trend={-8}   delay={160} />
              <StatCard icon={CheckCircle} label="Resolved Today"    value="412"    sub="Avg 47min resolution"    trend={11.3} delay={240} />
            </div>

            {/* Second row stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
              <StatCard icon={Users}       label="Active Workers"    value="3,841"  sub="287 off-route alerts"    trend={-1.2} delay={320} />
              <StatCard icon={MapPin}      label="Complaints Open"   value="67"     sub="12 unassigned"           trend={-5.4} delay={400} />
              <StatCard icon={Shield}      label="Avg Credibility"   value="78.4"   sub="4 contractors flagged"   trend={1.1}  delay={480} />
              <StatCard icon={Activity}    label="Waste Collected"   value="412t"   sub="82.4% of daily target"   trend={3.6}  delay={560} />
            </div>

            {/* Main 3-column grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 0.9fr", gap: 20, marginBottom: 20 }}>

              {/* Waste volume chart */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 16, padding: 22 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div>
                    <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15 }}>
                      Waste Collection Volume
                    </h3>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginTop: 2 }}>This week vs target</p>
                  </div>
                  <div style={{ display: "flex", gap: 12 }}>
                    {[{ color: "#22c55e", label: "Collected" }, { color: "rgba(255,255,255,0.15)", label: "Target" }].map(i => (
                      <div key={i.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: i.color }} />
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{i.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={wasteVolumeData}>
                    <defs>
                      <linearGradient id="collected" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="target" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "#0d1b2a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 12 }} />
                    <Area type="monotone" dataKey="target" stroke="rgba(59,130,246,0.3)" fill="url(#target)" strokeDasharray="4 4" strokeWidth={1.5} />
                    <Area type="monotone" dataKey="collected" stroke="#22c55e" fill="url(#collected)" strokeWidth={2} dot={{ fill: "#22c55e", r: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Waste type donut */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 16, padding: 22 }}>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
                  Waste Breakdown
                </h3>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginBottom: 16 }}>By type — today</p>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie data={wasteTypeData} cx="50%" cy="50%" innerRadius={45} outerRadius={68}
                        paddingAngle={3} dataKey="value">
                        {wasteTypeData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: "#0d1b2a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 4 }}>
                  {wasteTypeData.map(d => (
                    <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>{d.name}</span>
                      <span style={{ fontSize: 11, color: "#fff", fontWeight: 600, marginLeft: "auto" }}>{d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contractor leaderboard */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 16, padding: 22 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                  <div>
                    <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15 }}>Contractors</h3>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginTop: 2 }}>Credibility scores</p>
                  </div>
                  <BarChart2 size={16} color="rgba(255,255,255,0.3)" />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {topContractors.map((c, i) => (
                    <div key={i}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <div>
                          <span style={{ fontSize: 12, color: c.flagged ? "#ef4444" : "rgba(255,255,255,0.8)",
                            fontWeight: 500 }}>{c.name}</span>
                          {c.flagged && (
                            <span style={{ marginLeft: 6, fontSize: 9, background: "rgba(239,68,68,0.15)",
                              color: "#ef4444", padding: "1px 6px", borderRadius: 99, fontWeight: 600 }}>FROZEN</span>
                          )}
                          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>{c.zone}</p>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700,
                          color: c.score >= 75 ? "#22c55e" : c.score >= 50 ? "#f59e0b" : "#ef4444",
                          fontFamily: "'Syne', sans-serif" }}>{c.score}</span>
                      </div>
                      <ScoreBar score={c.score} flagged={c.flagged} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom 2-col: Anomaly feed + Complaints */}
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20 }}>

              {/* Anomaly feed */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 16, padding: 22 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444",
                      animation: "pulse-ring 1.5s infinite" }} />
                    <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15 }}>
                      Live Anomaly Feed
                    </h3>
                  </div>
                  <button style={{ fontSize: 11, color: "#22c55e", background: "none", border: "none",
                    cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                    View all <ChevronRight size={12} />
                  </button>
                </div>
                <div style={{ maxHeight: 300, overflowY: "auto" }}>
                  {anomalyFeed.map((item, i) => <AnomalyCard key={item.id} item={item} idx={i} />)}
                </div>
              </div>

              {/* Recent complaints */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 16, padding: 22 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15 }}>
                    Recent Complaints
                  </h3>
                  <button style={{ fontSize: 11, color: "#22c55e", background: "none", border: "none",
                    cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                    Full queue <ChevronRight size={12} />
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {recentComplaints.map((c, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "12px 14px", borderRadius: 10,
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.05)",
                      cursor: "pointer", transition: "all 0.2s ease",
                    }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                        e.currentTarget.style.transform = "translateX(4px)";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                        e.currentTarget.style.transform = "translateX(0)";
                      }}
                    >
                      <div style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                        background: severityColor(c.severity),
                        boxShadow: `0 0 6px ${severityColor(c.severity)}` }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>{c.id}</span>
                          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{c.time}</span>
                        </div>
                        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
                          {c.zone} · {c.citizen}
                        </p>
                      </div>
                      <div style={{ padding: "3px 10px", borderRadius: 99, fontSize: 10, fontWeight: 600,
                        background: statusConfig[c.status].bg,
                        color: statusConfig[c.status].color,
                        border: `1px solid ${statusConfig[c.status].color}33` }}>
                        {statusConfig[c.status].label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick assign CTA */}
                <div style={{ marginTop: 16, padding: "12px 16px",
                  background: "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(59,130,246,0.08))",
                  border: "1px solid rgba(34,197,94,0.2)", borderRadius: 10,
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.border = "1px solid rgba(34,197,94,0.4)"}
                  onMouseLeave={e => e.currentTarget.style.border = "1px solid rgba(34,197,94,0.2)"}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Zap size={14} color="#22c55e" />
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
                      12 complaints awaiting assignment
                    </span>
                  </div>
                  <span style={{ fontSize: 12, color: "#22c55e", fontWeight: 600 }}>Assign All →</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}