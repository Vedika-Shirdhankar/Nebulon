import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useRealtime } from "../../hooks/useRealtime";
import axiosInstance from "../../lib/axios";
import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import Badge from "../../components/ui/Badge";
import Timeline from "../../components/ui/Timeline";
import CredibilityBadge from "../../components/ui/CredibilityBadge";
import Modal from "../../components/ui/Modal";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

export default function CitizenHome() {
  const { user } = useAuth();
  const [batches, setBatches] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [profile, setProfile] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrModal, setQrModal] = useState({ open: false, qr: null, batchId: null });

  useRealtime("batches", `citizen_id=eq.${user?.id}`, (payload) => {
    if (payload.eventType === "INSERT") {
      setBatches((prev) => [payload.new, ...prev]);
    } else if (payload.eventType === "UPDATE") {
      setBatches((prev) =>
        prev.map((b) => (b.id === payload.new.id ? payload.new : b))
      );
    }
  });

  useRealtime("complaints", `citizen_id=eq.${user?.id}`, (payload) => {
    if (payload.eventType === "INSERT") {
      setComplaints((prev) => [payload.new, ...prev]);
    } else if (payload.eventType === "UPDATE") {
      setComplaints((prev) =>
        prev.map((c) => (c.id === payload.new.id ? payload.new : c))
      );
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [batchRes, complaintRes, profileRes, activityRes] =
          await Promise.all([
            axiosInstance.get("/batch/citizen"),
            axiosInstance.get("/complaint/citizen"),
            axiosInstance.get("/citizen/profile"),
            axiosInstance.get("/citizen/activity"),
          ]);
        setBatches(batchRes.data);
        setComplaints(complaintRes.data);
        setProfile(profileRes.data);
        setActivity(activityRes.data);
      } catch (err) {
        console.error("Failed to load citizen home data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleShowQR = async (batch) => {
    try {
      const res = await axiosInstance.get(`/qr/batch/${batch.id}`);
      setQrModal({ open: true, qr: res.data.qr_base64, batchId: batch.id });
    } catch (err) {
      console.error("Failed to load QR", err);
    }
  };

  const statusColor = {
    CREATED: "blue",
    PICKED_UP: "yellow",
    AT_CENTER: "purple",
    SEGREGATED: "orange",
    PROCESSED: "green",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-green-500/30 border-t-green-500 animate-spin" />
          <p className="text-sm text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const latestBatch = batches[0];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero Header */}
      <div className="relative overflow-hidden px-6 pt-8 pb-6">
        {/* Gradient blob background */}
        <div className="absolute -top-10 -left-10 w-72 h-72 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-10 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex items-center justify-between max-w-5xl mx-auto">
          <div>
            <p className="text-green-400 text-sm font-medium mb-1 tracking-wide uppercase">
              Welcome back
            </p>
            <h1 className="text-2xl font-bold text-white">
              {user?.user_metadata?.name || "Citizen"} 👋
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Your waste accountability dashboard
            </p>
          </div>
          {profile && (
            <CredibilityBadge score={profile.segregation_score ?? 0} />
          )}
        </div>
      </div>

      <div className="px-6 pb-10 space-y-6 max-w-5xl mx-auto">

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { title: "Total Batches", value: batches.length, icon: "🗑️", from: "from-green-500/20", to: "to-green-500/5", text: "text-green-400" },
            { title: "Processed", value: batches.filter((b) => b.status === "PROCESSED").length, icon: "✅", from: "from-blue-500/20", to: "to-blue-500/5", text: "text-blue-400" },
            { title: "Complaints", value: complaints.length, icon: "📋", from: "from-green-500/20", to: "to-blue-500/5", text: "text-green-400" },
            { title: "Seg. Score", value: `${profile?.segregation_score ?? 0}%`, icon: "♻️", from: "from-blue-500/20", to: "to-green-500/5", text: "text-blue-400" },
          ].map((stat) => (
            <div
              key={stat.title}
              className={`bg-gradient-to-br ${stat.from} ${stat.to} border border-white/10 rounded-2xl p-4`}
            >
              <div className="text-2xl mb-2">{stat.icon}</div>
              <p className={`text-2xl font-bold ${stat.text}`}>{stat.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{stat.title}</p>
            </div>
          ))}
        </div>

        {/* Latest Batch */}
        {latestBatch && (
          <div className="relative rounded-2xl overflow-hidden border border-white/10">
            {/* Gradient bar at top */}
            <div className="h-1 w-full bg-gradient-to-r from-green-500 to-blue-500" />
            <div className="bg-gray-900 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-white">
                  Latest Batch
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    latestBatch.status === "PROCESSED"
                      ? "bg-green-500/20 text-green-400"
                      : latestBatch.status === "CREATED"
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-gray-700 text-gray-300"
                  }`}
                >
                  {latestBatch.status.replace(/_/g, " ")}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 space-y-1.5">
                  <p className="text-xs text-gray-400">
                    Batch ID:{" "}
                    <span className="font-mono text-gray-200">
                      {latestBatch.id}
                    </span>
                  </p>
                  <p className="text-xs text-gray-400">
                    Type:{" "}
                    <span className="font-medium text-white">
                      {latestBatch.waste_type}
                    </span>
                  </p>
                  <p className="text-xs text-gray-400">
                    Created:{" "}
                    {new Date(latestBatch.created_at).toLocaleDateString("en-IN", {
                      day: "2-digit", month: "short", year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleShowQR(latestBatch)}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-green-500 to-blue-500 text-white hover:opacity-90 transition"
                  >
                    Show QR
                  </button>
                  <Link
                    to={`/citizen/track-batch/${latestBatch.id}`}
                    className="px-4 py-2 border border-white/20 text-gray-300 rounded-lg text-sm font-medium hover:bg-white/5 transition"
                  >
                    Track
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* My Batches */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-white">My Batches</h2>
            <Link
              to="/citizen/report"
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-green-500 to-blue-500 text-white hover:opacity-90 transition"
            >
              + Report Waste
            </Link>
          </div>

          {batches.length === 0 ? (
            <div className="bg-gray-900 border border-white/10 rounded-2xl p-8 text-center">
              <p className="text-4xl mb-3">🗑️</p>
              <p className="text-gray-400 text-sm">
                No batches yet. Report your first waste pickup!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {batches.slice(0, 5).map((batch) => (
                <div
                  key={batch.id}
                  className="bg-gray-900 border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between hover:border-green-500/30 transition"
                >
                  <div>
                    <p className="font-mono text-xs text-gray-500">{batch.id}</p>
                    <p className="text-sm font-medium text-white">
                      {batch.waste_type}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(batch.created_at).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        batch.status === "PROCESSED"
                          ? "bg-green-500/20 text-green-400"
                          : batch.status === "CREATED"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-gray-700 text-gray-300"
                      }`}
                    >
                      {batch.status.replace(/_/g, " ")}
                    </span>
                    <Link
                      to={`/citizen/track-batch/${batch.id}`}
                      className="text-green-400 text-sm hover:text-blue-400 transition"
                    >
                      Track →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Complaints */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-white">
              My Complaints
            </h2>
            <Link
              to="/citizen/complaints"
              className="text-xs text-green-400 hover:text-blue-400 transition"
            >
              View all →
            </Link>
          </div>

          {complaints.length === 0 ? (
            <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 text-center">
              <p className="text-gray-400 text-sm">No complaints filed.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {complaints.slice(0, 3).map((c) => (
                <div
                  key={c.id}
                  className="bg-gray-900 border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between hover:border-blue-500/30 transition"
                >
                  <div>
                    <p className="text-sm font-medium text-white line-clamp-1">
                      {c.description || "No description"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(c.created_at).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        c.status === "RESOLVED"
                          ? "bg-green-500/20 text-green-400"
                          : c.status === "PENDING"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-gray-700 text-gray-300"
                      }`}
                    >
                      {c.status}
                    </span>
                    <Link
                      to={`/citizen/track-complaint/${c.id}`}
                      className="text-green-400 text-sm hover:text-blue-400 transition"
                    >
                      View →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-base font-semibold text-white mb-3">
            Recent Activity
          </h2>
          {activity.length > 0 ? (
            <div className="bg-gray-900 border border-white/10 rounded-2xl p-4">
              <Timeline events={activity} />
            </div>
          ) : (
            <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 text-center">
              <p className="text-gray-400 text-sm">No recent activity.</p>
            </div>
          )}
        </div>
      </div>

      {/* QR Modal */}
      <Modal
        isOpen={qrModal.open}
        onClose={() => setQrModal({ open: false, qr: null, batchId: null })}
        title="Batch QR Code"
      >
        <div className="flex flex-col items-center gap-4 p-2">
          {qrModal.qr && (
            <div className="p-3 bg-white rounded-2xl">
              <img
                src={`data:image/png;base64,${qrModal.qr}`}
                alt="Batch QR Code"
                className="w-52 h-52"
              />
            </div>
          )}
          <p className="text-xs text-gray-400 font-mono">{qrModal.batchId}</p>
          <p className="text-xs text-gray-500 text-center">
            Show this QR code to the waste collector for scanning
          </p>
          <Link
            to={`/citizen/track-batch/${qrModal.batchId}`}
            className="w-full py-2.5 rounded-xl text-center text-sm font-semibold bg-gradient-to-r from-green-500 to-blue-500 text-white hover:opacity-90 transition"
            onClick={() => setQrModal({ open: false, qr: null, batchId: null })}
          >
            Track this batch →
          </Link>
        </div>
      </Modal>
    </div>
  );
}