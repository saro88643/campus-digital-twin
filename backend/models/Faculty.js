import mongoose from 'mongoose';

const facultySchema = mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, 'Please add employee ID'],
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'Please add faculty name'],
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
    designation: {
      type: String,
      default: 'Assistant Professor',
    },
    email: String,
    phone: String,
    officeRoom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
    },
    profilePhoto: String,
    subjects: [String],
  },
  {
    timestamps: true,
  }
);

const Faculty = mongoose.model('Faculty', facultySchema);

export default Faculty;
