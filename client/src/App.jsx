import React from "react";
import { Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Footer from "./components/ui/Footer";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AnomalyCenter from "./pages/admin/AnomalyCentre";
import MapView from "./pages/admin/Mapview";
import ContractorDetail from "./pages/admin/ContractorDetail";
import ContractorList from "./pages/admin/ContractorList";
import WorkerDetail from "./pages/admin/WorkerDetail";
import WorkerList from "./pages/admin/WorkerList";

function App() {
  return (
    <div className="bg-gray-950 min-h-screen selection:bg-green-500/30">

      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<Landing />} />

        {/* Admin Routes */}
        <Route path="/adminDashboard" element={<AdminDashboard />} />
        <Route path="/anomaly-center" element={<AnomalyCenter />} />
        <Route path="/map-view" element={<MapView />} />
        <Route path="/contractor-detail" element={<ContractorDetail />} />
        <Route path="/contractor-list" element={<ContractorList />} />
        <Route path="/worker-detail" element={<WorkerDetail />} />
        <Route path="/worker-list" element={<WorkerList />} />
      </Routes>

      {/* Footer stays global */}
      <Footer />

    </div>
  );
}

export default App;