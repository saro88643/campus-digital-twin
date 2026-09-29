import mongoose from 'mongoose';

const activityLogSchema = mongoose.Schema(
  {
    action: {
      type: String, // 'Create', 'Update', 'Delete', 'Login', 'Occupancy', 'Alert'
      required: true,
    },
    item: {
      type: String, // e.g. 'Room LH55', 'Academic Block'
      required: true,
    },
    user: {
      type: String,
      default: 'Admin',
    },
    details: {
      type: String,
      default: '',
    },
    color: {
      type: String,
      default: 'bg-blue-500',
    },
  },
  {
    timestamps: true,
  }
);

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

export default ActivityLog;
