import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Campus from '../models/Campus.js';
import Block from '../models/Block.js';
import Floor from '../models/Floor.js';
import Room from '../models/Room.js';
import Department from '../models/Department.js';
import Facility from '../models/Facility.js';
import Faculty from '../models/Faculty.js';
import Asset from '../models/Asset.js';
import NavigationNode from '../models/NavigationNode.js';
import NavigationEdge from '../models/NavigationEdge.js';

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
    await Faculty.deleteMany();
    await Asset.deleteMany();
    await NavigationNode.deleteMany();
    await NavigationEdge.deleteMany();

    console.log('Seeding users...');
    await User.create({
      name: 'Administrator',
      email: 'admin@campus.edu',
      password: 'admin123',
      role: 'admin',
    });

    await User.create({
      name: 'SIET Student',
      email: 'user@campus.edu',
      password: 'user123',
      role: 'user',
    });

    console.log('Seeding SIET campus profile...');
    const campus = await Campus.create({
      name: 'Sri Shakthi Institute of Engineering and Technology',
      shortName: 'SIET',
      code: 'SIET',
      description: 'Autonomous engineering institution accredited by NAAC with A+ grade and NBA accredited departments in Coimbatore.',
      establishedYear: 2006,
      address: 'Sri Shakthi Nagar, L & T By-Pass, Chinniyampalayam Post, Coimbatore – 641062, Tamil Nadu, India',
      city: 'Coimbatore',
      district: 'Coimbatore',
      state: 'Tamil Nadu',
      country: 'India',
      pincode: '641062',
      contact: {
        email: 'info@sreeshakthi.edu.in',
        phone: '+91 422 2683300',
        website: 'https://www.sreeshakthi.edu.in'
      },
      principal: 'Dr. R. Prakash',
      campusArea: '30 Acres',
      coordinates: { latitude: 11.0315, longitude: 77.0654 },
      vision: 'To be an institution of excellence in technical education and research producing ethical engineers.',
      mission: 'Provide state-of-the-art infrastructure, quality education, industry collaboration and value-based training.',
      accreditation: 'NAAC A+ Grade, NBA Accredited Programs',
      affiliation: 'Anna University, Chennai (Approved by AICTE, New Delhi)'
    });

    console.log('Seeding SIET departments...');
    const deptCSE = await Department.create({
      name: 'Computer Science & Engineering',
      code: 'CSE',
      description: 'Department focusing on software engineering, AI, algorithms, and cloud computing.',
      head: 'Dr. R. Meenakshi',
      email: 'cse@sreeshakthi.edu.in',
      contact: '+91 422 2683301'
    });

    const deptAIDS = await Department.create({
      name: 'Artificial Intelligence & Data Science',
      code: 'AI&DS',
      description: 'Specialized department for AI, machine learning, and big data analytics.',
      head: 'Dr. S. Priya',
      email: 'aids@sreeshakthi.edu.in',
      contact: '+91 422 2683302'
    });

    const deptECE = await Department.create({
      name: 'Electronics & Communication Engineering',
      code: 'ECE',
      description: 'Focusing on VLSI design, embedded systems, and wireless communications.',
      head: 'Dr. K. Arul',
      email: 'ece@sreeshakthi.edu.in',
      contact: '+91 422 2683303'
    });

    const deptMech = await Department.create({
      name: 'Mechanical Engineering',
      code: 'MECH',
      description: 'Focusing on robotics, thermal engineering, CAD/CAM, and manufacturing.',
      head: 'Dr. S. Karthikeyan',
      email: 'mech@sreeshakthi.edu.in',
      contact: '+91 422 2683304'
    });

    console.log('Seeding SIET blocks...');
    const blockCSE = await Block.create({
      name: 'CSE & IT Academic Block',
      code: 'CSEB',
      buildingType: 'Academic',
      floorsCount: 4,
      description: 'Housing Computer Science, AI&DS, and Information Technology classrooms & laboratories.',
      location: 'North Campus Quadrangle',
      departments: [deptCSE._id, deptAIDS._id],
      facilities: ['High-speed WiFi', 'AC Computer Labs', 'Seminar Hall', 'Elevators'],
      status: 'Active'
    });

    const blockECE = await Block.create({
      name: 'ECE & EEE Academic Block',
      code: 'ECEB',
      buildingType: 'Academic',
      floorsCount: 3,
      description: 'Housing Electronics, Electrical, and IoT research labs.',
      location: 'East Wing',
      departments: [deptECE._id],
      facilities: ['Embedded Systems Lab', 'Smart Classrooms', 'Power Backup'],
      status: 'Active'
    });

    const blockMech = await Block.create({
      name: 'Mechanical & Civil Block',
      code: 'MECHB',
      buildingType: 'Academic',
      floorsCount: 3,
      description: 'Advanced manufacturing, robotics, and civil material testing laboratories.',
      location: 'West Campus Wing',
      departments: [deptMech._id],
      facilities: ['Heavy Machinery Workshop', 'CAD/CAM Lab'],
      status: 'Active'
    });

    const blockAdmin = await Block.create({
      name: 'Administrative & Governance Block',
      code: 'ADMB',
      buildingType: 'Administrative',
      floorsCount: 2,
      description: 'Principal office, admissions center, finance office, and main boardrooms.',
      location: 'Main Gate Quadrangle',
      facilities: ['Main Reception', 'Executive Boardroom', 'ATM'],
      status: 'Active'
    });

    console.log('Seeding floors...');
    const floorCSEG = await Floor.create({
      name: 'Ground Floor',
      floorNumber: 0,
      block: blockCSE._id,
      isPublished: true,
      status: 'Published'
    });

    const floorCSE1 = await Floor.create({
      name: 'First Floor',
      floorNumber: 1,
      block: blockCSE._id,
      isPublished: true,
      status: 'Published'
    });

    const floorCSE2 = await Floor.create({
      name: 'Second Floor',
      floorNumber: 2,
      block: blockCSE._id,
      isPublished: true,
      status: 'Published'
    });

    const floorAdminG = await Floor.create({
      name: 'Ground Floor',
      floorNumber: 0,
      block: blockAdmin._id,
      isPublished: true,
      status: 'Published'
    });

    const floorMechG = await Floor.create({
      name: 'Ground Floor',
      floorNumber: 0,
      block: blockMech._id,
      isPublished: true,
      status: 'Published'
    });

    console.log('Seeding navigation nodes...');
    const nodeGate = await NavigationNode.create({
      nodeId: 'NODE_MAIN_GATE',
      block: blockAdmin._id,
      floor: floorAdminG._id,
      floorNumber: 0,
      x: 50,
      y: 350,
      nodeType: 'Campus Entrance',
      label: 'Main Gate Entrance'
    });

    const nodeCSEEnt = await NavigationNode.create({
      nodeId: 'NODE_CSE_ENTRANCE',
      block: blockCSE._id,
      floor: floorCSEG._id,
      floorNumber: 0,
      x: 150,
      y: 350,
      nodeType: 'Building Entrance',
      label: 'CSE Block Entrance'
    });

    const nodeCSECorridorG = await NavigationNode.create({
      nodeId: 'NODE_CSE_G_CORRIDOR_1',
      block: blockCSE._id,
      floor: floorCSEG._id,
      floorNumber: 0,
      x: 250,
      y: 350,
      nodeType: 'Corridor',
      label: 'Ground Floor Main Corridor'
    });

    const nodeCSEStairG = await NavigationNode.create({
      nodeId: 'NODE_CSE_STAIR_A_G',
      block: blockCSE._id,
      floor: floorCSEG._id,
      floorNumber: 0,
      x: 350,
      y: 350,
      nodeType: 'Stair',
      label: 'Stairwell A (Ground Floor)'
    });

    const nodeCSEStair1 = await NavigationNode.create({
      nodeId: 'NODE_CSE_STAIR_A_1',
      block: blockCSE._id,
      floor: floorCSE1._id,
      floorNumber: 1,
      x: 350,
      y: 200,
      nodeType: 'Stair',
      label: 'Stairwell A (First Floor)'
    });

    const nodeCSECorridor1 = await NavigationNode.create({
      nodeId: 'NODE_CSE_1_CORRIDOR_1',
      block: blockCSE._id,
      floor: floorCSE1._id,
      floorNumber: 1,
      x: 450,
      y: 200,
      nodeType: 'Corridor',
      label: 'First Floor Main Corridor'
    });

    const nodeF105Ent = await NavigationNode.create({
      nodeId: 'NODE_F105_ENTRANCE',
      block: blockCSE._id,
      floor: floorCSE1._id,
      floorNumber: 1,
      x: 550,
      y: 180,
      nodeType: 'Room Entrance',
      label: 'F105 Door Entrance'
    });

    console.log('Seeding navigation edges...');
    await NavigationEdge.create([
      {
        edgeId: 'EDGE_GATE_TO_CSE',
        fromNode: nodeGate.nodeId,
        toNode: nodeCSEEnt.nodeId,
        distanceMeters: 30,
        walkingTimeSeconds: 25,
        edgeType: 'Walkway'
      },
      {
        edgeId: 'EDGE_CSE_ENT_TO_CORR_G',
        fromNode: nodeCSEEnt.nodeId,
        toNode: nodeCSECorridorG.nodeId,
        distanceMeters: 15,
        walkingTimeSeconds: 12,
        edgeType: 'Corridor'
      },
      {
        edgeId: 'EDGE_CORR_G_TO_STAIR_G',
        fromNode: nodeCSECorridorG.nodeId,
        toNode: nodeCSEStairG.nodeId,
        distanceMeters: 20,
        walkingTimeSeconds: 15,
        edgeType: 'Corridor'
      },
      {
        edgeId: 'EDGE_STAIR_G_TO_1',
        fromNode: nodeCSEStairG.nodeId,
        toNode: nodeCSEStair1.nodeId,
        distanceMeters: 15,
        walkingTimeSeconds: 20,
        edgeType: 'Stair',
        floorTransition: true
      },
      {
        edgeId: 'EDGE_STAIR1_TO_CORR1',
        fromNode: nodeCSEStair1.nodeId,
        toNode: nodeCSECorridor1.nodeId,
        distanceMeters: 15,
        walkingTimeSeconds: 12,
        edgeType: 'Corridor'
      },
      {
        edgeId: 'EDGE_CORR1_TO_F105',
        fromNode: nodeCSECorridor1.nodeId,
        toNode: nodeF105Ent.nodeId,
        distanceMeters: 10,
        walkingTimeSeconds: 8,
        edgeType: 'Door'
      }
    ]);

    console.log('Seeding classrooms & laboratories...');
    const roomF105 = await Room.create({
      roomNumber: 'F105',
      name: 'Programming Laboratory',
      roomType: 'Computer Lab',
      block: blockCSE._id,
      floor: floorCSE1._id,
      department: deptCSE._id,
      capacity: 60,
      facilities: { wifi: true, projector: true, airConditioning: true, computers: true, powerBackup: true },
      status: 'Available',
      assignedStaff: 'Dr. R. Meenakshi',
      purpose: 'Hands-on programming practice for Python, Java, and Data Structures.',
      digitalTwinMapped: true,
      geometry: { x: 500, y: 100, width: 120, height: 100 },
      entrance: { x: 550, y: 180, doorName: 'F105 Main Door' },
      navigationNodeId: nodeF105Ent.nodeId
    });

    const roomF101 = await Room.create({
      roomNumber: 'F101',
      name: 'CSE Theory Lecture Hall A',
      roomType: 'Classroom',
      block: blockCSE._id,
      floor: floorCSE1._id,
      department: deptCSE._id,
      capacity: 65,
      facilities: { wifi: true, projector: true, smartBoard: true, fans: true },
      status: 'Available',
      assignedStaff: 'Prof. S. Suresh',
      purpose: 'Interactive theory lectures for Computer Science curriculum.',
      digitalTwinMapped: true,
      geometry: { x: 350, y: 100, width: 120, height: 100 },
      entrance: { x: 400, y: 180, doorName: 'F101 Door' }
    });

    const roomAI102 = await Room.create({
      roomNumber: 'AI102',
      name: 'AI & Data Science Innovation Center',
      roomType: 'Laboratory',
      block: blockCSE._id,
      floor: floorCSE2._id,
      department: deptAIDS._id,
      capacity: 50,
      facilities: { wifi: true, projector: true, airConditioning: true, computers: true, labEquipment: true },
      status: 'Available',
      assignedStaff: 'Dr. S. Priya',
      purpose: 'High-performance GPU computing for deep learning and data analytics.'
    });

    const roomG101 = await Room.create({
      roomNumber: 'G101',
      name: 'SIET Campus Central Reception',
      roomType: 'Office',
      block: blockAdmin._id,
      floor: floorAdminG._id,
      capacity: 15,
      facilities: { wifi: true, airConditioning: true },
      status: 'Available',
      assignedStaff: 'Ms. K. Kavitha',
      purpose: 'Information desk and visitor assistance.'
    });

    const roomM001 = await Room.create({
      roomNumber: 'M001',
      name: 'CAD/CAM & Automotive Workshop',
      roomType: 'Workshop',
      block: blockMech._id,
      floor: floorMechG._id,
      department: deptMech._id,
      capacity: 40,
      facilities: { labEquipment: true, powerBackup: true },
      status: 'Occupied',
      assignedStaff: 'Dr. S. Karthikeyan',
      purpose: 'Design and fabrication of mechanical prototypes.'
    });

    console.log('Seeding faculty...');
    await Faculty.create([
      {
        employeeId: 'EMP_CSE_01',
        name: 'Dr. R. Meenakshi',
        department: deptCSE._id,
        designation: 'Professor & Head',
        email: 'meenakshi.r@sreeshakthi.edu.in',
        phone: '+91 98422 11223',
        officeRoom: roomF105._id,
        subjects: ['Data Structures', 'Database Systems']
      },
      {
        employeeId: 'EMP_AIDS_01',
        name: 'Dr. S. Priya',
        department: deptAIDS._id,
        designation: 'Associate Professor',
        email: 'priya.s@sreeshakthi.edu.in',
        phone: '+91 98422 33445',
        officeRoom: roomAI102._id,
        subjects: ['Artificial Intelligence', 'Machine Learning']
      }
    ]);

    console.log('Seeding campus assets...');
    await Asset.create([
      {
        assetId: 'AST_PROJ_F105',
        name: 'Epson High-Lumen Projector',
        assetType: 'Projector',
        block: blockCSE._id,
        floor: floorCSE1._id,
        room: roomF105._id,
        status: 'Functional',
        notes: 'Calibrated Jan 2026'
      },
      {
        assetId: 'AST_AC_F105',
        name: 'Daikin 2-Ton Inverter AC',
        assetType: 'AC',
        block: blockCSE._id,
        floor: floorCSE1._id,
        room: roomF105._id,
        status: 'Functional'
      }
    ]);

    console.log('Database seeded successfully for SIET Digital Twin!');
    process.exit();
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedData();
