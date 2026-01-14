import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTrucks } from '../hooks/useTrucks'
import { useMaintenance } from '../hooks/useMaintenance'
import { formatCurrency, formatNumber, formatDate } from '../utils/csvExport'
import MaintenanceCard from '../components/MaintenanceCard'
import { ArrowLeft, Plus, Edit, Trash2, Truck, AlertTriangle } from 'lucide-react'
import { useState } from 'react'

export default function TruckDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { trucks, deleteTruck } = useTrucks()
  const { records } = useMaintenance(id)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const truck = trucks.find(t => t.id === id)

  if (!truck) {
    return (
      <div className="p-4">
        <div className="bg-white rounded-xl p-8 text-center">
          <Truck size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Truck not found</p>
          <Link to="/trucks" className="text-blue-500 font-medium mt-4 inline-block">
            Back to Fleet
          </Link>
        </div>
      </div>
    )
  }

  const totalCost = records.reduce((sum, r) => sum + (r.cost || 0), 0)

  const handleDelete = async () => {
    await deleteTruck(id)
    navigate('/trucks')
  }

  return (
    <div className="p-4 space-y-4">
      <header className="pt-2 flex items-center gap-4">
        <Link
          to="/trucks"
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{truck.truckNumber}</h1>
          <p className="text-gray-500 text-sm">{truck.year} {truck.make} {truck.model}</p>
        </div>
        <Link
          to={`/trucks/${id}/edit`}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition"
        >
          <Edit size={18} />
        </Link>
      </header>

      {/* Truck Info Card */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Current Mileage</p>
            <p className="text-lg font-semibold text-gray-900">{formatNumber(truck.currentMileage)} mi</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Total Spent</p>
            <p className="text-lg font-semibold text-gray-900">{formatCurrency(totalCost)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Services</p>
            <p className="text-lg font-semibold text-gray-900">{records.length}</p>
          </div>
          {truck.vin && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">VIN</p>
              <p className="text-sm font-mono text-gray-600 truncate">{truck.vin}</p>
            </div>
          )}
        </div>
        {truck.notes && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Notes</p>
            <p className="text-sm text-gray-600">{truck.notes}</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <Link
        to={`/maintenance/new/${id}`}
        className="flex items-center justify-center gap-2 w-full bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 transition active:scale-98"
      >
        <Plus size={20} />
        Log Maintenance
      </Link>

      {/* Maintenance History */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Maintenance History</h2>

        {records.length === 0 ? (
          <div className="bg-white rounded-xl p-6 text-center border border-gray-100">
            <p className="text-gray-500">No maintenance records yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map(record => (
              <MaintenanceCard key={record.id} record={record} />
            ))}
          </div>
        )}
      </section>

      {/* Delete Section */}
      <section className="pt-4">
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center justify-center gap-2 w-full text-red-500 py-3 rounded-xl font-medium border border-red-200 hover:bg-red-50 transition"
          >
            <Trash2 size={18} />
            Delete Truck
          </button>
        ) : (
          <div className="bg-red-50 rounded-xl p-4 border border-red-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="font-medium text-red-800">Delete this truck?</p>
                <p className="text-sm text-red-600 mt-1">
                  This will also delete {records.length} maintenance record{records.length !== 1 ? 's' : ''}.
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleDelete}
                    className="flex-1 bg-red-500 text-white py-2 rounded-lg font-medium hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 bg-white text-gray-700 py-2 rounded-lg font-medium border border-gray-200 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
