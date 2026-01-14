import { useState, useMemo } from 'react'
import { useTrucks } from '../hooks/useTrucks'
import { useMaintenance } from '../hooks/useMaintenance'
import MaintenanceCard from '../components/MaintenanceCard'
import { CATEGORIES } from '../db/database'
import { Search, Filter, X, Download } from 'lucide-react'
import { exportToCSV } from '../utils/csvExport'

export default function Timeline() {
  const { trucks } = useTrucks()
  const { records } = useMaintenance()
  const [search, setSearch] = useState('')
  const [filterTruck, setFilterTruck] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const truckMap = useMemo(() => {
    return trucks.reduce((acc, t) => {
      acc[t.id] = t
      return acc
    }, {})
  }, [trucks])

  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const truck = truckMap[record.truckId]
      const matchesSearch = !search ||
        record.description?.toLowerCase().includes(search.toLowerCase()) ||
        truck?.truckNumber?.toLowerCase().includes(search.toLowerCase()) ||
        record.serviceProvider?.toLowerCase().includes(search.toLowerCase())

      const matchesTruck = !filterTruck || record.truckId === filterTruck
      const matchesCategory = !filterCategory || record.category === filterCategory

      return matchesSearch && matchesTruck && matchesCategory
    })
  }, [records, truckMap, search, filterTruck, filterCategory])

  const groupedRecords = useMemo(() => {
    const groups = {}
    filteredRecords.forEach(record => {
      const date = new Date(record.date)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

      if (!groups[key]) {
        groups[key] = { label, records: [] }
      }
      groups[key].records.push(record)
    })

    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([_, group]) => group)
  }, [filteredRecords])

  const hasActiveFilters = filterTruck || filterCategory

  const handleExport = () => {
    const filename = `maintenance-export-${new Date().toISOString().split('T')[0]}.csv`
    exportToCSV(filteredRecords, trucks, filename)
  }

  const clearFilters = () => {
    setFilterTruck('')
    setFilterCategory('')
    setSearch('')
  }

  return (
    <div className="p-4 space-y-4">
      <header className="pt-2 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Timeline</h1>
          <p className="text-gray-500 text-sm">{filteredRecords.length} record{filteredRecords.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={handleExport}
          disabled={filteredRecords.length === 0}
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl font-medium hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={18} />
          CSV
        </button>
      </header>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search records..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-12 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-lg transition ${
            hasActiveFilters ? 'bg-blue-500 text-white' : 'text-gray-400 hover:bg-gray-100'
          }`}
        >
          <Filter size={18} />
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Filters</span>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-500 font-medium flex items-center gap-1"
              >
                <X size={14} />
                Clear all
              </button>
            )}
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Truck</label>
            <select
              value={filterTruck}
              onChange={(e) => setFilterTruck(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">All Trucks</option>
              {trucks.map(truck => (
                <option key={truck.id} value={truck.id}>{truck.truckNumber}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Active Filter Pills */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filterTruck && (
            <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
              {truckMap[filterTruck]?.truckNumber}
              <button onClick={() => setFilterTruck('')} className="hover:bg-blue-200 rounded-full p-0.5">
                <X size={14} />
              </button>
            </span>
          )}
          {filterCategory && (
            <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
              {CATEGORIES.find(c => c.id === filterCategory)?.label}
              <button onClick={() => setFilterCategory('')} className="hover:bg-blue-200 rounded-full p-0.5">
                <X size={14} />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Records */}
      {filteredRecords.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
          <p className="text-gray-500">
            {records.length === 0
              ? 'No maintenance records yet'
              : 'No records match your filters'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedRecords.map(group => (
            <section key={group.label}>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {group.label}
              </h2>
              <div className="space-y-3">
                {group.records.map(record => (
                  <MaintenanceCard
                    key={record.id}
                    record={record}
                    showTruck
                    truckNumber={truckMap[record.truckId]?.truckNumber}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
