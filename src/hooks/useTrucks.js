import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { v4 as uuidv4 } from 'uuid';

export function useTrucks() {
  const trucks = useLiveQuery(() =>
    db.trucks.orderBy('truckNumber').toArray()
  ) || [];

  const addTruck = async (truckData) => {
    const truck = {
      ...truckData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await db.trucks.add(truck);
    return truck;
  };

  const updateTruck = async (id, updates) => {
    await db.trucks.update(id, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  };

  const deleteTruck = async (id) => {
    await db.trucks.delete(id);
    await db.maintenanceRecords.where('truckId').equals(id).delete();
    await db.serviceReminders.where('truckId').equals(id).delete();
  };

  const getTruck = (id) => {
    return trucks.find(t => t.id === id);
  };

  return { trucks, addTruck, updateTruck, deleteTruck, getTruck };
}
