import Dexie from 'dexie';

export const db = new Dexie('FleetMaintenanceDB');

db.version(1).stores({
  trucks: '++id, truckNumber, make, model, year, currentMileage, createdAt',
  maintenanceRecords: '++id, truckId, date, mileageAtService, category, cost, createdAt',
  serviceReminders: '++id, truckId, category, isActive',
  settings: 'id'
});

export const CATEGORIES = [
  { id: 'oil_change', label: 'Oil Change', icon: 'Droplets', color: 'bg-amber-500' },
  { id: 'tires', label: 'Tires', icon: 'Circle', color: 'bg-gray-700' },
  { id: 'brakes', label: 'Brakes', icon: 'Disc', color: 'bg-red-500' },
  { id: 'filters', label: 'Filters', icon: 'Filter', color: 'bg-blue-500' },
  { id: 'fluids', label: 'Fluids', icon: 'Beaker', color: 'bg-cyan-500' },
  { id: 'electrical', label: 'Electrical', icon: 'Zap', color: 'bg-yellow-500' },
  { id: 'engine', label: 'Engine', icon: 'Cog', color: 'bg-orange-500' },
  { id: 'transmission', label: 'Transmission', icon: 'Settings', color: 'bg-purple-500' },
  { id: 'suspension', label: 'Suspension', icon: 'ArrowUpDown', color: 'bg-green-500' },
  { id: 'body', label: 'Body/Exterior', icon: 'Truck', color: 'bg-indigo-500' },
  { id: 'inspection', label: 'Inspection', icon: 'ClipboardCheck', color: 'bg-teal-500' },
  { id: 'other', label: 'Other', icon: 'MoreHorizontal', color: 'bg-gray-500' }
];

export const DEFAULT_REMINDERS = {
  oil_change: { miles: 5000, days: 90 },
  tires: { miles: 50000, days: 365 },
  brakes: { miles: 30000, days: 365 },
  filters: { miles: 15000, days: 180 },
  fluids: { miles: 30000, days: 365 },
  inspection: { miles: null, days: 365 }
};

export function getCategoryInfo(categoryId) {
  return CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[CATEGORIES.length - 1];
}
