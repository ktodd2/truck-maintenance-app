export function exportToCSV(records, trucks, filename = 'maintenance-export.csv') {
  const truckMap = trucks.reduce((acc, t) => {
    acc[t.id] = t;
    return acc;
  }, {});

  const headers = [
    'Date',
    'Truck Number',
    'Make',
    'Model',
    'Mileage',
    'Category',
    'Description',
    'Total Cost',
    'Parts Cost',
    'Labor Cost',
    'Service Provider',
    'Notes'
  ];

  const rows = records.map(record => {
    const truck = truckMap[record.truckId] || {};
    return [
      new Date(record.date).toLocaleDateString(),
      truck.truckNumber || '',
      truck.make || '',
      truck.model || '',
      record.mileageAtService || '',
      record.category || '',
      record.description || '',
      record.cost || 0,
      record.partsCost || 0,
      record.laborCost || 0,
      record.serviceProvider || '',
      (record.notes || '').replace(/"/g, '""')
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount || 0);
}

export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatNumber(num) {
  return new Intl.NumberFormat('en-US').format(num || 0);
}
