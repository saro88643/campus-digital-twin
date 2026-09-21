import Block from '../models/Block.js';
import Floor from '../models/Floor.js';
import Room from '../models/Room.js';
import asyncHandler from '../middleware/asyncHandler.js';

// @desc    Get all blocks
// @route   GET /api/blocks
// @access  Public
export const getBlocks = asyncHandler(async (req, res) => {
  const blocks = await Block.find().populate('departments');
  res.json({ success: true, count: blocks.length, data: blocks });
});

// @desc    Get single block
// @route   GET /api/blocks/:id
// @access  Public
export const getBlock = asyncHandler(async (req, res) => {
  const block = await Block.findById(req.params.id).populate('departments');
  if (!block) {
    res.status(404);
    throw new Error('Block not found');
  }

  const floors = await Floor.find({ block: block._id }).sort('floorNumber');
  const rooms = await Room.find({ block: block._id });

  res.json({ success: true, data: block, floors, rooms });
});

// @desc    Create block
// @route   POST /api/blocks
// @access  Private/Admin
export const createBlock = asyncHandler(async (req, res) => {
  const block = await Block.create(req.body);
  res.status(201).json({ success: true, data: block });
});

// @desc    Update block
// @route   PUT /api/blocks/:id
// @access  Private/Admin
export const updateBlock = asyncHandler(async (req, res) => {
  const block = await Block.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!block) {
    res.status(404);
    throw new Error('Block not found');
  }
  res.json({ success: true, data: block });
});

// @desc    Delete block
// @route   DELETE /api/blocks/:id
// @access  Private/Admin
export const deleteBlock = asyncHandler(async (req, res) => {
  const block = await Block.findById(req.params.id);
  if (!block) {
    res.status(404);
    throw new Error('Block not found');
  }

  // Delete related floors and rooms
  await Floor.deleteMany({ block: block._id });
  await Room.deleteMany({ block: block._id });
  await block.deleteOne();

  res.json({ success: true, data: {} });
});
