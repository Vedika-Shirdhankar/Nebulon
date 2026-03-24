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
  const [successModal, setSuccessModal] = useState({
    open: false,
    data: null,
  });
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
    if (!location && !gpsError)
      return setError("Waiting for GPS location...");

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
      setError(
        err.response?.data?.message || "Failed to submit. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    navigate(`/citizen/track-batch/${successModal.data?.batch_id}`);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Report Waste</h1>
        <p className="text-gray-500 text-sm mt-1">
          Submit your waste for tracked collection
        </p>
      </div>

      {/* GPS Status */}
      <Card>
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${
              gpsLoading
                ? "bg-yellow-400 animate-pulse"
                : location
                ? "bg-green-500"
                : "bg-red-400"
            }`}
          />
          <div>
            <p className="text-sm font-medium text-gray-700">GPS Location</p>
            {gpsLoading && (
              <p className="text-xs text-gray-400">Detecting location...</p>
            )}
            {location && (
              <p className="text-xs text-gray-400">
                {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
              </p>
            )}
            {gpsError && (
              <p className="text-xs text-red-500">
                GPS unavailable — location won't be recorded
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Photo Upload */}
      <Card>
        <p className="text-sm font-semibold text-gray-700 mb-3">
          Photo of Waste <span className="text-red-500">*</span>
        </p>
        <div
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition ${
            photoPreview
              ? "border-green-400"
              : "border-gray-300 hover:border-indigo-400"
          } p-4 min-h-[160px]`}
        >
          {photoPreview ? (
            <img
              src={photoPreview}
              alt="Preview"
              className="max-h-48 rounded-lg object-cover"
            />
          ) : (
            <div className="text-center text-gray-400">
              <p className="text-3xl mb-2">📷</p>
              <p className="text-sm">Click to upload photo</p>
              <p className="text-xs mt-1">JPG, PNG up to 10MB</p>
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
            }}
            className="mt-2 text-xs text-red-500 hover:underline"
          >
            Remove photo
          </button>
        )}
      </Card>

      {/* Waste Type */}
      <Card>
        <p className="text-sm font-semibold text-gray-700 mb-3">
          Waste Type <span className="text-red-500">*</span>
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {WASTE_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setWasteType(type.value)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition ${
                wasteType === type.value
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-200 hover:border-indigo-300"
              }`}
            >
              <span className="text-2xl">{type.icon}</span>
              <span className="text-xs font-medium text-gray-700">
                {type.label}
              </span>
            </button>
          ))}
        </div>
      </Card>

      {/* Notes */}
      <Card>
        <p className="text-sm font-semibold text-gray-700 mb-2">
          Additional Notes{" "}
          <span className="text-gray-400 font-normal">(optional)</span>
        </p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Bag is near the gate, extra large load..."
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
        />
      </Card>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <LoadingSpinner size="sm" />
            Submitting...
          </>
        ) : (
          "Submit Waste Report"
        )}
      </button>

      {/* Success Modal */}
      <Modal
        isOpen={successModal.open}
        onClose={handleSuccessClose}
        title="Waste Reported Successfully! 🎉"
      >
        <div className="space-y-4 p-2">
          <p className="text-sm text-gray-600">
            Your waste batch has been created and a QR code has been generated.
            Show this to the collector.
          </p>
          {successModal.data?.qr_base64 && (
            <div className="flex flex-col items-center gap-2">
              <img
                src={`data:image/png;base64,${successModal.data.qr_base64}`}
                alt="Batch QR"
                className="w-48 h-48 border rounded-xl"
              />
              <p className="text-xs font-mono text-gray-400">
                {successModal.data?.batch_id}
              </p>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <button
              onClick={handleSuccessClose}
              className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
            >
              Track My Batch →
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}