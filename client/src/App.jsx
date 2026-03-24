import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/ui/Footer";

import Landing from "./pages/Landing";

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

// Citizen
import CitizenLayout from "./pages/citizen/CitizenLayout";
import CitizenHome from "./pages/citizen/CitizenHome";
import ReportWaste from "./pages/citizen/ReportWaste";
import TrackBatch from "./pages/citizen/TrackBatch";
import TrackComplaint from "./pages/citizen/TrackComplaint";
import SegregationCheck from "./pages/citizen/SegregationCheck";
import MyProfile from "./pages/citizen/MyProfile";
import ApproveResolution from "./pages/citizen/ApproveResolution";

function App() {
  return (
    <div className="bg-gray-950 min-h-screen text-white">
      

      <Routes>
        <Route path="/" element={<Landing />} />

        {/* Admin */}
        <Route path="/admin" element={
  <>
    <Header />
    <AdminDashboard />
  </>
} />
        <Route path="/anomaly-center" element={
  <>
    <Header />
    <AnomalyCenter />
  </> } />
  <Route path="/worker-list" element={
  <>
    <Header />
    <WorkerList />
  </> } />
   <Route path="/contractor-list" element={
  <>
    <Header />
    <ContractorList />
  </> } />
         <Route path="/map-view" element={
  <>
    <Header />
    <MapView />
  </> } />
        <Route path="/complaint-queue" element={
  <>
    <Header />
    <ComplaintQueue />
  </> } />
   <Route path="/batch-monitor" element={
  <>
    <Header />
    <BatchMonitor />
  </> } />
         <Route path="/zone-manager" element={
  <>
    <Header />
    <ZoneManager />
  </> } />
   <Route path="/weekly-report" element={
  <>
    <Header />
    <WeeklyReport/>
  </> } />
        <Route path="/settings" element={
  <>
    <Header />
    <SettingsPage />
  </> } />
        

        {/* Citizen */}
        <Route path="/citizen" element={<CitizenLayout />}>
          <Route index element={<CitizenHome />} />
          <Route path="report" element={<ReportWaste />} />
          <Route path="track-batch/:batch_id" element={<TrackBatch />} />
          <Route path="track-complaint/:complaint_id" element={<TrackComplaint />} />
          <Route path="segregation-check" element={<SegregationCheck />} />
          <Route path="profile" element={<MyProfile />} />
          <Route path="approve/:complaint_id" element={<ApproveResolution />} />
        </Route>
      </Routes>

      <Footer />
    </div>
  );
}

export default App;