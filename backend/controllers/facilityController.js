import Facility from '../models/Facility.js';
import asyncHandler from '../middleware/asyncHandler.js';

// @desc    Get all facilities
// @route   GET /api/facilities
// @access  Public
export const getFacilities = asyncHandler(async (req, res) => {
  const facilities = await Facility.find()
    .populate('room', 'roomNumber name')
    .populate('block', 'name code');
  res.json({ success: true, count: facilities.length, data: facilities });
});

// @desc    Get single facility
// @route   GET /api/facilities/:id
// @access  Public
export const getFacility = asyncHandler(async (req, res) => {
  const facility = await Facility.findById(req.params.id)
    .populate('room', 'roomNumber name')
    .populate('block', 'name code');
  if (!facility) {
    res.status(404);
    throw new Error('Facility not found');
  }
  res.json({ success: true, data: facility });
});

// @desc    Create facility
// @route   POST /api/facilities
// @access  Private/Admin
export const createFacility = asyncHandler(async (req, res) => {
  const facility = await Facility.create(req.body);
  res.status(201).json({ success: true, data: facility });
});

// @desc    Update facility
// @route   PUT /api/facilities/:id
// @access  Private/Admin
export const updateFacility = asyncHandler(async (req, res) => {
  const facility = await Facility.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!facility) {
    res.status(404);
    throw new Error('Facility not found');
  }
  res.json({ success: true, data: facility });
});

// @desc    Delete facility
// @route   DELETE /api/facilities/:id
// @access  Private/Admin
export const deleteFacility = asyncHandler(async (req, res) => {
  const facility = await Facility.findById(req.params.id);
  if (!facility) {
    res.status(404);
    throw new Error('Facility not found');
  }

  await facility.deleteOne();
  res.json({ success: true, data: {} });
});
