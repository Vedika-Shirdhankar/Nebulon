import React from "react";
import { Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Footer from "./components/ui/Footer";

// Auth
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import AnomalyCenter from "./pages/admin/AnomalyCentre";
import MapView from "./pages/admin/Mapview";
import ContractorDetail from "./pages/admin/ContractorDetail";
import ContractorList from "./pages/admin/ContractorList";
import WorkerDetail from "./pages/admin/WorkerDetail";
import WorkerList from "./pages/admin/WorkerList";

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
import GenerateQRPage from "./pages/worker/GenerateQRPage"; // ✅ FIXED NAME
import WorkerScore from "./pages/worker/MyScore";
import ComplaintAssigned from "./pages/worker/ComplaintAssigned";
import ClearComplaint from "./pages/worker/ClearComplaint";

function App() {
  return (
    <div className="bg-gray-950 min-h-screen selection:bg-green-500/30">

      <Routes>

        {/* Landing */}
        <Route
          path="/"
          element={
            <>
              <Landing />
              <Footer />
            </>
          }
        />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Admin */}
        <Route path="/adminDashboard" element={<AdminDashboard />} />
        <Route path="/adminDashboard/anomaly-center" element={<AnomalyCenter />} />
        <Route path="/adminDashboard/map-view" element={<MapView />} />
        <Route path="/adminDashboard/contractors" element={<ContractorList />} />
        <Route path="/adminDashboard/contractors/:id" element={<ContractorDetail />} />
        <Route path="/adminDashboard/workers" element={<WorkerList />} />
        <Route path="/adminDashboard/workers/:id" element={<WorkerDetail />} />

        {/* Contractor */}
        <Route path="/contractor" element={<ContractorLayout />}>
          <Route index element={<ContractorHome />} />
          <Route path="workers" element={<WorkerManage />} />
          <Route path="batches" element={<BatchOverview />} />
          <Route path="complaints" element={<ComplaintPanel />} />
          <Route path="performance" element={<PerformanceReport />} />
          <Route path="score" element={<MyScore />} />
        </Route>

      <Route path="/worker" element={<WorkerLayout />}>
  <Route index element={<WorkerHome />} />
  <Route path="route" element={<RouteView />} />
  <Route path="stop" element={<StopDetail />} />
  <Route path="qr" element={<GenerateQRPage />} />
  <Route path="complaints" element={<ComplaintAssigned />} />
  <Route path="clear" element={<ClearComplaint />} />
  <Route path="score" element={<WorkerScore />} />
</Route>

      </Routes>

    </div>
  );
}

export default App;