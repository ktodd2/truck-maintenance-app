import { useData } from '../context/DataContext'

export function useMaintenance(truckId = null) {
  const { records, loading, addRecord, updateRecord, deleteRecord, getRecordsForTruck } = useData()

  // Filter records for specific truck if provided
  const filteredRecords = truckId ? getRecordsForTruck(truckId) : records

  const getRecordsByCategory = (category) => {
    return filteredRecords.filter(r => r.category === category)
  }

  const getTotalCost = () => {
    return filteredRecords.reduce((sum, r) => sum + (r.cost || 0), 0)
  }

  const getRecordsByDateRange = (startDate, endDate) => {
    return filteredRecords.filter(r => {
      const date = new Date(r.date)
      return date >= startDate && date <= endDate
    })
  }

  return {
    records: filteredRecords,
    loading,
    addRecord,
    updateRecord,
    deleteRecord,
    getRecordsByCategory,
    getTotalCost,
    getRecordsByDateRange
  }
}
