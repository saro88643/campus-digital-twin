import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Campus from '../models/Campus.js';
import Block from '../models/Block.js';
import Floor from '../models/Floor.js';
import Room from '../models/Room.js';
import Department from '../models/Department.js';
import Facility from '../models/Facility.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus-twin');

    console.log('Clearing database...');
    await User.deleteMany();
    await Campus.deleteMany();
    await Block.deleteMany();
    await Floor.deleteMany();
    await Room.deleteMany();
    await Department.deleteMany();
    await Facility.deleteMany();

    console.log('Seeding users...');
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@campus.edu',
      password: 'admin123',
      role: 'admin',
    });

    const user = await User.create({
      name: 'Normal User',
      email: 'user@campus.edu',
      password: 'user123',
      role: 'user',
    });

    console.log('Seeding campus...');
    const campus = await Campus.create({
      name: 'ABC Engineering College',
      code: 'ABCEC',
      description: 'A NAAC-accredited engineering institution with modern facilities.',
      address: 'Ring Road, Sector 12, Coimbatore, Tamil Nadu 641004',
      contact: {
        email: 'info@abcec.edu',
        phone: '+91 422 1234567',
        website: 'www.abcec.edu'
      }
    });

    console.log('Seeding departments...');
    const deptCSE = await Department.create({
      name: 'Computer Science & Engineering',
      code: 'CSE',
      description: 'Department focusing on software, AI, and systems.',
      head: 'Dr. R. Meenakshi',
      email: 'cse@abcec.edu',
      contact: 'Ext: 101'
    });

    const deptMech = await Department.create({
      name: 'Mechanical Engineering',
      code: 'MECH',
      description: 'Department focusing on design, thermal, and manufacturing.',
      head: 'Dr. S. Karthikeyan',
      email: 'mech@abcec.edu',
      contact: 'Ext: 102'
    });

    console.log('Seeding blocks...');
    const blockMain = await Block.create({
      name: 'Main Block',
      code: 'MB',
      description: 'Administrative and general academics block.',
      location: 'Near Entrance',
      departments: [deptCSE._id]
    });

    const blockMech = await Block.create({
      name: 'Mechanical Block',
      code: 'MECHB',
      description: 'Dedicated block for Mechanical Engineering.',
      location: 'West Wing',
      departments: [deptMech._id]
    });

    console.log('Seeding floors...');
    const floorMainG = await Floor.create({
      name: 'Ground Floor',
      floorNumber: 0,
      block: blockMain._id
    });

    const floorMain1 = await Floor.create({
      name: 'First Floor',
      floorNumber: 1,
      block: blockMain._id
    });

    const floorMechG = await Floor.create({
      name: 'Ground Floor',
      floorNumber: 0,
      block: blockMech._id
    });

    console.log('Seeding rooms...');
    await Room.create([
      {
        roomNumber: 'G101',
        name: 'Reception',
        roomType: 'Office',
        block: blockMain._id,
        floor: floorMainG._id,
        capacity: 10,
        status: 'Available',
        assignedStaff: 'Ms. Priya',
        purpose: 'Visitor reception'
      },
      {
        roomNumber: 'F101',
        name: 'CSE Theory Room A',
        roomType: 'Classroom',
        block: blockMain._id,
        floor: floorMain1._id,
        department: deptCSE._id,
        capacity: 60,
        facilities: { wifi: true, projector: true, fans: true },
        status: 'Available'
      },
      {
        roomNumber: 'M001',
        name: 'Workshop',
        roomType: 'Workshop',
        block: blockMech._id,
        floor: floorMechG._id,
        department: deptMech._id,
        capacity: 40,
        facilities: { labEquipment: true, powerBackup: true },
        status: 'Occupied'
      }
    ]);

    console.log('Database seeded successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
