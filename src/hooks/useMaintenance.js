import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useMaintenance(truckId = null) {
  const { user } = useAuth()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchRecords()
    } else {
      setRecords([])
      setLoading(false)
    }
  }, [user, truckId])

  const fetchRecords = async () => {
    setLoading(true)
    let query = supabase
      .from('maintenance_records')
      .select('*')
      .order('date', { ascending: false })

    if (truckId) {
      query = query.eq('truck_id', truckId)
    }

    const { data, error } = await query

    if (!error) {
      setRecords(data || [])
    }
    setLoading(false)
  }

  const addRecord = async (recordData) => {
    const { data, error } = await supabase
      .from('maintenance_records')
      .insert({
        user_id: user.id,
        truck_id: recordData.truckId,
        date: recordData.date,
        mileage_at_service: recordData.mileageAtService,
        category: recordData.category,
        description: recordData.description,
        cost: recordData.cost || 0,
        parts_cost: recordData.partsCost || 0,
        labor_cost: recordData.laborCost || 0,
        service_provider: recordData.serviceProvider,
        notes: recordData.notes,
        photos: recordData.photos || []
      })
      .select()
      .single()

    if (error) throw error

    // Update truck mileage if this is higher
    if (recordData.mileageAtService && recordData.truckId) {
      await supabase
        .from('trucks')
        .update({ current_mileage: recordData.mileageAtService })
        .eq('id', recordData.truckId)
        .lt('current_mileage', recordData.mileageAtService)
    }

    setRecords(prev => [data, ...prev])
    return data
  }

  const updateRecord = async (id, updates) => {
    const { data, error } = await supabase
      .from('maintenance_records')
      .update({
        date: updates.date,
        mileage_at_service: updates.mileageAtService,
        category: updates.category,
        description: updates.description,
        cost: updates.cost,
        parts_cost: updates.partsCost,
        labor_cost: updates.laborCost,
        service_provider: updates.serviceProvider,
        notes: updates.notes,
        photos: updates.photos
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    setRecords(prev => prev.map(r => r.id === id ? data : r))
    return data
  }

  const deleteRecord = async (id) => {
    const { error } = await supabase
      .from('maintenance_records')
      .delete()
      .eq('id', id)

    if (error) throw error
    setRecords(prev => prev.filter(r => r.id !== id))
  }

  // Transform to camelCase for components
  const transformedRecords = records.map(r => ({
    id: r.id,
    truckId: r.truck_id,
    date: r.date,
    mileageAtService: r.mileage_at_service,
    category: r.category,
    description: r.description,
    cost: r.cost,
    partsCost: r.parts_cost,
    laborCost: r.labor_cost,
    serviceProvider: r.service_provider,
    notes: r.notes,
    photos: r.photos,
    createdAt: r.created_at
  }))

  const getRecordsByCategory = (category) => {
    return transformedRecords.filter(r => r.category === category)
  }

  const getTotalCost = () => {
    return transformedRecords.reduce((sum, r) => sum + (r.cost || 0), 0)
  }

  const getRecordsByDateRange = (startDate, endDate) => {
    return transformedRecords.filter(r => {
      const date = new Date(r.date)
      return date >= startDate && date <= endDate
    })
  }

  return {
    records: transformedRecords,
    loading,
    addRecord,
    updateRecord,
    deleteRecord,
    getRecordsByCategory,
    getTotalCost,
    getRecordsByDateRange,
    refresh: fetchRecords
  }
}
