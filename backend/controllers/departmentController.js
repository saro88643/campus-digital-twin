import Department from '../models/Department.js';
import Room from '../models/Room.js';
import asyncHandler from '../middleware/asyncHandler.js';

// @desc    Get all departments
// @route   GET /api/departments
// @access  Public
export const getDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find();
  res.json({ success: true, count: departments.length, data: departments });
});

// @desc    Get single department
// @route   GET /api/departments/:id
// @access  Public
export const getDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id);
  if (!department) {
    res.status(404);
    throw new Error('Department not found');
  }

  const rooms = await Room.find({ department: department._id }).populate('block floor');

  res.json({ success: true, data: department, rooms });
});

// @desc    Create department
// @route   POST /api/departments
// @access  Private/Admin
export const createDepartment = asyncHandler(async (req, res) => {
  const department = await Department.create(req.body);
  res.status(201).json({ success: true, data: department });
});

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private/Admin
export const updateDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!department) {
    res.status(404);
    throw new Error('Department not found');
  }
  res.json({ success: true, data: department });
});

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private/Admin
export const deleteDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id);
  if (!department) {
    res.status(404);
    throw new Error('Department not found');
  }

  // Update rooms that belonged to this department
  await Room.updateMany({ department: department._id }, { $unset: { department: 1 } });
  await department.deleteOne();

  res.json({ success: true, data: {} });
});
