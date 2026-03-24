import { useState } from 'react'
import AdminDashboard from './pages/admin/AdminDashboard'
import AnomalyCenter from './pages/admin/AnomalyCentre'
import MapView from './pages/admin/Mapview'
import ContractorDetail from './pages/admin/ContractorDetail'
import ContractorList from './pages/admin/ContractorList'
import WorkerDetail from './pages/admin/WorkerDetail'
import WorkerList from './pages/admin/WorkerList'

import './App.css'
import { Routes, Route } from 'react-router-dom'   // ✅ import Routes also

function App() {
  return (
    <Routes>   {/* ✅ THIS IS WHAT YOU MISSED */}
      <Route path="/AdminDashboard" element={<AdminDashboard />} />
      <Route path="/anomaly-center" element={<AnomalyCenter />} />
      <Route path="/map-view" element={<MapView />} />
      <Route path="/contractor-detail" element={<ContractorDetail />} />
      <Route path="/contractor-list" element={<ContractorList />} />
      <Route path="/worker-detail" element={<WorkerDetail />} />
      <Route path="/worker-list" element={<WorkerList />} />
    </Routes>
  )
}

export default App