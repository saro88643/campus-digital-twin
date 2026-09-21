import Floor from '../models/Floor.js';
import Room from '../models/Room.js';
import asyncHandler from '../middleware/asyncHandler.js';

// @desc    Get all floors
// @route   GET /api/floors
// @access  Public
export const getFloors = asyncHandler(async (req, res) => {
  const { blockId } = req.query;
  const query = blockId ? { block: blockId } : {};

  const floors = await Floor.find(query).populate('block', 'name code');
  res.json({ success: true, count: floors.length, data: floors });
});

// @desc    Get single floor
// @route   GET /api/floors/:id
// @access  Public
export const getFloor = asyncHandler(async (req, res) => {
  const floor = await Floor.findById(req.params.id).populate('block', 'name code');
  if (!floor) {
    res.status(404);
    throw new Error('Floor not found');
  }

  const rooms = await Room.find({ floor: floor._id });

  res.json({ success: true, data: floor, rooms });
});

// @desc    Create floor
// @route   POST /api/floors
// @access  Private/Admin
export const createFloor = asyncHandler(async (req, res) => {
  const floor = await Floor.create(req.body);
  res.status(201).json({ success: true, data: floor });
});

// @desc    Update floor
// @route   PUT /api/floors/:id
// @access  Private/Admin
export const updateFloor = asyncHandler(async (req, res) => {
  const floor = await Floor.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!floor) {
    res.status(404);
    throw new Error('Floor not found');
  }
  res.json({ success: true, data: floor });
});

// @desc    Delete floor
// @route   DELETE /api/floors/:id
// @access  Private/Admin
export const deleteFloor = asyncHandler(async (req, res) => {
  const floor = await Floor.findById(req.params.id);
  if (!floor) {
    res.status(404);
    throw new Error('Floor not found');
  }

  // Delete related rooms
  await Room.deleteMany({ floor: floor._id });
  await floor.deleteOne();

  res.json({ success: true, data: {} });
});
