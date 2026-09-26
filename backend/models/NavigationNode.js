import mongoose from 'mongoose';

const navigationNodeSchema = mongoose.Schema(
  {
    nodeId: {
      type: String,
      required: true,
      unique: true,
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
    floorNumber: {
      type: Number,
      required: true,
      default: 0,
    },
    x: {
      type: Number,
      required: true,
    },
    y: {
      type: Number,
      required: true,
    },
    nodeType: {
      type: String,
      enum: [
        'Campus Entrance',
        'Building Entrance',
        'Corridor',
        'Junction',
        'Room Entrance',
        'Stair',
        'Lift',
        'Exit',
      ],
      default: 'Corridor',
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
    },
    label: String,
    accessible: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const NavigationNode = mongoose.model('NavigationNode', navigationNodeSchema);

export default NavigationNode;
