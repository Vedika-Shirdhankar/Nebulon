import { useState, useRef } from "react";
import axiosInstance from "../../lib/axios";
import Card from "../../components/ui/Card";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

export default function SegregationCheck() {
  const fileRef = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setResult(null);
    setError("");
  };

  const handleCheck = async () => {
    if (!photo) return setError("Please upload a photo first.");
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("photo", photo);
      const res = await axiosInstance.post("/ai/segregation-check", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Analysis failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const scoreBg = (score) => {
    if (score >= 80) return "bg-green-50 border-green-200";
    if (score >= 50) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Segregation Check
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Upload a photo of your segregated waste and get an AI-powered quality
          score
        </p>
      </div>

      {/* Upload */}
      <Card>
        <p className="text-sm font-semibold text-gray-700 mb-3">
          Photo of Segregated Waste
        </p>
        <div
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition p-4 min-h-[160px] ${
            photoPreview
              ? "border-green-400"
              : "border-gray-300 hover:border-indigo-400"
          }`}
        >
          {photoPreview ? (
            <img
              src={photoPreview}
              alt="Preview"
              className="max-h-52 rounded-lg object-cover"
            />
          ) : (
            <div className="text-center text-gray-400">
              <p className="text-4xl mb-2">♻️</p>
              <p className="text-sm">Click to upload your segregated waste photo</p>
              <p className="text-xs mt-1">JPG, PNG supported</p>
            </div>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handlePhotoChange}
        />
        {photoPreview && (
          <button
            onClick={() => {
              setPhoto(null);
              setPhotoPreview(null);
              setResult(null);
            }}
            className="mt-2 text-xs text-red-500 hover:underline"
          >
            Remove photo
          </button>
        )}
      </Card>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <button
        onClick={handleCheck}
        disabled={loading || !photo}
        className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <LoadingSpinner size="sm" />
            Analyzing with AI...
          </>
        ) : (
          "Analyze Segregation"
        )}
      </button>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Score Card */}
          <Card className={`border ${scoreBg(result.score)}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Segregation Score</p>
                <p
                  className={`text-5xl font-bold mt-1 ${scoreColor(
                    result.score
                  )}`}
                >
                  {result.score}
                  <span className="text-xl font-normal">%</span>
                </p>
              </div>
              <div className="text-5xl">
                {result.score >= 80 ? "🏆" : result.score >= 50 ? "⚠️" : "❌"}
              </div>
            </div>
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  result.score >= 80
                    ? "bg-green-500"
                    : result.score >= 50
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${result.score}%` }}
              />
            </div>
          </Card>

          {/* Wrong Items */}
          {result.wrong_items && result.wrong_items.length > 0 && (
            <Card>
              <p className="text-sm font-semibold text-gray-700 mb-3">
                ⚠️ Items Found in Wrong Bin
              </p>
              <ul className="space-y-2">
                {result.wrong_items.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-sm text-gray-600"
                  >
                    <span className="text-red-500 mt-0.5">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Improvement Steps */}
          {result.improvement_steps && result.improvement_steps.length > 0 && (
            <Card>
              <p className="text-sm font-semibold text-gray-700 mb-3">
                💡 How to Improve
              </p>
              <ol className="space-y-2">
                {result.improvement_steps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="bg-indigo-100 text-indigo-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </Card>
          )}

          {/* Summary */}
          {result.summary && (
            <Card>
              <p className="text-sm font-semibold text-gray-700 mb-2">
                📋 AI Summary
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                {result.summary}
              </p>
            </Card>
          )}

          <button
            onClick={() => {
              setPhoto(null);
              setPhotoPreview(null);
              setResult(null);
            }}
            className="w-full py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
          >
            Check Another Photo
          </button>
        </div>
      )}
    </div>
  );
}