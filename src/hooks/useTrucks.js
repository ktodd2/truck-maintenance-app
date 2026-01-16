import { useData } from '../context/DataContext'

export function useTrucks() {
  const { trucks, loading, addTruck, updateTruck, deleteTruck, getTruck, refresh } = useData()

  return {
    trucks,
    loading,
    addTruck,
    updateTruck,
    deleteTruck,
    getTruck,
    refresh
  }
}
