import mongoose from 'mongoose';

const campusSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a campus name'],
      default: 'Sri Shakthi Institute of Engineering and Technology',
    },
    shortName: {
      type: String,
      default: 'SIET',
    },
    code: {
      type: String,
      required: [true, 'Please add a campus code'],
      default: 'SIET',
    },
    description: {
      type: String,
      default: 'Autonomous institution accredited by NAAC with A+ grade and NBA accredited departments in Coimbatore.',
    },
    establishedYear: {
      type: Number,
      default: 2006,
    },
    address: {
      type: String,
      default: 'Sri Shakthi Nagar, L & T By-Pass, Chinniyampalayam Post, Coimbatore – 641062, Tamil Nadu, India',
    },
    city: {
      type: String,
      default: 'Coimbatore',
    },
    district: {
      type: String,
      default: 'Coimbatore',
    },
    state: {
      type: String,
      default: 'Tamil Nadu',
    },
    country: {
      type: String,
      default: 'India',
    },
    pincode: {
      type: String,
      default: '641062',
    },
    contact: {
      email: { type: String, default: 'info@sreeshakthi.edu.in' },
      phone: { type: String, default: '+91 422 2683300' },
      website: { type: String, default: 'https://www.sreeshakthi.edu.in' },
    },
    principal: {
      type: String,
      default: 'Dr. R. Prakash',
    },
    campusArea: {
      type: String,
      default: '30 Acres',
    },
    coordinates: {
      latitude: { type: Number, default: 11.0315 },
      longitude: { type: Number, default: 77.0654 },
    },
    vision: {
      type: String,
      default: 'To be an institution of excellence in technical education and research producing ethical engineers.',
    },
    mission: {
      type: String,
      default: 'Provide state-of-the-art infrastructure, quality education, industry collaboration and value-based training.',
    },
    accreditation: {
      type: String,
      default: 'NAAC A+ Grade, NBA Accredited Programs',
    },
    affiliation: {
      type: String,
      default: 'Anna University, Chennai (Approved by AICTE, New Delhi)',
    },
    logo: String,
  },
  {
    timestamps: true,
  }
);

const Campus = mongoose.model('Campus', campusSchema);

export default Campus;
