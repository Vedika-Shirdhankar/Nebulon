import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";

import Landing from "./pages/Landing";
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
function App() {
  return (
    <div className="bg-gray-950 min-h-screen text-white">

      {/* ✅ GLOBAL HEADER */}
      <Header />

      {/* ✅ ROUTES */}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/anomaly-center" element={<AnomalyCenter />} />
        <Route path="/worker-list" element={<WorkerList />} />
        <Route path="/contractor-list" element={<ContractorList />} />
        <Route path="/map-view" element={<MapView />} />
       <Route path="/complaint-queue" element={<ComplaintQueue />} />
        <Route path="/batch-monitor" element={<BatchMonitor />} />
        <Route path="/zone-manager" element={<ZoneManager />} />
        <Route path="/weekly-report" element={<WeeklyReport />} />
        <Route path="/settings" element={<SettingsPage />} /> 
      </Routes>

    </div>
  );
}

export default App;