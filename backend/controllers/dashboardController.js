import Block from '../models/Block.js';
import Floor from '../models/Floor.js';
import Room from '../models/Room.js';
import Department from '../models/Department.js';
import Facility from '../models/Facility.js';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import asyncHandler from '../middleware/asyncHandler.js';

// @desc    Get dashboard statistics & recent activity logs
// @route   GET /api/dashboard/stats
// @access  Public
export const getStats = asyncHandler(async (req, res) => {
  const totalBlocks = await Block.countDocuments();
  const totalFloors = await Floor.countDocuments();
  const totalRooms = await Room.countDocuments();
  const totalDepartments = await Department.countDocuments();
  const totalFacilities = await Facility.countDocuments();
  const totalUsers = await User.countDocuments();

  const roomStatusBreakdown = await Room.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  const roomTypeBreakdown = await Room.aggregate([
    { $group: { _id: '$roomType', count: { $sum: 1 } } }
  ]);

  // Fetch latest 10 activity logs from MongoDB
  const recentActivities = await ActivityLog.find()
    .sort({ createdAt: -1 })
    .limit(10);

  res.json({
    success: true,
    data: {
      totals: {
        blocks: totalBlocks,
        floors: totalFloors,
        rooms: totalRooms,
        departments: totalDepartments,
        facilities: totalFacilities,
        users: totalUsers,
      },
      breakdowns: {
        roomStatus: roomStatusBreakdown,
        roomType: roomTypeBreakdown,
      },
      recentActivities,
    }
  });
});
