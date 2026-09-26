import mongoose from 'mongoose';

const blockSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a block name'],
    },
    code: {
      type: String,
      required: [true, 'Please add a block code'],
      unique: true,
    },
    buildingType: {
      type: String,
      enum: [
        'Academic',
        'Administrative',
        'Laboratory',
        'Hostel',
        'Library',
        'Sports',
        'Food Court',
        'Canteen',
        'Auditorium',
        'Research',
        'Other',
      ],
      default: 'Academic',
    },
    floorsCount: {
      type: Number,
      default: 3,
    },
    description: String,
    location: String,
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
    digitalTwinId: String,
    departments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
      },
    ],
    facilities: [String],
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    image: String,
  },
  {
    timestamps: true,
  }
);

const Block = mongoose.model('Block', blockSchema);

export default Block;
