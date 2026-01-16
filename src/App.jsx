import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import TruckList from './pages/TruckList'
import TruckDetail from './pages/TruckDetail'
import AddTruck from './pages/AddTruck'
import AddMaintenance from './pages/AddMaintenance'
import Timeline from './pages/Timeline'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import { Loader2 } from 'lucide-react'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 size={32} className="animate-spin text-blue-500" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 size={32} className="animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
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
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
