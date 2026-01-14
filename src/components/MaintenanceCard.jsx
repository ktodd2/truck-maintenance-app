import { formatDate, formatCurrency, formatNumber } from '../utils/csvExport'
import CategoryBadge from './CategoryBadge'
import { Camera } from 'lucide-react'

export default function MaintenanceCard({ record, showTruck = false, truckNumber }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <CategoryBadge category={record.category} size="sm" />
            {showTruck && truckNumber && (
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                {truckNumber}
              </span>
            )}
          </div>

          <p className="mt-2 text-gray-900 font-medium line-clamp-2">
            {record.description || 'No description'}
          </p>

          <div className="mt-2 flex items-center gap-3 text-sm text-gray-500">
            <span>{formatDate(record.date)}</span>
            <span>•</span>
            <span>{formatNumber(record.mileageAtService)} mi</span>
            {record.photos?.length > 0 && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Camera size={14} />
                  {record.photos.length}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="text-right">
          <p className="font-semibold text-gray-900">{formatCurrency(record.cost)}</p>
          {(record.partsCost || record.laborCost) && (
            <p className="text-xs text-gray-400 mt-0.5">
              {record.partsCost ? `Parts: ${formatCurrency(record.partsCost)}` : ''}
              {record.partsCost && record.laborCost ? ' · ' : ''}
              {record.laborCost ? `Labor: ${formatCurrency(record.laborCost)}` : ''}
            </p>
          )}
        </div>
      </div>

      {record.serviceProvider && (
        <p className="mt-2 text-xs text-gray-400">
          Service by: {record.serviceProvider}
        </p>
      )}

      {record.notes && (
        <p className="mt-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-2 line-clamp-2">
          {record.notes}
        </p>
      )}
    </div>
  )
}
