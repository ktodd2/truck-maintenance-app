import { Link } from 'react-router-dom'
import { Truck, ChevronRight, AlertTriangle, CheckCircle } from 'lucide-react'
import { formatNumber } from '../utils/csvExport'

export default function TruckCard({ truck, alertCount = 0 }) {
  return (
    <Link
      to={`/trucks/${truck.id}`}
      className="block bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow active:bg-gray-50"
    >
      <div className="flex items-center gap-4">
        <div className={`
          w-12 h-12 rounded-xl flex items-center justify-center
          ${alertCount > 0 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}
        `}>
          <Truck size={24} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 truncate">{truck.truckNumber}</h3>
            {alertCount > 0 ? (
              <span className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                <AlertTriangle size={12} />
                {alertCount}
              </span>
            ) : (
              <CheckCircle size={16} className="text-green-500" />
            )}
          </div>
          <p className="text-sm text-gray-500 truncate">
            {truck.year} {truck.make} {truck.model}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {formatNumber(truck.currentMileage)} mi
          </p>
        </div>

        <ChevronRight size={20} className="text-gray-400" />
      </div>
    </Link>
  )
}
