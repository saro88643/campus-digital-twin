import mongoose from 'mongoose';

const floorSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a floor name'],
    },
    floorNumber: {
      type: Number,
      required: [true, 'Please add a floor number'],
    },
    block: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Block',
      required: true,
    },
    description: String,
    floorPlanImage: String, // Data URL or Image URL
    calibration: {
      realWidthMeters: { type: Number, default: 50 },
      realHeightMeters: { type: Number, default: 30 },
      unit: { type: String, default: 'meters' },
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    version: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Draft', 'Published', 'Archived'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

const Floor = mongoose.model('Floor', floorSchema);

export default Floor;
