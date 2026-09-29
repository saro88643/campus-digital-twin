import mongoose from 'mongoose';

const roomSchema = mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: [true, 'Please add a room number'],
    },
    name: {
      type: String,
      required: [true, 'Please add a room name'],
    },
    roomType: {
      type: String,
      required: [true, 'Please add a room type'],
      enum: [
        'Classroom',
        'Laboratory',
        'Computer Lab',
        'Seminar Hall',
        'Auditorium',
        'Faculty Room',
        'Staff Room',
        'Office',
        'Library',
        'Workshop',
        'Meeting Room',
        'Other',
      ],
    },
    block: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Block',
      required: true,
    },
    floor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Floor',
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
    assignedFaculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty',
    },
    capacity: {
      type: Number,
      default: 0,
    },
    facilities: {
      projector: { type: Boolean, default: false },
      smartBoard: { type: Boolean, default: false },
      computers: { type: Boolean, default: false },
      wifi: { type: Boolean, default: false },
      airConditioning: { type: Boolean, default: false },
      fans: { type: Boolean, default: false },
      cctv: { type: Boolean, default: false },
      powerBackup: { type: Boolean, default: false },
      audioSystem: { type: Boolean, default: false },
      labEquipment: { type: Boolean, default: false },
    },
    status: {
      type: String,
      enum: ['Available', 'Occupied', 'Under Maintenance', 'Temporarily Closed'],
      default: 'Available',
    },
    // Occupancy Details with Start (From) and End (Until) Date/Time
    occupancy: {
      eventName: { type: String, default: '' },
      occupiedBySection: { type: String, default: '' },
      occupiedFrom: { type: Date, default: null },
      occupiedUntil: { type: Date, default: null },
      notes: { type: String, default: '' },
    },
    // Digital Twin Mapping attributes
    digitalTwinMapped: {
      type: Boolean,
      default: false,
    },
    geometry: {
      x: Number,
      y: Number,
      width: Number,
      height: Number,
      points: [
        {
          x: Number,
          y: Number,
        },
      ],
    },
    entrance: {
      x: Number,
      y: Number,
      doorName: String,
    },
    navigationNodeId: String,
    assignedStaff: String,
    workingHours: String,
    purpose: String,
    description: String,
    maintenanceNotes: String,
    contact: String,
    image: String,
  },
  {
    timestamps: true,
  }
);

const Room = mongoose.model('Room', roomSchema);

export default Room;
