import Room from '../models/Room.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { logActivity } from '../utils/activityLogger.js';

// Helper function to check occupancy window (occupiedFrom <= now <= occupiedUntil)
const autoCheckExpiry = async (rooms) => {
  const now = new Date();
  for (const room of rooms) {
    if (room.occupancy?.occupiedFrom && room.occupancy?.occupiedUntil) {
      const from = new Date(room.occupancy.occupiedFrom);
      const until = new Date(room.occupancy.occupiedUntil);

      if (now >= from && now <= until) {
        // Current time is within occupancy period
        if (room.status !== 'Occupied') {
          room.status = 'Occupied';
          await room.save();
        }
      } else if (now > until) {
        // Exceeded occupancy period -> set to Available (Empty)
        if (room.status === 'Occupied') {
          room.status = 'Available';
          room.occupancy = {
            eventName: '',
            occupiedBySection: '',
            occupiedFrom: null,
            occupiedUntil: null,
            notes: '',
          };
          await room.save();
          await logActivity('Alert', `Room ${room.roomNumber}`, 'System', 'Occupancy expired automatically');
        }
      } else if (now < from) {
        // Before occupancy period -> Room is currently Available (Empty)
        if (room.status === 'Occupied') {
          room.status = 'Available';
          await room.save();
        }
      }
    }
  }
};

// @desc    Get all rooms
// @route   GET /api/rooms
// @access  Public
export const getRooms = asyncHandler(async (req, res) => {
  const { blockId, floorId, departmentId, type, status, search } = req.query;

  let query = {};
  if (blockId) query.block = blockId;
  if (floorId) query.floor = floorId;
  if (departmentId) query.department = departmentId;
  if (type) query.roomType = type;
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { roomNumber: { $regex: search, $options: 'i' } }
    ];
  }

  const rooms = await Room.find(query)
    .populate('block', 'name code')
    .populate('floor', 'name floorNumber')
    .populate('department', 'name code');

  await autoCheckExpiry(rooms);

  res.json({ success: true, count: rooms.length, data: rooms });
});

// @desc    Get single room
// @route   GET /api/rooms/:id
// @access  Public
export const getRoom = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id)
    .populate('block', 'name code')
    .populate('floor', 'name floorNumber')
    .populate('department', 'name code head contact');

  if (!room) {
    res.status(404);
    throw new Error('Room not found');
  }

  await autoCheckExpiry([room]);

  res.json({ success: true, data: room });
});

// @desc    Create room
// @route   POST /api/rooms
// @access  Private/Admin
export const createRoom = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (!payload.department || payload.department === '') {
    delete payload.department;
  }
  const room = await Room.create(payload);

  await logActivity('Create', `Room ${room.roomNumber}`, req.user?.name || 'Admin', room.name);

  res.status(201).json({ success: true, data: room });
});

// @desc    Update room
// @route   PUT /api/rooms/:id
// @access  Private/Admin
export const updateRoom = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (payload.department === '' || payload.department === null) {
    payload.department = null;
  }

  // Auto-sync common name with updated room number
  if (payload.roomNumber) {
    const rawNum = payload.roomNumber.trim().toUpperCase();
    const digits = rawNum.replace(/^[A-Z\s_-]+/, '');
    if (rawNum.startsWith('LH')) {
      payload.name = `Lecture Hall ${digits || rawNum}`;
    } else if (rawNum.startsWith('CL')) {
      payload.name = `Computer Lab ${digits || rawNum}`;
    } else if (rawNum.startsWith('SH')) {
      payload.name = `Seminar Hall ${digits || rawNum}`;
    } else if (!payload.name || payload.name.startsWith('Lecture Hall') || payload.name.startsWith('Room')) {
      payload.name = `Room ${payload.roomNumber}`;
    }
  }

  const room = await Room.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true,
  });

  if (!room) {
    res.status(404);
    throw new Error('Room not found');
  }

  const actionType = payload.status === 'Occupied' ? 'Occupancy' : 'Update';
  const detailText = payload.occupancy?.eventName ? `Event: ${payload.occupancy.eventName}` : room.name;
  await logActivity(actionType, `Room ${room.roomNumber}`, req.user?.name || 'Admin', detailText);

  res.json({ success: true, data: room });
});

// @desc    Delete room
// @route   DELETE /api/rooms/:id
// @access  Private/Admin
export const deleteRoom = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);

  if (!room) {
    res.status(404);
    throw new Error('Room not found');
  }

  await logActivity('Delete', `Room ${room.roomNumber}`, req.user?.name || 'Admin');
  await room.deleteOne();

  res.json({ success: true, data: {} });
});
