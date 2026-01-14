import { useState, useRef } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useTrucks } from '../hooks/useTrucks'
import { useMaintenance } from '../hooks/useMaintenance'
import { CATEGORIES } from '../db/database'
import { ArrowLeft, Save, Camera, X, ChevronDown } from 'lucide-react'
import * as Icons from 'lucide-react'

export default function AddMaintenance() {
  const navigate = useNavigate()
  const { truckId: preselectedTruckId } = useParams()
  const { trucks } = useTrucks()
  const { addRecord } = useMaintenance()
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({
    truckId: preselectedTruckId || '',
    date: new Date().toISOString().split('T')[0],
    mileageAtService: '',
    category: '',
    description: '',
    cost: '',
    partsCost: '',
    laborCost: '',
    serviceProvider: '',
    notes: '',
    photos: []
  })

  const [showCategoryPicker, setShowCategoryPicker] = useState(false)

  const selectedTruck = trucks.find(t => t.id === form.truckId)

  const handleSubmit = async (e) => {
    e.preventDefault()

    await addRecord({
      ...form,
      mileageAtService: parseInt(form.mileageAtService) || 0,
      cost: parseFloat(form.cost) || 0,
      partsCost: parseFloat(form.partsCost) || 0,
      laborCost: parseFloat(form.laborCost) || 0,
      date: new Date(form.date).toISOString()
    })

    if (form.truckId) {
      navigate(`/trucks/${form.truckId}`)
    } else {
      navigate('/timeline')
    }
  }

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handlePhotoCapture = async (e) => {
    const files = Array.from(e.target.files)
    const newPhotos = []

    for (const file of files) {
      const reader = new FileReader()
      await new Promise((resolve) => {
        reader.onload = (e) => {
          newPhotos.push(e.target.result)
          resolve()
        }
        reader.readAsDataURL(file)
      })
    }

    setForm(prev => ({
      ...prev,
      photos: [...prev.photos, ...newPhotos]
    }))
  }

  const removePhoto = (index) => {
    setForm(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }))
  }

  const selectedCategory = CATEGORIES.find(c => c.id === form.category)

  return (
    <div className="p-4 space-y-4 pb-8">
      <header className="pt-2 flex items-center gap-4">
        <Link
          to={preselectedTruckId ? `/trucks/${preselectedTruckId}` : '/'}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Log Maintenance</h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Truck Selection */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Truck *
          </label>
          <select
            required
            value={form.truckId}
            onChange={handleChange('truckId')}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
          >
            <option value="">Choose a truck...</option>
            {trucks.map(truck => (
              <option key={truck.id} value={truck.id}>
                {truck.truckNumber} - {truck.year} {truck.make} {truck.model}
              </option>
            ))}
          </select>
        </div>

        {/* Date and Mileage */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={form.date}
                onChange={handleChange('date')}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mileage *
              </label>
              <input
                type="number"
                required
                value={form.mileageAtService}
                onChange={handleChange('mileageAtService')}
                placeholder={selectedTruck ? String(selectedTruck.currentMileage) : '0'}
                min="0"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Category Selection */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Service Category *
          </label>
          <button
            type="button"
            onClick={() => setShowCategoryPicker(!showCategoryPicker)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl flex items-center justify-between hover:bg-gray-50 transition"
          >
            {selectedCategory ? (
              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-white ${selectedCategory.color}`}>
                {(() => {
                  const Icon = Icons[selectedCategory.icon] || Icons.Circle
                  return <Icon size={16} />
                })()}
                {selectedCategory.label}
              </span>
            ) : (
              <span className="text-gray-400">Select category...</span>
            )}
            <ChevronDown size={20} className={`text-gray-400 transition-transform ${showCategoryPicker ? 'rotate-180' : ''}`} />
          </button>

          {showCategoryPicker && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {CATEGORIES.map(cat => {
                const Icon = Icons[cat.icon] || Icons.Circle
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setForm(prev => ({ ...prev, category: cat.id }))
                      setShowCategoryPicker(false)
                    }}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition
                      ${form.category === cat.id
                        ? `${cat.color} text-white`
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    <Icon size={16} />
                    {cat.label}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            required
            value={form.description}
            onChange={handleChange('description')}
            placeholder="What work was performed?"
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Costs */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Cost
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.cost}
                onChange={handleChange('cost')}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parts Cost
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.partsCost}
                  onChange={handleChange('partsCost')}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Labor Cost
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.laborCost}
                  onChange={handleChange('laborCost')}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Service Provider */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Service Provider
          </label>
          <input
            type="text"
            value={form.serviceProvider}
            onChange={handleChange('serviceProvider')}
            placeholder="Who performed the service?"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Photos */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Photos
          </label>

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            multiple
            capture="environment"
            onChange={handlePhotoCapture}
            className="hidden"
          />

          <div className="flex flex-wrap gap-2">
            {form.photos.map((photo, index) => (
              <div key={index} className="relative w-20 h-20">
                <img
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow"
                >
                  <X size={14} />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 transition"
            >
              <Camera size={24} />
              <span className="text-xs mt-1">Add</span>
            </button>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Notes
          </label>
          <textarea
            value={form.notes}
            onChange={handleChange('notes')}
            placeholder="Any other details..."
            rows={2}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!form.truckId || !form.category || !form.description.trim()}
          className="flex items-center justify-center gap-2 w-full bg-blue-500 text-white py-4 rounded-xl font-semibold hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed active:scale-98"
        >
          <Save size={20} />
          Save Maintenance Record
        </button>
      </form>
    </div>
  )
}
