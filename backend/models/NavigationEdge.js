import mongoose from 'mongoose';

const navigationEdgeSchema = mongoose.Schema(
  {
    edgeId: {
      type: String,
      required: true,
      unique: true,
    },
    fromNode: {
      type: String, // NavigationNode nodeId
      required: true,
    },
    toNode: {
      type: String, // NavigationNode nodeId
      required: true,
    },
    distanceMeters: {
      type: Number,
      required: true,
      default: 5,
    },
    walkingTimeSeconds: {
      type: Number,
      default: 4,
    },
    accessible: {
      type: Boolean,
      default: true,
    },
    edgeType: {
      type: String,
      enum: ['Corridor', 'Stair', 'Lift', 'Door', 'Walkway'],
      default: 'Corridor',
    },
    floorTransition: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const NavigationEdge = mongoose.model('NavigationEdge', navigationEdgeSchema);

export default NavigationEdge;
