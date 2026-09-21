import Campus from '../models/Campus.js';
import asyncHandler from '../middleware/asyncHandler.js';

// @desc    Get campus information
// @route   GET /api/campus
// @access  Public
export const getCampus = asyncHandler(async (req, res) => {
  let campus = await Campus.findOne();

  if (!campus) {
    // Create default if none exists
    campus = await Campus.create({});
  }

  res.json({ success: true, data: campus });
});

// @desc    Update campus information
// @route   PUT /api/campus
// @access  Private/Admin
export const updateCampus = asyncHandler(async (req, res) => {
  let campus = await Campus.findOne();

  if (!campus) {
    campus = await Campus.create(req.body);
  } else {
    campus = await Campus.findByIdAndUpdate(campus._id, req.body, {
      new: true,
      runValidators: true,
    });
  }

  res.json({ success: true, data: campus });
});
