import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useGeolocation } from "../../hooks/useGeolocation";
import axiosInstance from "../../lib/axios";
import Card from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const WASTE_TYPES = [
  { value: "PLASTIC", label: "Plastic", icon: "🧴" },
  { value: "ORGANIC", label: "Organic", icon: "🍃" },
  { value: "PAPER", label: "Paper", icon: "📄" },
  { value: "E_WASTE", label: "E-Waste", icon: "🔋" },
  { value: "MIXED", label: "Mixed", icon: "🗑️" },
];

export default function ReportWaste() {
  const navigate = useNavigate();
  const { location, error: gpsError, loading: gpsLoading } = useGeolocation();
  const fileRef = useRef(null);

  const [wasteType, setWasteType] = useState("");
  const [notes, setNotes] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successModal, setSuccessModal] = useState({ open: false, data: null });
  const [error, setError] = useState("");

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!wasteType) return setError("Please select a waste type.");
    if (!photo) return setError("Please upload a photo.");
    if (!location && !gpsError) return setError("Waiting for GPS location...");

    setError("");
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("photo", photo);
      formData.append("waste_type", wasteType);
      formData.append("notes", notes);
      if (location) {
        formData.append("gps_lat", location.latitude);
        formData.append("gps_lng", location.longitude);
      }

      const res = await axiosInstance.post("/batch/citizen-create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccessModal({ open: true, data: res.data });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    navigate(`/citizen/track-batch/${successModal.data?.batch_id}`);
  };

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase italic">
            Report Waste
          </h1>
          <p className="text-gray-500 text-sm mt-1 font-mono uppercase tracking-widest">
            Submit your waste for tracked collection
          </p>
        </div>

        {/* GPS Status */}
        <div className="bg-gray-900/40 border border-white/5 rounded-2xl p-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              {gpsLoading ? (
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500" />
                </span>
              ) : location ? (
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                </span>
              ) : (
                <span className="relative flex h-3 w-3">
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-white uppercase tracking-wider">
                GPS Location
              </p>
              {gpsLoading && (
                <p className="text-xs text-gray-500 font-mono">Detecting location...</p>
              )}
              {location && (
                <p className="text-xs text-green-400 font-mono">
                  {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
                </p>
              )}
              {gpsError && (
                <p className="text-xs text-red-400 font-mono">
                  GPS unavailable — location won't be recorded
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Photo Upload */}
        <div className="bg-gray-900/40 border border-white/5 rounded-2xl p-5 backdrop-blur-sm">
          <p className="text-sm font-bold text-white uppercase tracking-widest mb-3">
            Photo of Waste <span className="text-blue-400">*</span>
          </p>
          <div
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all p-4 min-h-[160px] ${
              photoPreview
                ? "border-green-500/60 bg-green-500/5"
                : "border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5"
            }`}
          >
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Preview"
                className="max-h-48 rounded-lg object-cover"
              />
            ) : (
              <div className="text-center text-gray-500">
                <p className="text-3xl mb-2">📷</p>
                <p className="text-sm font-medium text-gray-400">Click to upload photo</p>
                <p className="text-xs mt-1 font-mono text-gray-600 uppercase tracking-widest">
                  JPG · PNG · up to 10MB
                </p>
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
              onClick={() => { setPhoto(null); setPhotoPreview(null); }}
              className="mt-2 text-xs text-red-400 hover:text-red-300 font-mono uppercase tracking-widest transition"
            >
              ✕ Remove photo
            </button>
          )}
        </div>

        {/* Waste Type */}
        <div className="bg-gray-900/40 border border-white/5 rounded-2xl p-5 backdrop-blur-sm">
          <p className="text-sm font-bold text-white uppercase tracking-widest mb-3">
            Waste Type <span className="text-blue-400">*</span>
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {WASTE_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => setWasteType(type.value)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                  wasteType === type.value
                    ? "border-blue-500 bg-blue-500/10 shadow-[0_0_16px_rgba(59,130,246,0.2)]"
                    : "border-white/5 hover:border-blue-500/40 hover:bg-blue-500/5"
                }`}
              >
                <span className="text-2xl">{type.icon}</span>
                <span className={`text-xs font-bold uppercase tracking-wider transition-colors ${
                  wasteType === type.value ? "text-blue-400" : "text-gray-500"
                }`}>
                  {type.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="bg-gray-900/40 border border-white/5 rounded-2xl p-5 backdrop-blur-sm">
          <p className="text-sm font-bold text-white uppercase tracking-widest mb-2">
            Additional Notes{" "}
            <span className="text-gray-600 font-normal normal-case tracking-normal">
              (optional)
            </span>
          </p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Bag is near the gate, extra large load..."
            rows={3}
            className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-sm text-gray-300 placeholder:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none transition"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
            <p className="text-sm text-red-400 font-mono">{error}</p>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all
            bg-gradient-to-r from-green-500 to-blue-500
            hover:from-green-400 hover:to-blue-400
            hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(59,130,246,0.25)]
            disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100
            text-black flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <LoadingSpinner size="sm" />
              Submitting...
            </>
          ) : (
            "Submit Waste Report →"
          )}
        </button>

        {/* Success Modal */}
        <Modal
          isOpen={successModal.open}
          onClose={handleSuccessClose}
          title="Waste Reported Successfully! 🎉"
        >
          <div className="space-y-4 p-2">
            <p className="text-sm text-gray-400 font-medium">
              Your waste batch has been created and a QR code has been generated.
              Show this to the collector.
            </p>

            {successModal.data?.qr_base64 && (
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 bg-white rounded-2xl shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                  <img
                    src={`data:image/png;base64,${successModal.data.qr_base64}`}
                    alt="Batch QR"
                    className="w-44 h-44"
                  />
                </div>
                <p className="text-xs font-mono text-gray-600 uppercase tracking-widest">
                  {successModal.data?.batch_id}
                </p>
              </div>
            )}

            <button
              onClick={handleSuccessClose}
              className="w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest
                bg-gradient-to-r from-green-500 to-blue-500
                hover:from-green-400 hover:to-blue-400
                text-black transition-all"
            >
              Track My Batch →
            </button>
          </div>
        </Modal>

      </div>
    </div>
  );
}