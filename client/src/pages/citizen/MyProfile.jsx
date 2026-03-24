import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import axiosInstance from "../../lib/axios";
import Card from "../../components/ui/Card";
import CredibilityBadge from "../../components/ui/CredibilityBadge";
import Badge from "../../components/ui/Badge";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

export default function MyProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [profileRes, historyRes] = await Promise.all([
          axiosInstance.get("/citizen/profile"),
          axiosInstance.get("/citizen/segregation-history"),
        ]);
        setProfile(profileRes.data);
        setHistory(historyRes.data);
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner />
      </div>
    );

  const scoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 text-sm mt-1">
          Your waste accountability record
        </p>
      </div>

      {/* Profile Card */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-2xl">
            {user?.user_metadata?.name?.[0]?.toUpperCase() || "C"}
          </div>
          <div className="flex-1">
            <p className="text-lg font-bold text-gray-900">
              {user?.user_metadata?.name || "Citizen"}
            </p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <p className="text-xs text-gray-400 mt-1">
              Member since{" "}
              {new Date(user?.created_at).toLocaleDateString("en-IN", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          {profile && (
            <CredibilityBadge score={profile.segregation_score ?? 0} />
          )}
        </div>
      </Card>

      {/* Score Breakdown */}
      {profile && (
        <Card>
          <p className="text-sm font-semibold text-gray-700 mb-4">
            Segregation Score Breakdown
          </p>
          <div className="flex items-center gap-4 mb-4">
            <div
              className={`text-5xl font-bold ${scoreColor(
                profile.segregation_score ?? 0
              )}`}
            >
              {profile.segregation_score ?? 0}
              <span className="text-xl font-normal">%</span>
            </div>
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-700 ${
                    (profile.segregation_score ?? 0) >= 80
                      ? "bg-green-500"
                      : (profile.segregation_score ?? 0) >= 50
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${profile.segregation_score ?? 0}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {(profile.segregation_score ?? 0) >= 80
                  ? "Excellent segregation! Keep it up."
                  : (profile.segregation_score ?? 0) >= 50
                  ? "Good, but room for improvement."
                  : "Needs significant improvement."}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xl font-bold text-gray-800">
                {profile.total_batches ?? 0}
              </p>
              <p className="text-xs text-gray-400">Total Batches</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xl font-bold text-gray-800">
                {profile.total_checks ?? 0}
              </p>
              <p className="text-xs text-gray-400">AI Checks Done</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xl font-bold text-gray-800">
                {profile.complaints_resolved ?? 0}
              </p>
              <p className="text-xs text-gray-400">Complaints Resolved</p>
            </div>
          </div>
        </Card>
      )}

      {/* Segregation History */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          Segregation Check History
        </h2>
        {history.length === 0 ? (
          <Card>
            <p className="text-center text-gray-400 py-6 text-sm">
              No segregation checks yet. Try the{" "}
              <a
                href="/citizen/segregation-check"
                className="text-indigo-600 hover:underline"
              >
                Segregation Check
              </a>{" "}
              feature!
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <Card key={item.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-700 font-medium">
                    Score:{" "}
                    <span className={scoreColor(item.score)}>
                      {item.score}%
                    </span>
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(item.created_at).toLocaleDateString("en-IN")}
                  </p>
                  {item.wrong_items_count > 0 && (
                    <p className="text-xs text-red-500">
                      {item.wrong_items_count} wrong item(s) detected
                    </p>
                  )}
                </div>
                <Badge
                  color={
                    item.score >= 80
                      ? "green"
                      : item.score >= 50
                      ? "yellow"
                      : "red"
                  }
                >
                  {item.score >= 80
                    ? "Excellent"
                    : item.score >= 50
                    ? "Fair"
                    : "Poor"}
                </Badge>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}