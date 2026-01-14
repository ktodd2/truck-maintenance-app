import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import TruckList from './pages/TruckList'
import TruckDetail from './pages/TruckDetail'
import AddTruck from './pages/AddTruck'
import AddMaintenance from './pages/AddMaintenance'
import Timeline from './pages/Timeline'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/trucks" element={<TruckList />} />
        <Route path="/trucks/:id" element={<TruckDetail />} />
        <Route path="/trucks/new" element={<AddTruck />} />
        <Route path="/trucks/:id/edit" element={<AddTruck />} />
        <Route path="/maintenance/new" element={<AddMaintenance />} />
        <Route path="/maintenance/new/:truckId" element={<AddMaintenance />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  )
}

export default App
