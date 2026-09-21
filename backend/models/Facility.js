import mongoose from 'mongoose';

const facilitySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a facility name'],
    },
    description: String,
    location: String,
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Under Maintenance'],
      default: 'Active',
    },
    availability: String,
    maintenanceDate: Date,
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
    },
    block: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Block',
    },
  },
  {
    timestamps: true,
  }
);

const Facility = mongoose.model('Facility', facilitySchema);

export default Facility;
