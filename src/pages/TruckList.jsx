import { Link } from 'react-router-dom'
import { useTrucks } from '../hooks/useTrucks'
import { useMaintenance } from '../hooks/useMaintenance'
import { useReminders } from '../hooks/useReminders'
import TruckCard from '../components/TruckCard'
import { Plus, Truck, Search } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function TruckList() {
  const { trucks } = useTrucks()
  const { records } = useMaintenance()
  const { checkDueServices } = useReminders()
  const [search, setSearch] = useState('')
  const [alertCounts, setAlertCounts] = useState({})

  useEffect(() => {
    if (trucks.length > 0) {
      checkDueServices(trucks, records).then(dueServices => {
        const counts = {}
        dueServices.forEach(s => {
          if (s.status === 'overdue' || s.status === 'soon') {
            counts[s.truckId] = (counts[s.truckId] || 0) + 1
          }
        })
        setAlertCounts(counts)
      })
    }
  }, [trucks, records])

  const filteredTrucks = trucks.filter(truck =>
    truck.truckNumber.toLowerCase().includes(search.toLowerCase()) ||
    truck.make?.toLowerCase().includes(search.toLowerCase()) ||
    truck.model?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-4 space-y-4">
      <header className="pt-2 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fleet</h1>
          <p className="text-gray-500 text-sm">{trucks.length} truck{trucks.length !== 1 ? 's' : ''}</p>
        </div>
        <Link
          to="/trucks/new"
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-600 transition active:scale-95"
        >
          <Plus size={18} />
          Add
        </Link>
      </header>

      {trucks.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search trucks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}

      {trucks.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center border border-gray-100 mt-8">
          <Truck size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No Trucks Yet</h2>
          <p className="text-gray-500 mb-6">Add your first truck to start tracking maintenance</p>
          <Link
            to="/trucks/new"
            className="inline-flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-600 transition"
          >
            <Plus size={20} />
            Add Your First Truck
          </Link>
        </div>
      ) : filteredTrucks.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
          <Search size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No trucks match "{search}"</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTrucks.map(truck => (
            <TruckCard
              key={truck.id}
              truck={truck}
              alertCount={alertCounts[truck.id] || 0}
            />
          ))}
        </div>
      )}
    </div>
  )
}
