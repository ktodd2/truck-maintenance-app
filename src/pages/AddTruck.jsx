import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useTrucks } from '../hooks/useTrucks'
import { ArrowLeft, Save, Truck } from 'lucide-react'

export default function AddTruck() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { trucks, addTruck, updateTruck } = useTrucks()
  const isEditing = !!id

  const [form, setForm] = useState({
    truckNumber: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    vin: '',
    currentMileage: '',
    notes: ''
  })

  useEffect(() => {
    if (isEditing) {
      const truck = trucks.find(t => t.id === id)
      if (truck) {
        setForm({
          truckNumber: truck.truckNumber || '',
          make: truck.make || '',
          model: truck.model || '',
          year: truck.year || new Date().getFullYear(),
          vin: truck.vin || '',
          currentMileage: truck.currentMileage || '',
          notes: truck.notes || ''
        })
      }
    }
  }, [id, trucks, isEditing])

  const handleSubmit = async (e) => {
    e.preventDefault()

    const truckData = {
      ...form,
      year: parseInt(form.year) || new Date().getFullYear(),
      currentMileage: parseInt(form.currentMileage) || 0
    }

    if (isEditing) {
      await updateTruck(id, truckData)
      navigate(`/trucks/${id}`)
    } else {
      const newTruck = await addTruck(truckData)
      navigate(`/trucks/${newTruck.id}`)
    }
  }

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  return (
    <div className="p-4 space-y-4">
      <header className="pt-2 flex items-center gap-4">
        <Link
          to={isEditing ? `/trucks/${id}` : '/trucks'}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Truck' : 'Add Truck'}
        </h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Truck Number *
            </label>
            <input
              type="text"
              required
              value={form.truckNumber}
              onChange={handleChange('truckNumber')}
              placeholder="e.g., T-101"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Make
              </label>
              <input
                type="text"
                value={form.make}
                onChange={handleChange('make')}
                placeholder="e.g., Freightliner"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model
              </label>
              <input
                type="text"
                value={form.model}
                onChange={handleChange('model')}
                placeholder="e.g., Cascadia"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year
              </label>
              <input
                type="number"
                value={form.year}
                onChange={handleChange('year')}
                min="1900"
                max={new Date().getFullYear() + 1}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Mileage
              </label>
              <input
                type="number"
                value={form.currentMileage}
                onChange={handleChange('currentMileage')}
                placeholder="0"
                min="0"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              VIN (optional)
            </label>
            <input
              type="text"
              value={form.vin}
              onChange={handleChange('vin')}
              placeholder="Vehicle Identification Number"
              maxLength={17}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              value={form.notes}
              onChange={handleChange('notes')}
              placeholder="Any additional notes..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!form.truckNumber.trim()}
          className="flex items-center justify-center gap-2 w-full bg-blue-500 text-white py-4 rounded-xl font-semibold hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed active:scale-98"
        >
          <Save size={20} />
          {isEditing ? 'Save Changes' : 'Add Truck'}
        </button>
      </form>
    </div>
  )
}
