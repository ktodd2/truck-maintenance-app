import { useMemo, useState } from 'react'
import { useTrucks } from '../hooks/useTrucks'
import { useMaintenance } from '../hooks/useMaintenance'
import { formatCurrency } from '../utils/csvExport'
import { CATEGORIES } from '../db/database'
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { TrendingUp, DollarSign, Truck, Wrench } from 'lucide-react'

const CHART_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

export default function Analytics() {
  const { trucks } = useTrucks()
  const { records } = useMaintenance()
  const [timeRange, setTimeRange] = useState('all')

  const filteredRecords = useMemo(() => {
    if (timeRange === 'all') return records

    const now = new Date()
    let startDate

    switch (timeRange) {
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'quarter':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default:
        return records
    }

    return records.filter(r => new Date(r.date) >= startDate)
  }, [records, timeRange])

  const stats = useMemo(() => {
    const totalCost = filteredRecords.reduce((sum, r) => sum + (r.cost || 0), 0)
    const avgCost = filteredRecords.length > 0 ? totalCost / filteredRecords.length : 0

    return {
      totalCost,
      avgCost,
      totalServices: filteredRecords.length,
      trucksServiced: new Set(filteredRecords.map(r => r.truckId)).size
    }
  }, [filteredRecords])

  const costByCategory = useMemo(() => {
    const categoryTotals = {}
    filteredRecords.forEach(record => {
      const cat = record.category || 'other'
      categoryTotals[cat] = (categoryTotals[cat] || 0) + (record.cost || 0)
    })

    return CATEGORIES
      .filter(cat => categoryTotals[cat.id] > 0)
      .map((cat, index) => ({
        name: cat.label,
        value: categoryTotals[cat.id] || 0,
        color: CHART_COLORS[index % CHART_COLORS.length]
      }))
      .sort((a, b) => b.value - a.value)
  }, [filteredRecords])

  const costByTruck = useMemo(() => {
    const truckTotals = {}
    filteredRecords.forEach(record => {
      truckTotals[record.truckId] = (truckTotals[record.truckId] || 0) + (record.cost || 0)
    })

    return trucks
      .filter(truck => truckTotals[truck.id] > 0)
      .map(truck => ({
        name: truck.truckNumber,
        cost: truckTotals[truck.id] || 0
      }))
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 10)
  }, [filteredRecords, trucks])

  const costOverTime = useMemo(() => {
    const monthlyTotals = {}
    filteredRecords.forEach(record => {
      const date = new Date(record.date)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      monthlyTotals[key] = (monthlyTotals[key] || 0) + (record.cost || 0)
    })

    return Object.entries(monthlyTotals)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, cost]) => {
        const [year, m] = month.split('-')
        const date = new Date(parseInt(year), parseInt(m) - 1)
        return {
          month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          cost
        }
      })
  }, [filteredRecords])

  return (
    <div className="p-4 space-y-6 pb-8">
      <header className="pt-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Time</option>
          <option value="year">This Year</option>
          <option value="quarter">Last 3 Months</option>
          <option value="month">This Month</option>
        </select>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <DollarSign size={16} />
            <span className="text-xs font-medium">Total Spent</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalCost)}</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <TrendingUp size={16} />
            <span className="text-xs font-medium">Avg. Service</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.avgCost)}</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Wrench size={16} />
            <span className="text-xs font-medium">Services</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{stats.totalServices}</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Truck size={16} />
            <span className="text-xs font-medium">Trucks Serviced</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{stats.trucksServiced}</p>
        </div>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
          <p className="text-gray-500">No data to display for this time period</p>
        </div>
      ) : (
        <>
          {/* Cost Over Time */}
          {costOverTime.length > 1 && (
            <section className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Spending Over Time</h2>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={costOverTime}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" tickFormatter={(v) => `$${v}`} />
                    <Tooltip
                      formatter={(value) => [formatCurrency(value), 'Cost']}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    />
                    <Line type="monotone" dataKey="cost" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}

          {/* Cost by Category */}
          {costByCategory.length > 0 && (
            <section className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Cost by Category</h2>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={costByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {costByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {costByCategory.slice(0, 6).map((cat, index) => (
                  <span key={index} className="inline-flex items-center gap-1.5 text-xs text-gray-600">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    {cat.name}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Cost by Truck */}
          {costByTruck.length > 0 && (
            <section className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Trucks by Cost</h2>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={costByTruck} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9ca3af" tickFormatter={(v) => `$${v}`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" width={60} />
                    <Tooltip
                      formatter={(value) => [formatCurrency(value), 'Cost']}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    />
                    <Bar dataKey="cost" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
