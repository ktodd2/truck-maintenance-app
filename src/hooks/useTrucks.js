import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useTrucks() {
  const { user } = useAuth()
  const [trucks, setTrucks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchTrucks()
    } else {
      setTrucks([])
      setLoading(false)
    }
  }, [user])

  const fetchTrucks = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('trucks')
      .select('*')
      .order('truck_number', { ascending: true })

    if (!error) {
      setTrucks(data || [])
    }
    setLoading(false)
  }

  const addTruck = async (truckData) => {
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
    setTrucks(prev => [...prev, data].sort((a, b) => a.truck_number.localeCompare(b.truck_number)))
    return data
  }

  const updateTruck = async (id, updates) => {
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
  }

  const deleteTruck = async (id) => {
    const { error } = await supabase
      .from('trucks')
      .delete()
      .eq('id', id)

    if (error) throw error
    setTrucks(prev => prev.filter(t => t.id !== id))
  }

  // Transform to camelCase for components
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

  const getTruck = (id) => {
    return transformedTrucks.find(t => t.id === id)
  }

  return {
    trucks: transformedTrucks,
    loading,
    addTruck,
    updateTruck,
    deleteTruck,
    getTruck,
    refresh: fetchTrucks
  }
}
