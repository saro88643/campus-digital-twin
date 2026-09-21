import mongoose from 'mongoose';

const departmentSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a department name'],
    },
    code: {
      type: String,
      required: [true, 'Please add a department code'],
      unique: true,
    },
    description: String,
    head: String,
    email: String,
    contact: String,
  },
  {
    timestamps: true,
  }
);

const Department = mongoose.model('Department', departmentSchema);

export default Department;
