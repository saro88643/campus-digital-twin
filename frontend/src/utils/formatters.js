export const getStatusTone = (status) => {
  switch (status) {
    case 'Available':
    case 'Active':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'Occupied':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Under Maintenance':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'Temporarily Closed':
    case 'Inactive':
      return 'bg-red-100 text-red-700 border-red-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};
