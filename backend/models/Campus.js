import mongoose from 'mongoose';

const campusSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a campus name'],
      default: 'ABC Engineering College',
    },
    code: {
      type: String,
      required: [true, 'Please add a campus code'],
      default: 'ABCEC',
    },
    description: {
      type: String,
      default: 'Digital Twin of the campus with buildings, departments, and rooms.',
    },
    address: {
      type: String,
      default: 'Ring Road, Sector 12, Coimbatore, Tamil Nadu 641004',
    },
    contact: {
      email: String,
      phone: String,
      website: String,
    },
    logo: String,
  },
  {
    timestamps: true,
  }
);

const Campus = mongoose.model('Campus', campusSchema);

export default Campus;
