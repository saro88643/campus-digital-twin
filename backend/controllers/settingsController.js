import Campus from '../models/Campus.js';

// @desc    Get college/campus settings
// @route   GET /api/settings
// @access  Public / Private
export const getSettings = async (req, res, next) => {
  try {
    let campus = await Campus.findOne();
    if (!campus) {
      campus = await Campus.create({
        name: 'ABC Engineering College',
        code: 'ABCEC',
        address: 'Ring Road, Sector 12',
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        pincode: '641004',
        phone: '+91 422 2345678',
        email: 'info@abcec.edu.in',
        website: 'https://www.abcec.edu.in',
        description: 'A NAAC-accredited engineering institution digitally mirrored in Campus Twin.',
      });
    }
    return res.json({ success: true, data: campus });
  } catch (error) {
    next(error);
  }
};

// @desc    Update college/campus settings
// @route   PUT /api/settings
// @access  Private/Admin
export const updateSettings = async (req, res, next) => {
  try {
    let campus = await Campus.findOne();
    if (!campus) {
      campus = await Campus.create(req.body);
    } else {
      campus = await Campus.findByIdAndUpdate(campus._id, req.body, {
        new: true,
        runValidators: true,
      });
    }
    return res.json({ success: true, data: campus, message: 'Settings updated successfully' });
  } catch (error) {
    next(error);
  }
};
