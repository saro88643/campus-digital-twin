import Room from '../models/Room.js';
import asyncHandler from '../middleware/asyncHandler.js';

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
  res.json({ success: true, data: room });
});

// @desc    Create room
// @route   POST /api/rooms
// @access  Private/Admin
export const createRoom = asyncHandler(async (req, res) => {
  const room = await Room.create(req.body);
  res.status(201).json({ success: true, data: room });
});

// @desc    Update room
// @route   PUT /api/rooms/:id
// @access  Private/Admin
export const updateRoom = asyncHandler(async (req, res) => {
  const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!room) {
    res.status(404);
    throw new Error('Room not found');
  }
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

  await room.deleteOne();
  res.json({ success: true, data: {} });
});
