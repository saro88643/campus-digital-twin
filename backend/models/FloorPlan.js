import mongoose from 'mongoose';

const floorPlanSchema = mongoose.Schema(
  {
    floor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Floor',
      required: true,
      unique: true,
    },
    block: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Block',
      required: true,
    },
    elements: [
      {
        id: String,
        elementType: {
          type: String,
          enum: [
            'room',
            'door',
            'corridor',
            'stair',
            'lift',
            'entrance',
            'exit',
            'facility',
            'label',
            'node',
          ],
        },
        label: String,
        roomId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Room',
        },
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
        fill: String,
        stroke: String,
        nodeId: String,
      },
    ],
    version: {
      type: Number,
      default: 1,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const FloorPlan = mongoose.model('FloorPlan', floorPlanSchema);

export default FloorPlan;
