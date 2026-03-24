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

  if (loading) return <LoadingSpinner />;

  const latestBatch = batches[0];

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.user_metadata?.name || "Citizen"} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Your waste accountability dashboard
          </p>
        </div>
        {profile && (
          <CredibilityBadge score={profile.segregation_score ?? 0} />
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Batches"
          value={batches.length}
          icon="🗑️"
          color="blue"
        />
        <StatCard
          title="Processed"
          value={batches.filter((b) => b.status === "PROCESSED").length}
          icon="✅"
          color="green"
        />
        <StatCard
          title="Complaints"
          value={complaints.length}
          icon="📋"
          color="yellow"
        />
        <StatCard
          title="Seg. Score"
          value={`${profile?.segregation_score ?? 0}%`}
          icon="♻️"
          color="purple"
        />
      </div>

      {/* Latest Batch */}
      {latestBatch && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-800">
              Latest Batch
            </h2>
            <Badge color={statusColor[latestBatch.status] || "gray"}>
              {latestBatch.status.replace("_", " ")}
            </Badge>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 space-y-1">
              <p className="text-sm text-gray-500">
                Batch ID:{" "}
                <span className="font-mono text-gray-800">
                  {latestBatch.id}
                </span>
              </p>
              <p className="text-sm text-gray-500">
                Type:{" "}
                <span className="font-medium text-gray-700">
                  {latestBatch.waste_type}
                </span>
              </p>
              <p className="text-sm text-gray-500">
                Created:{" "}
                {new Date(latestBatch.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleShowQR(latestBatch)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
              >
                Show QR
              </button>
              <Link
                to={`/citizen/track-batch/${latestBatch.id}`}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
              >
                Track
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* My Batches */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">My Batches</h2>
          <Link
            to="/citizen/report"
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
          >
            + Report Waste
          </Link>
        </div>
        {batches.length === 0 ? (
          <Card>
            <p className="text-center text-gray-400 py-8">
              No batches yet. Report your first waste pickup!
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {batches.slice(0, 5).map((batch) => (
              <Card key={batch.id} className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-xs text-gray-400">{batch.id}</p>
                  <p className="text-sm font-medium text-gray-800">
                    {batch.waste_type}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(batch.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge color={statusColor[batch.status] || "gray"}>
                    {batch.status.replace("_", " ")}
                  </Badge>
                  <Link
                    to={`/citizen/track-batch/${batch.id}`}
                    className="text-indigo-600 text-sm hover:underline"
                  >
                    Track →
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* My Complaints */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            My Complaints
          </h2>
          <Link
            to="/citizen/complaints"
            className="text-sm text-indigo-600 hover:underline"
          >
            View all →
          </Link>
        </div>
        {complaints.length === 0 ? (
          <Card>
            <p className="text-center text-gray-400 py-6">
              No complaints filed.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {complaints.slice(0, 3).map((c) => (
              <Card key={c.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800 line-clamp-1">
                    {c.description || "No description"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(c.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    color={
                      c.status === "RESOLVED"
                        ? "green"
                        : c.status === "PENDING"
                        ? "yellow"
                        : "blue"
                    }
                  >
                    {c.status}
                  </Badge>
                  <Link
                    to={`/citizen/track-complaint/${c.id}`}
                    className="text-indigo-600 text-sm hover:underline"
                  >
                    View →
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Recent Activity
        </h2>
        {activity.length > 0 ? (
          <Timeline events={activity} />
        ) : (
          <Card>
            <p className="text-center text-gray-400 py-6">
              No recent activity.
            </p>
          </Card>
        )}
      </div>

      {/* QR Modal */}
      <Modal
        isOpen={qrModal.open}
        onClose={() => setQrModal({ open: false, qr: null, batchId: null })}
        title="Batch QR Code"
      >
        <div className="flex flex-col items-center gap-4 p-4">
          {qrModal.qr && (
            <img
              src={`data:image/png;base64,${qrModal.qr}`}
              alt="Batch QR Code"
              className="w-56 h-56 border rounded-lg"
            />
          )}
          <p className="text-sm text-gray-500 font-mono">{qrModal.batchId}</p>
          <p className="text-xs text-gray-400 text-center">
            Show this QR code to the waste collector for scanning
          </p>
          <Link
            to={`/citizen/track-batch/${qrModal.batchId}`}
            className="text-indigo-600 text-sm hover:underline"
            onClick={() => setQrModal({ open: false, qr: null, batchId: null })}
          >
            Track this batch →
          </Link>
        </div>
      </Modal>
    </div>
  );
}