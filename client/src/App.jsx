import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/ui/Footer";

import Landing from "./pages/Landing";

// Auth
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import AnomalyCenter from "./pages/admin/AnomalyCentre";
import WorkerList from "./pages/admin/WorkerList";
import ContractorList from "./pages/admin/ContractorList";
import MapView from "./pages/admin/Mapview";
import ComplaintQueue from "./pages/admin/ComplaintQueue";
import BatchMonitor from "./pages/admin/BatchMonitor";
import ZoneManager from "./pages/admin/ZoneManager";
import WeeklyReport from "./pages/admin/WeeklyReport";
import SettingsPage from "./pages/admin/Settings";
import ContractorDetail from "./pages/admin/ContractorDetail";

// ✅ FIXED (WAS MISSING)
import WorkerDetail from "./pages/admin/WorkerDetail";

// Citizen
import CitizenLayout from "./pages/citizen/CitizenLayout";
import CitizenHome from "./pages/citizen/CitizenHome";
import ReportWaste from "./pages/citizen/ReportWaste";
import TrackBatch from "./pages/citizen/TrackBatch";
import TrackComplaint from "./pages/citizen/TrackComplaint";
import SegregationCheck from "./pages/citizen/SegregationCheck";
import MyProfile from "./pages/citizen/MyProfile";
import ApproveResolution from "./pages/citizen/ApproveResolution";

// Contractor
import ContractorLayout from "./pages/contractor/ContractorLayout";
import ContractorHome from "./pages/contractor/ContractorHome";
import WorkerManage from "./pages/contractor/WorkerManage";
import BatchOverview from "./pages/contractor/BatchOverview";
import ComplaintPanel from "./pages/contractor/ComplaintPanel";
import PerformanceReport from "./pages/contractor/PerformanceReport";
import MyScore from "./pages/contractor/MyScore";

// Worker
import WorkerLayout from "./pages/worker/WorkerLayout";
import WorkerHome from "./pages/worker/WorkerHome";
import RouteView from "./pages/worker/RouteView";
import StopDetail from "./pages/worker/StopDetail";
import GenerateQRPage from "./pages/worker/GenerateQRPage";
import WorkerScore from "./pages/worker/MyScore";
import ComplaintAssigned from "./pages/worker/ComplaintAssigned";
import ClearComplaint from "./pages/worker/ClearComplaint";

function App() {
  return (
    <div className="bg-gray-950 min-h-screen text-white">
      <Header />

      <Routes>

        {/* ---------------- LANDING ---------------- */}
        <Route
          path="/"
          element={
            <>
              <Landing />
              <Footer />
            </>
          }
        />

        {/* ---------------- AUTH ---------------- */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* ---------------- ADMIN ---------------- */}
        <Route path="/adminDashboard" element={<AdminDashboard />} />
        <Route path="/adminDashboard/anomaly-center" element={<AnomalyCenter />} />
        <Route path="/adminDashboard/map-view" element={<MapView />} />
        <Route path="/adminDashboard/contractors" element={<ContractorList />} />
        <Route path="/adminDashboard/contractors/:id" element={<ContractorDetail />} />
        <Route path="/adminDashboard/workers" element={<WorkerList />} />
        <Route path="/adminDashboard/workers/:id" element={<WorkerDetail />} />

        {/* ✅ ADDED MISSING ROUTES (YOU IMPORTED THEM BUT DIDN’T USE) */}
        <Route path="/adminDashboard/complaints" element={<ComplaintQueue />} />
        <Route path="/adminDashboard/batch-monitor" element={<BatchMonitor />} />
        <Route path="/adminDashboard/zones" element={<ZoneManager />} />
        <Route path="/adminDashboard/reports" element={<WeeklyReport />} />
        <Route path="/adminDashboard/settings" element={<SettingsPage />} />

        {/* ---------------- CITIZEN ---------------- */}
        <Route path="/citizen" element={<CitizenLayout />}>
          <Route index element={<CitizenHome />} />
          <Route path="report" element={<ReportWaste />} />
          <Route path="track-batch" element={<TrackBatch />} />
          <Route path="track-complaint" element={<TrackComplaint />} />
          <Route path="segregation" element={<SegregationCheck />} />
          <Route path="profile" element={<MyProfile />} />
          <Route path="approve" element={<ApproveResolution />} />
        </Route>

        {/* ---------------- CONTRACTOR ---------------- */}
        <Route path="/contractor" element={<ContractorLayout />}>
          <Route index element={<ContractorHome />} />
          <Route path="workers" element={<WorkerManage />} />
          <Route path="batches" element={<BatchOverview />} />
          <Route path="complaints" element={<ComplaintPanel />} />
          <Route path="performance" element={<PerformanceReport />} />
          <Route path="score" element={<MyScore />} />
        </Route>

        {/* ---------------- WORKER ---------------- */}
        <Route path="/worker" element={<WorkerLayout />}>
          <Route index element={<WorkerHome />} />
          <Route path="route" element={<RouteView />} />
          <Route path="stop" element={<StopDetail />} />
          <Route path="qr" element={<GenerateQRPage />} />
          <Route path="complaints" element={<ComplaintAssigned />} />
          <Route path="clear" element={<ClearComplaint />} />
          <Route path="score" element={<WorkerScore />} />
        </Route>

        {/* ---------------- FALLBACK (IMPORTANT) ---------------- */}
        <Route
          path="*"
          element={
            <div className="flex items-center justify-center h-screen text-gray-400">
              404 | Page Not Found
            </div>
          }
        />

      </Routes>
    </div>
  );
}

export default App;