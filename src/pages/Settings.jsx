import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTrucks } from '../hooks/useTrucks'
import { useMaintenance } from '../hooks/useMaintenance'
import { useAuth } from '../context/AuthContext'
import { exportToCSV, formatCurrency } from '../utils/csvExport'
import { Download, LogOut, Database, Truck, FileText, Info, User } from 'lucide-react'

export default function Settings() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { trucks } = useTrucks()
  const { records } = useMaintenance()
  const [exportStatus, setExportStatus] = useState('')

  const handleExportAll = () => {
    const filename = `full-maintenance-export-${new Date().toISOString().split('T')[0]}.csv`
    exportToCSV(records, trucks, filename)
    setExportStatus('Export complete!')
    setTimeout(() => setExportStatus(''), 3000)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const totalCost = records.reduce((sum, r) => sum + (r.cost || 0), 0)

  return (
    <div className="p-4 space-y-6 pb-8">
      <header className="pt-2">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm">Manage your account and data</p>
      </header>

      {/* Account */}
      <section className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <User size={18} className="text-blue-500" />
          <h2 className="font-semibold text-gray-900">Account</h2>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-gray-100 mb-4">
          <span className="text-gray-600">Email</span>
          <span className="font-medium text-gray-900 text-sm">{user?.email}</span>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </section>

      {/* Data Summary */}
      <section className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Database size={18} className="text-blue-500" />
          <h2 className="font-semibold text-gray-900">Data Summary</h2>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center gap-2 text-gray-600">
              <Truck size={16} />
              <span>Total Trucks</span>
            </div>
            <span className="font-semibold text-gray-900">{trucks.length}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center gap-2 text-gray-600">
              <FileText size={16} />
              <span>Maintenance Records</span>
            </div>
            <span className="font-semibold text-gray-900">{records.length}</span>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-base">$</span>
              <span>Total Spent</span>
            </div>
            <span className="font-semibold text-gray-900">{formatCurrency(totalCost)}</span>
          </div>
        </div>
      </section>

      {/* Export */}
      <section className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <Download size={18} className="text-green-500" />
          <h2 className="font-semibold text-gray-900">Export Data</h2>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Download all your maintenance records as a CSV file for backup or analysis.
        </p>

        <button
          onClick={handleExportAll}
          disabled={records.length === 0}
          className="w-full flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-xl font-medium hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={18} />
          Export All Data to CSV
        </button>

        {exportStatus && (
          <p className="text-center text-green-600 text-sm mt-2">{exportStatus}</p>
        )}
      </section>

      {/* About */}
      <section className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <Info size={18} className="text-blue-500" />
          <h2 className="font-semibold text-gray-900">About</h2>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <p><strong>Fleet Maintenance Tracker</strong></p>
          <p>A mobile-first app for tracking truck maintenance, costs, and service history.</p>
          <p className="text-xs text-gray-400 mt-2">
            Your data syncs across all your devices automatically.
          </p>
        </div>
      </section>
    </div>
  )
}
