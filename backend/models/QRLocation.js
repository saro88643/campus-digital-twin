import mongoose from 'mongoose';

const qrLocationSchema = mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    label: String,
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
    navigationNodeId: String,
  },
  {
    timestamps: true,
  }
);

const QRLocation = mongoose.model('QRLocation', qrLocationSchema);

export default QRLocation;
