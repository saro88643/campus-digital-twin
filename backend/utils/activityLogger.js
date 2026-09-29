import ActivityLog from '../models/ActivityLog.js';

export const logActivity = async (action, item, user = 'Admin', details = '') => {
  try {
    let color = 'bg-blue-500';
    if (action === 'Create') color = 'bg-green-500';
    if (action === 'Delete') color = 'bg-red-500';
    if (action === 'Occupancy' || action === 'Alert') color = 'bg-orange-500';
    if (action === 'Login') color = 'bg-purple-500';

    await ActivityLog.create({
      action,
      item,
      user,
      details,
      color,
    });
  } catch (err) {
    console.error('Failed to log activity:', err.message);
  }
};
