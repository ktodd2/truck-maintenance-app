import { useState } from 'react'
import { useTrucks } from '../hooks/useTrucks'
import { useMaintenance } from '../hooks/useMaintenance'
import { exportToCSV, formatCurrency, formatNumber } from '../utils/csvExport'
import { db } from '../db/database'
import { Download, Trash2, AlertTriangle, Database, Truck, FileText, Info } from 'lucide-react'

export default function Settings() {
  const { trucks } = useTrucks()
  const { records } = useMaintenance()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [exportStatus, setExportStatus] = useState('')

  const handleExportAll = () => {
    const filename = `full-maintenance-export-${new Date().toISOString().split('T')[0]}.csv`
    exportToCSV(records, trucks, filename)
    setExportStatus('Export complete!')
    setTimeout(() => setExportStatus(''), 3000)
  }

  const handleClearAllData = async () => {
    await db.trucks.clear()
    await db.maintenanceRecords.clear()
    await db.serviceReminders.clear()
    setShowDeleteConfirm(false)
  }

  const totalCost = records.reduce((sum, r) => sum + (r.cost || 0), 0)

  return (
    <div className="p-4 space-y-6 pb-8">
      <header className="pt-2">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm">Manage your data and preferences</p>
      </header>

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
            Data is stored locally on your device. For cloud sync and multi-device access, upgrade to the cloud version.
          </p>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="bg-white rounded-xl p-4 shadow-sm border border-red-200">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={18} className="text-red-500" />
          <h2 className="font-semibold text-red-600">Danger Zone</h2>
        </div>

        {!showDeleteConfirm ? (
          <>
            <p className="text-sm text-gray-500 mb-4">
              Permanently delete all data. This action cannot be undone.
            </p>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center justify-center gap-2 border border-red-300 text-red-600 py-3 rounded-xl font-medium hover:bg-red-50 transition"
            >
              <Trash2 size={18} />
              Clear All Data
            </button>
          </>
        ) : (
          <div className="bg-red-50 rounded-lg p-4">
            <p className="font-medium text-red-800 mb-2">Are you sure?</p>
            <p className="text-sm text-red-600 mb-4">
              This will permanently delete {trucks.length} truck{trucks.length !== 1 ? 's' : ''} and {records.length} maintenance record{records.length !== 1 ? 's' : ''}.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleClearAllData}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg font-medium hover:bg-red-600 transition"
              >
                Yes, Delete Everything
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-white text-gray-700 py-2 rounded-lg font-medium border border-gray-200 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
