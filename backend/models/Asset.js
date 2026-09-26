import mongoose from 'mongoose';

const assetSchema = mongoose.Schema(
  {
    assetId: {
      type: String,
      required: [true, 'Please add asset ID'],
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'Please add asset name'],
    },
    assetType: {
      type: String,
      enum: [
        'Projector',
        'Computer',
        'AC',
        'Smart Board',
        'CCTV',
        'Lift',
        'Generator',
        'Solar Panel',
        'Water Tank',
        'Lab Equipment',
        'Other',
      ],
      default: 'Other',
    },
    block: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Block',
    },
    floor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Floor',
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
    },
    status: {
      type: String,
      enum: ['Functional', 'Needs Repair', 'Under Maintenance', 'Decommissioned'],
      default: 'Functional',
    },
    installationDate: Date,
    maintenanceDate: Date,
    notes: String,
  },
  {
    timestamps: true,
  }
);

const Asset = mongoose.model('Asset', assetSchema);

export default Asset;
