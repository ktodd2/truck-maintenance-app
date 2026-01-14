import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { v4 as uuidv4 } from 'uuid';

export function useMaintenance(truckId = null) {
  const records = useLiveQuery(() => {
    if (truckId) {
      return db.maintenanceRecords
        .where('truckId')
        .equals(truckId)
        .reverse()
        .sortBy('date');
    }
    return db.maintenanceRecords.orderBy('date').reverse().toArray();
  }, [truckId]) || [];

  const addRecord = async (recordData) => {
    const record = {
      ...recordData,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    };
    await db.maintenanceRecords.add(record);

    if (recordData.mileageAtService && recordData.truckId) {
      const truck = await db.trucks.get(recordData.truckId);
      if (truck && recordData.mileageAtService > (truck.currentMileage || 0)) {
        await db.trucks.update(recordData.truckId, {
          currentMileage: recordData.mileageAtService,
          updatedAt: new Date().toISOString()
        });
      }
    }

    return record;
  };

  const updateRecord = async (id, updates) => {
    await db.maintenanceRecords.update(id, updates);
  };

  const deleteRecord = async (id) => {
    await db.maintenanceRecords.delete(id);
  };

  const getRecordsByCategory = (category) => {
    return records.filter(r => r.category === category);
  };

  const getTotalCost = () => {
    return records.reduce((sum, r) => sum + (r.cost || 0), 0);
  };

  const getRecordsByDateRange = (startDate, endDate) => {
    return records.filter(r => {
      const date = new Date(r.date);
      return date >= startDate && date <= endDate;
    });
  };

  return {
    records,
    addRecord,
    updateRecord,
    deleteRecord,
    getRecordsByCategory,
    getTotalCost,
    getRecordsByDateRange
  };
}
