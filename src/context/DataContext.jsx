import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const DataContext = createContext({})

export function DataProvider({ children }) {
  const { user } = useAuth()
  const [trucks, setTrucks] = useState([])
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch all data when user changes
  useEffect(() => {
    if (user) {
      fetchAllData()
    } else {
      setTrucks([])
      setRecords([])
      setLoading(false)
    }
  }, [user])

  const fetchAllData = async () => {
    setLoading(true)

    const [trucksResult, recordsResult] = await Promise.all([
      supabase.from('trucks').select('*').order('truck_number', { ascending: true }),
      supabase.from('maintenance_records').select('*').order('date', { ascending: false })
    ])

    if (!trucksResult.error) {
      setTrucks(trucksResult.data || [])
    }
    if (!recordsResult.error) {
      setRecords(recordsResult.data || [])
    }

    setLoading(false)
  }

  // Transform to camelCase
  const transformedTrucks = trucks.map(t => ({
    id: t.id,
    truckNumber: t.truck_number,
    make: t.make,
    model: t.model,
    year: t.year,
    vin: t.vin,
    currentMileage: t.current_mileage,
    notes: t.notes,
    createdAt: t.created_at,
    updatedAt: t.updated_at
  }))

  const transformedRecords = records.map(r => ({
    id: r.id,
    truckId: r.truck_id,
    date: r.date,
    mileageAtService: r.mileage_at_service,
    category: r.category,
    description: r.description,
    cost: Number(r.cost) || 0,
    partsCost: Number(r.parts_cost) || 0,
    laborCost: Number(r.labor_cost) || 0,
    serviceProvider: r.service_provider,
    notes: r.notes,
    photos: r.photos || [],
    createdAt: r.created_at
  }))

  // Truck operations
  const addTruck = useCallback(async (truckData) => {
    const { data, error } = await supabase
      .from('trucks')
      .insert({
        user_id: user.id,
        truck_number: truckData.truckNumber,
        make: truckData.make,
        model: truckData.model,
        year: truckData.year,
        vin: truckData.vin,
        current_mileage: truckData.currentMileage || 0,
        notes: truckData.notes
      })
      .select()
      .single()

    if (error) throw error
    setTrucks(prev => [...prev, data].sort((a, b) =>
      (a.truck_number || '').localeCompare(b.truck_number || '')
    ))
    return data
  }, [user])

  const updateTruck = useCallback(async (id, updates) => {
    const { data, error } = await supabase
      .from('trucks')
      .update({
        truck_number: updates.truckNumber,
        make: updates.make,
        model: updates.model,
        year: updates.year,
        vin: updates.vin,
        current_mileage: updates.currentMileage,
        notes: updates.notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    setTrucks(prev => prev.map(t => t.id === id ? data : t))
    return data
  }, [])

  const deleteTruck = useCallback(async (id) => {
    const { error } = await supabase
      .from('trucks')
      .delete()
      .eq('id', id)

    if (error) throw error
    setTrucks(prev => prev.filter(t => t.id !== id))
    setRecords(prev => prev.filter(r => r.truck_id !== id))
  }, [])

  // Maintenance operations
  const addRecord = useCallback(async (recordData) => {
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

    // Update truck mileage if higher
    if (recordData.mileageAtService && recordData.truckId) {
      const truck = trucks.find(t => t.id === recordData.truckId)
      if (truck && recordData.mileageAtService > (truck.current_mileage || 0)) {
        await supabase
          .from('trucks')
          .update({ current_mileage: recordData.mileageAtService })
          .eq('id', recordData.truckId)

        setTrucks(prev => prev.map(t =>
          t.id === recordData.truckId
            ? { ...t, current_mileage: recordData.mileageAtService }
            : t
        ))
      }
    }

    setRecords(prev => [data, ...prev])
    return data
  }, [user, trucks])

  const updateRecord = useCallback(async (id, updates) => {
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
  }, [])

  const deleteRecord = useCallback(async (id) => {
    const { error } = await supabase
      .from('maintenance_records')
      .delete()
      .eq('id', id)

    if (error) throw error
    setRecords(prev => prev.filter(r => r.id !== id))
  }, [])

  const getRecordsForTruck = useCallback((truckId) => {
    return transformedRecords.filter(r => r.truckId === truckId)
  }, [transformedRecords])

  const getTruck = useCallback((id) => {
    return transformedTrucks.find(t => t.id === id)
  }, [transformedTrucks])

  return (
    <DataContext.Provider value={{
      trucks: transformedTrucks,
      records: transformedRecords,
      loading,
      addTruck,
      updateTruck,
      deleteTruck,
      addRecord,
      updateRecord,
      deleteRecord,
      getRecordsForTruck,
      getTruck,
      refresh: fetchAllData
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  return useContext(DataContext)
}
