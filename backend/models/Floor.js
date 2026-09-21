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
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

const Floor = mongoose.model('Floor', floorSchema);

export default Floor;
