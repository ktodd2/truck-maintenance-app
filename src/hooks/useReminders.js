import { useLiveQuery } from 'dexie-react-hooks';
import { db, DEFAULT_REMINDERS } from '../db/database';

export function useReminders() {
  const reminders = useLiveQuery(() =>
    db.serviceReminders.toArray()
  ) || [];

  const checkDueServices = async (trucks, maintenanceRecords) => {
    const dueServices = [];
    const now = new Date();

    for (const truck of trucks) {
      for (const [category, intervals] of Object.entries(DEFAULT_REMINDERS)) {
        const lastService = maintenanceRecords
          .filter(r => r.truckId === truck.id && r.category === category)
          .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

        if (!lastService) {
          dueServices.push({
            truckId: truck.id,
            truckNumber: truck.truckNumber,
            category,
            status: 'unknown',
            message: 'No service history'
          });
          continue;
        }

        const lastServiceDate = new Date(lastService.date);
        const daysSinceService = Math.floor((now - lastServiceDate) / (1000 * 60 * 60 * 24));
        const milesSinceService = (truck.currentMileage || 0) - (lastService.mileageAtService || 0);

        let status = 'ok';
        let dueIn = null;

        if (intervals.miles && milesSinceService >= intervals.miles) {
          status = 'overdue';
          dueIn = `${milesSinceService - intervals.miles} miles overdue`;
        } else if (intervals.days && daysSinceService >= intervals.days) {
          status = 'overdue';
          dueIn = `${daysSinceService - intervals.days} days overdue`;
        } else if (intervals.miles && milesSinceService >= intervals.miles * 0.9) {
          status = 'soon';
          dueIn = `${intervals.miles - milesSinceService} miles`;
        } else if (intervals.days && daysSinceService >= intervals.days * 0.9) {
          status = 'soon';
          dueIn = `${intervals.days - daysSinceService} days`;
        }

        if (status !== 'ok') {
          dueServices.push({
            truckId: truck.id,
            truckNumber: truck.truckNumber,
            category,
            status,
            dueIn,
            lastServiceDate: lastService.date,
            lastServiceMileage: lastService.mileageAtService
          });
        }
      }
    }

    return dueServices.sort((a, b) => {
      const order = { overdue: 0, soon: 1, unknown: 2 };
      return order[a.status] - order[b.status];
    });
  };

  return { reminders, checkDueServices };
}
