import { Link } from 'react-router-dom'
import { useTrucks } from '../hooks/useTrucks'
import { useMaintenance } from '../hooks/useMaintenance'
import { useReminders } from '../hooks/useReminders'
import { formatCurrency, formatNumber } from '../utils/csvExport'
import { AlertTriangle, Truck, DollarSign, Wrench, ChevronRight, Plus } from 'lucide-react'
import { useState, useEffect } from 'react'
import CategoryBadge from '../components/CategoryBadge'

export default function Dashboard() {
  const { trucks } = useTrucks()
  const { records, getTotalCost, getRecordsByDateRange } = useMaintenance()
  const { checkDueServices } = useReminders()
  const [dueServices, setDueServices] = useState([])

  useEffect(() => {
    if (trucks.length > 0) {
      checkDueServices(trucks, records).then(setDueServices)
    }
  }, [trucks, records])

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthRecords = records.filter(r => new Date(r.date) >= startOfMonth)
  const monthCost = monthRecords.reduce((sum, r) => sum + (r.cost || 0), 0)

  const overdueCount = dueServices.filter(s => s.status === 'overdue').length
  const soonCount = dueServices.filter(s => s.status === 'soon').length

  return (
    <div className="p-4 space-y-6">
      <header className="pt-2">
        <h1 className="text-2xl font-bold text-gray-900">Fleet Overview</h1>
        <p className="text-gray-500 text-sm mt-1">
          {trucks.length} truck{trucks.length !== 1 ? 's' : ''} in fleet
        </p>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Truck size={16} />
            <span className="text-xs font-medium">Total Trucks</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{trucks.length}</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <DollarSign size={16} />
            <span className="text-xs font-medium">This Month</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(monthCost)}</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Wrench size={16} />
            <span className="text-xs font-medium">Total Services</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{records.length}</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <DollarSign size={16} />
            <span className="text-xs font-medium">All Time</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(getTotalCost())}</p>
        </div>
      </div>

      {/* Alerts Section */}
      {(overdueCount > 0 || soonCount > 0) && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="text-amber-500" size={20} />
            Service Alerts
          </h2>
          <div className="space-y-2">
            {dueServices.slice(0, 5).map((service, i) => (
              <Link
                key={i}
                to={`/trucks/${service.truckId}`}
                className={`
                  block rounded-xl p-3 border
                  ${service.status === 'overdue'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-amber-50 border-amber-200'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{service.truckNumber}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <CategoryBadge category={service.category} size="sm" />
                      <span className={`text-xs font-medium ${
                        service.status === 'overdue' ? 'text-red-600' : 'text-amber-600'
                      }`}>
                        {service.dueIn || 'Check needed'}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recent Activity */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <Link to="/timeline" className="text-blue-500 text-sm font-medium">
            View all
          </Link>
        </div>

        {records.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
            <Wrench size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 mb-4">No maintenance records yet</p>
            <Link
              to="/maintenance/new"
              className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition"
            >
              <Plus size={18} />
              Add First Record
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {records.slice(0, 3).map(record => {
              const truck = trucks.find(t => t.id === record.truckId)
              return (
                <div key={record.id} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{truck?.truckNumber || 'Unknown'}</p>
                      <CategoryBadge category={record.category} size="sm" />
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(record.cost)}</p>
                      <p className="text-xs text-gray-400">{formatNumber(record.mileageAtService)} mi</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Quick Actions */}
      {trucks.length === 0 && (
        <section>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <h2 className="text-lg font-semibold mb-2">Get Started</h2>
            <p className="text-blue-100 text-sm mb-4">
              Add your first truck to start tracking maintenance
            </p>
            <Link
              to="/trucks/new"
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition"
            >
              <Plus size={18} />
              Add Truck
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}
