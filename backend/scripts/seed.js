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
    await Campus.create({
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
    const blockAcademic = await Block.create({
      name: 'Academic Block',
      code: 'ACAB',
      buildingType: 'Academic',
      floorsCount: 4,
      description: 'Main Academic Block featuring Lecture Halls (LH01 - LH23), Seminar Hall 1, and Central Quadrangle.',
      location: 'Central Campus Quadrangle',
      departments: [deptCSE._id, deptAIDS._id, deptECE._id, deptMech._id],
      facilities: ['High-speed WiFi', 'Smart Lecture Halls', 'Staircases', 'Restrooms'],
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

    console.log('Seeding Academic Block floors...');
    const floorG = await Floor.create({
      name: 'Ground Floor',
      floorNumber: 0,
      block: blockAcademic._id,
      isPublished: true,
      status: 'Published'
    });

    const floor1 = await Floor.create({
      name: 'First Floor',
      floorNumber: 1,
      block: blockAcademic._id,
      isPublished: true,
      status: 'Published'
    });

    const floor2 = await Floor.create({
      name: 'Second Floor',
      floorNumber: 2,
      block: blockAcademic._id,
      isPublished: true,
      status: 'Published'
    });

    const floor3 = await Floor.create({
      name: 'Third Floor',
      floorNumber: 3,
      block: blockAcademic._id,
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

    console.log('Seeding navigation nodes...');
    // --- GROUND FLOOR NODES ---
    const nodeEntry = await NavigationNode.create({ nodeId: 'NODE_ACAB_G_ENTRY', block: blockAcademic._id, floor: floorG._id, floorNumber: 0, x: 400, y: 440, nodeType: 'Building Entrance', label: 'Academic Block Main Entry' });
    const nodeExit = await NavigationNode.create({ nodeId: 'NODE_ACAB_G_EXIT', block: blockAcademic._id, floor: floorG._id, floorNumber: 0, x: 400, y: 60, nodeType: 'Exit', label: 'Academic Block Back Exit' });
    const nodeStairsWestG = await NavigationNode.create({ nodeId: 'NODE_ACAB_G_STAIRS_WEST', block: blockAcademic._id, floor: floorG._id, floorNumber: 0, x: 220, y: 250, nodeType: 'Stair', label: 'West Stairs (Ground Floor)' });
    const nodeStairsEastG = await NavigationNode.create({ nodeId: 'NODE_ACAB_G_STAIRS_EAST', block: blockAcademic._id, floor: floorG._id, floorNumber: 0, x: 580, y: 250, nodeType: 'Stair', label: 'East Stairs (Ground Floor)' });
    const nodeG_Corr_Bottom = await NavigationNode.create({ nodeId: 'NODE_G_CORR_BOTTOM', block: blockAcademic._id, floor: floorG._id, floorNumber: 0, x: 400, y: 380, nodeType: 'Corridor', label: 'Ground Floor Entrance Lobby' });

    const nodeG_LH01_Ent = await NavigationNode.create({ nodeId: 'NODE_LH01_ENT', block: blockAcademic._id, floor: floorG._id, floorNumber: 0, x: 220, y: 380, nodeType: 'Room Entrance', label: 'LH01 Entrance' });
    const nodeG_LH06_Ent = await NavigationNode.create({ nodeId: 'NODE_LH06_ENT', block: blockAcademic._id, floor: floorG._id, floorNumber: 0, x: 580, y: 380, nodeType: 'Room Entrance', label: 'LH06 Entrance' });
    const nodeG_LH02_Ent = await NavigationNode.create({ nodeId: 'NODE_LH02_ENT', block: blockAcademic._id, floor: floorG._id, floorNumber: 0, x: 160, y: 120, nodeType: 'Room Entrance', label: 'LH02 Entrance' });
    const nodeG_LH03_Ent = await NavigationNode.create({ nodeId: 'NODE_LH03_ENT', block: blockAcademic._id, floor: floorG._id, floorNumber: 0, x: 280, y: 120, nodeType: 'Room Entrance', label: 'LH03 Entrance' });
    const nodeG_LH04_Ent = await NavigationNode.create({ nodeId: 'NODE_LH04_ENT', block: blockAcademic._id, floor: floorG._id, floorNumber: 0, x: 520, y: 120, nodeType: 'Room Entrance', label: 'LH04 Entrance' });
    const nodeG_LH05_Ent = await NavigationNode.create({ nodeId: 'NODE_LH05_ENT', block: blockAcademic._id, floor: floorG._id, floorNumber: 0, x: 640, y: 120, nodeType: 'Room Entrance', label: 'LH05 Entrance' });

    // --- FIRST FLOOR NODES ---
    const nodeStairsWest1 = await NavigationNode.create({ nodeId: 'NODE_ACAB_1_STAIRS_WEST', block: blockAcademic._id, floor: floor1._id, floorNumber: 1, x: 220, y: 250, nodeType: 'Stair', label: 'West Stairs (First Floor)' });
    const nodeStairsEast1 = await NavigationNode.create({ nodeId: 'NODE_ACAB_1_STAIRS_EAST', block: blockAcademic._id, floor: floor1._id, floorNumber: 1, x: 580, y: 250, nodeType: 'Stair', label: 'East Stairs (First Floor)' });
    const node1_LH07_Ent = await NavigationNode.create({ nodeId: 'NODE_LH07_ENT', block: blockAcademic._id, floor: floor1._id, floorNumber: 1, x: 220, y: 380, nodeType: 'Room Entrance', label: 'LH07 Entrance' });
    const node1_LH12_Ent = await NavigationNode.create({ nodeId: 'NODE_LH12_ENT', block: blockAcademic._id, floor: floor1._id, floorNumber: 1, x: 580, y: 380, nodeType: 'Room Entrance', label: 'LH12 Entrance' });
    const node1_LH08_Ent = await NavigationNode.create({ nodeId: 'NODE_LH08_ENT', block: blockAcademic._id, floor: floor1._id, floorNumber: 1, x: 160, y: 120, nodeType: 'Room Entrance', label: 'LH08 Entrance' });
    const node1_LH09_Ent = await NavigationNode.create({ nodeId: 'NODE_LH09_ENT', block: blockAcademic._id, floor: floor1._id, floorNumber: 1, x: 280, y: 120, nodeType: 'Room Entrance', label: 'LH09 Entrance' });
    const node1_LH10_Ent = await NavigationNode.create({ nodeId: 'NODE_LH10_ENT', block: blockAcademic._id, floor: floor1._id, floorNumber: 1, x: 520, y: 120, nodeType: 'Room Entrance', label: 'LH10 Entrance' });
    const node1_LH11_Ent = await NavigationNode.create({ nodeId: 'NODE_LH11_ENT', block: blockAcademic._id, floor: floor1._id, floorNumber: 1, x: 640, y: 120, nodeType: 'Room Entrance', label: 'LH11 Entrance' });

    // --- SECOND FLOOR NODES ---
    const nodeStairsWest2 = await NavigationNode.create({ nodeId: 'NODE_ACAB_2_STAIRS_WEST', block: blockAcademic._id, floor: floor2._id, floorNumber: 2, x: 220, y: 250, nodeType: 'Stair', label: 'West Stairs (Second Floor)' });
    const nodeStairsEast2 = await NavigationNode.create({ nodeId: 'NODE_ACAB_2_STAIRS_EAST', block: blockAcademic._id, floor: floor2._id, floorNumber: 2, x: 580, y: 250, nodeType: 'Stair', label: 'East Stairs (Second Floor)' });
    const node2_LH13_Ent = await NavigationNode.create({ nodeId: 'NODE_LH13_ENT', block: blockAcademic._id, floor: floor2._id, floorNumber: 2, x: 220, y: 380, nodeType: 'Room Entrance', label: 'LH13 Entrance' });
    const node2_LH16_Ent = await NavigationNode.create({ nodeId: 'NODE_LH16_ENT', block: blockAcademic._id, floor: floor2._id, floorNumber: 2, x: 580, y: 380, nodeType: 'Room Entrance', label: 'LH16 Entrance' });
    const node2_LH14_Ent = await NavigationNode.create({ nodeId: 'NODE_LH14_ENT', block: blockAcademic._id, floor: floor2._id, floorNumber: 2, x: 160, y: 120, nodeType: 'Room Entrance', label: 'LH14 Entrance' });
    const node2_SemHall1_Ent = await NavigationNode.create({ nodeId: 'NODE_SEM1_ENT', block: blockAcademic._id, floor: floor2._id, floorNumber: 2, x: 400, y: 120, nodeType: 'Room Entrance', label: 'Seminar Hall 1 Entrance' });
    const node2_LH15_Ent = await NavigationNode.create({ nodeId: 'NODE_LH15_ENT', block: blockAcademic._id, floor: floor2._id, floorNumber: 2, x: 640, y: 120, nodeType: 'Room Entrance', label: 'LH15 Entrance' });

    // --- THIRD FLOOR NODES ---
    const nodeStairsEast3 = await NavigationNode.create({ nodeId: 'NODE_ACAB_3_STAIRS_EAST', block: blockAcademic._id, floor: floor3._id, floorNumber: 3, x: 580, y: 250, nodeType: 'Stair', label: 'East Stairs (Third Floor)' });
    const node3_LH17_Ent = await NavigationNode.create({ nodeId: 'NODE_LH17_ENT', block: blockAcademic._id, floor: floor3._id, floorNumber: 3, x: 150, y: 380, nodeType: 'Room Entrance', label: 'LH17 Entrance' });
    const node3_LH18_Ent = await NavigationNode.create({ nodeId: 'NODE_LH18_ENT', block: blockAcademic._id, floor: floor3._id, floorNumber: 3, x: 120, y: 120, nodeType: 'Room Entrance', label: 'LH18 Entrance' });
    const node3_LH19_Ent = await NavigationNode.create({ nodeId: 'NODE_LH19_ENT', block: blockAcademic._id, floor: floor3._id, floorNumber: 3, x: 240, y: 120, nodeType: 'Room Entrance', label: 'LH19 Entrance' });
    const node3_LH20_Ent = await NavigationNode.create({ nodeId: 'NODE_LH20_ENT', block: blockAcademic._id, floor: floor3._id, floorNumber: 3, x: 350, y: 120, nodeType: 'Room Entrance', label: 'LH20 Entrance' });
    const node3_LH21_Ent = await NavigationNode.create({ nodeId: 'NODE_LH21_ENT', block: blockAcademic._id, floor: floor3._id, floorNumber: 3, x: 480, y: 120, nodeType: 'Room Entrance', label: 'LH21 Entrance' });
    const node3_LH22_Ent = await NavigationNode.create({ nodeId: 'NODE_LH22_ENT', block: blockAcademic._id, floor: floor3._id, floorNumber: 3, x: 640, y: 120, nodeType: 'Room Entrance', label: 'LH22 Entrance' });
    const node3_LH23A_Ent = await NavigationNode.create({ nodeId: 'NODE_LH23A_ENT', block: blockAcademic._id, floor: floor3._id, floorNumber: 3, x: 290, y: 380, nodeType: 'Room Entrance', label: 'LH23A Entrance' });
    const node3_LH23B_Ent = await NavigationNode.create({ nodeId: 'NODE_LH23B_ENT', block: blockAcademic._id, floor: floor3._id, floorNumber: 3, x: 390, y: 380, nodeType: 'Room Entrance', label: 'LH23B Entrance' });
    const node3_LH23_Ent = await NavigationNode.create({ nodeId: 'NODE_LH23_ENT', block: blockAcademic._id, floor: floor3._id, floorNumber: 3, x: 610, y: 380, nodeType: 'Room Entrance', label: 'LH23 Entrance' });

    console.log('Seeding navigation edges...');
    await NavigationEdge.create([
      // Ground floor
      { edgeId: 'E_G_1', fromNode: nodeEntry.nodeId, toNode: nodeG_Corr_Bottom.nodeId, distanceMeters: 10, walkingTimeSeconds: 8, edgeType: 'Corridor' },
      { edgeId: 'E_G_2', fromNode: nodeG_Corr_Bottom.nodeId, toNode: nodeG_LH01_Ent.nodeId, distanceMeters: 15, walkingTimeSeconds: 12, edgeType: 'Corridor' },
      { edgeId: 'E_G_3', fromNode: nodeG_Corr_Bottom.nodeId, toNode: nodeG_LH06_Ent.nodeId, distanceMeters: 15, walkingTimeSeconds: 12, edgeType: 'Corridor' },
      { edgeId: 'E_G_4', fromNode: nodeG_LH01_Ent.nodeId, toNode: nodeStairsWestG.nodeId, distanceMeters: 15, walkingTimeSeconds: 12, edgeType: 'Corridor' },
      { edgeId: 'E_G_5', fromNode: nodeG_LH06_Ent.nodeId, toNode: nodeStairsEastG.nodeId, distanceMeters: 15, walkingTimeSeconds: 12, edgeType: 'Corridor' },
      { edgeId: 'E_G_6', fromNode: nodeStairsWestG.nodeId, toNode: nodeG_LH02_Ent.nodeId, distanceMeters: 20, walkingTimeSeconds: 15, edgeType: 'Corridor' },
      { edgeId: 'E_G_7', fromNode: nodeG_LH02_Ent.nodeId, toNode: nodeG_LH03_Ent.nodeId, distanceMeters: 12, walkingTimeSeconds: 10, edgeType: 'Corridor' },
      { edgeId: 'E_G_8', fromNode: nodeG_LH03_Ent.nodeId, toNode: nodeExit.nodeId, distanceMeters: 15, walkingTimeSeconds: 12, edgeType: 'Corridor' },
      { edgeId: 'E_G_9', fromNode: nodeExit.nodeId, toNode: nodeG_LH04_Ent.nodeId, distanceMeters: 15, walkingTimeSeconds: 12, edgeType: 'Corridor' },
      { edgeId: 'E_G_10', fromNode: nodeG_LH04_Ent.nodeId, toNode: nodeG_LH05_Ent.nodeId, distanceMeters: 12, walkingTimeSeconds: 10, edgeType: 'Corridor' },
      { edgeId: 'E_G_11', fromNode: nodeG_LH05_Ent.nodeId, toNode: nodeStairsEastG.nodeId, distanceMeters: 20, walkingTimeSeconds: 15, edgeType: 'Corridor' },

      // Stairs transitions
      { edgeId: 'E_STAIR_W_0_1', fromNode: nodeStairsWestG.nodeId, toNode: nodeStairsWest1.nodeId, distanceMeters: 15, walkingTimeSeconds: 20, edgeType: 'Stair', floorTransition: true },
      { edgeId: 'E_STAIR_E_0_1', fromNode: nodeStairsEastG.nodeId, toNode: nodeStairsEast1.nodeId, distanceMeters: 15, walkingTimeSeconds: 20, edgeType: 'Stair', floorTransition: true },
      { edgeId: 'E_STAIR_W_1_2', fromNode: nodeStairsWest1.nodeId, toNode: nodeStairsWest2.nodeId, distanceMeters: 15, walkingTimeSeconds: 20, edgeType: 'Stair', floorTransition: true },
      { edgeId: 'E_STAIR_E_1_2', fromNode: nodeStairsEast1.nodeId, toNode: nodeStairsEast2.nodeId, distanceMeters: 15, walkingTimeSeconds: 20, edgeType: 'Stair', floorTransition: true },
      { edgeId: 'E_STAIR_E_2_3', fromNode: nodeStairsEast2.nodeId, toNode: nodeStairsEast3.nodeId, distanceMeters: 15, walkingTimeSeconds: 20, edgeType: 'Stair', floorTransition: true },

      // First floor
      { edgeId: 'E_1_1', fromNode: nodeStairsWest1.nodeId, toNode: node1_LH07_Ent.nodeId, distanceMeters: 15, walkingTimeSeconds: 12, edgeType: 'Corridor' },
      { edgeId: 'E_1_2', fromNode: nodeStairsEast1.nodeId, toNode: node1_LH12_Ent.nodeId, distanceMeters: 15, walkingTimeSeconds: 12, edgeType: 'Corridor' },
      { edgeId: 'E_1_3', fromNode: nodeStairsWest1.nodeId, toNode: node1_LH08_Ent.nodeId, distanceMeters: 20, walkingTimeSeconds: 15, edgeType: 'Corridor' },
      { edgeId: 'E_1_4', fromNode: node1_LH08_Ent.nodeId, toNode: node1_LH09_Ent.nodeId, distanceMeters: 12, walkingTimeSeconds: 10, edgeType: 'Corridor' },
      { edgeId: 'E_1_5', fromNode: node1_LH09_Ent.nodeId, toNode: node1_LH10_Ent.nodeId, distanceMeters: 20, walkingTimeSeconds: 15, edgeType: 'Corridor' },
      { edgeId: 'E_1_6', fromNode: node1_LH10_Ent.nodeId, toNode: node1_LH11_Ent.nodeId, distanceMeters: 12, walkingTimeSeconds: 10, edgeType: 'Corridor' },
      { edgeId: 'E_1_7', fromNode: node1_LH11_Ent.nodeId, toNode: nodeStairsEast1.nodeId, distanceMeters: 20, walkingTimeSeconds: 15, edgeType: 'Corridor' },

      // Second floor
      { edgeId: 'E_2_1', fromNode: nodeStairsWest2.nodeId, toNode: node2_LH13_Ent.nodeId, distanceMeters: 15, walkingTimeSeconds: 12, edgeType: 'Corridor' },
      { edgeId: 'E_2_2', fromNode: nodeStairsEast2.nodeId, toNode: node2_LH16_Ent.nodeId, distanceMeters: 15, walkingTimeSeconds: 12, edgeType: 'Corridor' },
      { edgeId: 'E_2_3', fromNode: nodeStairsWest2.nodeId, toNode: node2_LH14_Ent.nodeId, distanceMeters: 20, walkingTimeSeconds: 15, edgeType: 'Corridor' },
      { edgeId: 'E_2_4', fromNode: node2_LH14_Ent.nodeId, toNode: node2_SemHall1_Ent.nodeId, distanceMeters: 18, walkingTimeSeconds: 14, edgeType: 'Corridor' },
      { edgeId: 'E_2_5', fromNode: node2_SemHall1_Ent.nodeId, toNode: node2_LH15_Ent.nodeId, distanceMeters: 18, walkingTimeSeconds: 14, edgeType: 'Corridor' },
      { edgeId: 'E_2_6', fromNode: node2_LH15_Ent.nodeId, toNode: nodeStairsEast2.nodeId, distanceMeters: 20, walkingTimeSeconds: 15, edgeType: 'Corridor' },

      // Third floor
      { edgeId: 'E_3_1', fromNode: nodeStairsEast3.nodeId, toNode: node3_LH21_Ent.nodeId, distanceMeters: 15, walkingTimeSeconds: 12, edgeType: 'Corridor' },
      { edgeId: 'E_3_2', fromNode: node3_LH21_Ent.nodeId, toNode: node3_LH20_Ent.nodeId, distanceMeters: 12, walkingTimeSeconds: 10, edgeType: 'Corridor' },
      { edgeId: 'E_3_3', fromNode: node3_LH20_Ent.nodeId, toNode: node3_LH19_Ent.nodeId, distanceMeters: 12, walkingTimeSeconds: 10, edgeType: 'Corridor' },
      { edgeId: 'E_3_4', fromNode: node3_LH19_Ent.nodeId, toNode: node3_LH18_Ent.nodeId, distanceMeters: 12, walkingTimeSeconds: 10, edgeType: 'Corridor' },
      { edgeId: 'E_3_5', fromNode: node3_LH21_Ent.nodeId, toNode: node3_LH22_Ent.nodeId, distanceMeters: 15, walkingTimeSeconds: 12, edgeType: 'Corridor' },
      { edgeId: 'E_3_6', fromNode: nodeStairsEast3.nodeId, toNode: node3_LH23_Ent.nodeId, distanceMeters: 15, walkingTimeSeconds: 12, edgeType: 'Corridor' },
      { edgeId: 'E_3_7', fromNode: node3_LH23_Ent.nodeId, toNode: node3_LH23B_Ent.nodeId, distanceMeters: 15, walkingTimeSeconds: 12, edgeType: 'Corridor' },
      { edgeId: 'E_3_8', fromNode: node3_LH23B_Ent.nodeId, toNode: node3_LH23A_Ent.nodeId, distanceMeters: 12, walkingTimeSeconds: 10, edgeType: 'Corridor' },
      { edgeId: 'E_3_9', fromNode: node3_LH23A_Ent.nodeId, toNode: node3_LH17_Ent.nodeId, distanceMeters: 15, walkingTimeSeconds: 12, edgeType: 'Corridor' },
    ]);

    console.log('Seeding classrooms & laboratories for Academic Block...');

    // --- GROUND FLOOR ROOMS ---
    await Room.create({ roomNumber: 'LH01', name: 'Lecture Hall 01', roomType: 'Classroom', block: blockAcademic._id, floor: floorG._id, department: deptCSE._id, capacity: 65, facilities: { wifi: true, projector: true }, status: 'Available', digitalTwinMapped: true, navigationNodeId: nodeG_LH01_Ent.nodeId });
    await Room.create({ roomNumber: 'LH02', name: 'Lecture Hall 02', roomType: 'Classroom', block: blockAcademic._id, floor: floorG._id, department: deptCSE._id, capacity: 65, facilities: { wifi: true, projector: true }, status: 'Available', digitalTwinMapped: true, navigationNodeId: nodeG_LH02_Ent.nodeId });
    await Room.create({ roomNumber: 'LH03', name: 'Lecture Hall 03', roomType: 'Classroom', block: blockAcademic._id, floor: floorG._id, department: deptAIDS._id, capacity: 65, facilities: { wifi: true, projector: true }, status: 'Available', digitalTwinMapped: true, navigationNodeId: nodeG_LH03_Ent.nodeId });
    await Room.create({ roomNumber: 'LH04', name: 'Lecture Hall 04', roomType: 'Classroom', block: blockAcademic._id, floor: floorG._id, department: deptAIDS._id, capacity: 65, facilities: { wifi: true, projector: true }, status: 'Available', digitalTwinMapped: true, navigationNodeId: nodeG_LH04_Ent.nodeId });
    await Room.create({ roomNumber: 'LH05', name: 'Lecture Hall 05', roomType: 'Classroom', block: blockAcademic._id, floor: floorG._id, department: deptECE._id, capacity: 65, facilities: { wifi: true, projector: true }, status: 'Available', digitalTwinMapped: true, navigationNodeId: nodeG_LH05_Ent.nodeId });
    await Room.create({ roomNumber: 'LH06', name: 'Lecture Hall 06', roomType: 'Classroom', block: blockAcademic._id, floor: floorG._id, department: deptECE._id, capacity: 65, facilities: { wifi: true, projector: true }, status: 'Available', digitalTwinMapped: true, navigationNodeId: nodeG_LH06_Ent.nodeId });

    // --- FIRST FLOOR ROOMS ---
    await Room.create({ roomNumber: 'LH07', name: 'Lecture Hall 07', roomType: 'Classroom', block: blockAcademic._id, floor: floor1._id, department: deptCSE._id, capacity: 65, facilities: { wifi: true, projector: true }, status: 'Available', digitalTwinMapped: true, navigationNodeId: node1_LH07_Ent.nodeId });
    await Room.create({ roomNumber: 'LH08', name: 'Lecture Hall 08', roomType: 'Classroom', block: blockAcademic._id, floor: floor1._id, department: deptCSE._id, capacity: 65, facilities: { wifi: true, projector: true }, status: 'Available', digitalTwinMapped: true, navigationNodeId: node1_LH08_Ent.nodeId });
    await Room.create({ roomNumber: 'LH09', name: 'Lecture Hall 09', roomType: 'Classroom', block: blockAcademic._id, floor: floor1._id, department: deptAIDS._id, capacity: 65, facilities: { wifi: true, projector: true }, status: 'Available', digitalTwinMapped: true, navigationNodeId: node1_LH09_Ent.nodeId });
    await Room.create({ roomNumber: 'LH10', name: 'Lecture Hall 10', roomType: 'Classroom', block: blockAcademic._id, floor: floor1._id, department: deptAIDS._id, capacity: 65, facilities: { wifi: true, projector: true }, status: 'Available', digitalTwinMapped: true, navigationNodeId: node1_LH10_Ent.nodeId });
    await Room.create({ roomNumber: 'LH11', name: 'Lecture Hall 11', roomType: 'Classroom', block: blockAcademic._id, floor: floor1._id, department: deptECE._id, capacity: 65, facilities: { wifi: true, projector: true }, status: 'Available', digitalTwinMapped: true, navigationNodeId: node1_LH11_Ent.nodeId });
    await Room.create({ roomNumber: 'LH12', name: 'Lecture Hall 12', roomType: 'Classroom', block: blockAcademic._id, floor: floor1._id, department: deptECE._id, capacity: 65, facilities: { wifi: true, projector: true }, status: 'Available', digitalTwinMapped: true, navigationNodeId: node1_LH12_Ent.nodeId });

    // --- SECOND FLOOR ROOMS ---
    await Room.create({ roomNumber: 'LH13', name: 'Lecture Hall 13', roomType: 'Classroom', block: blockAcademic._id, floor: floor2._id, department: deptMech._id, capacity: 65, facilities: { wifi: true, projector: true }, status: 'Available', digitalTwinMapped: true, navigationNodeId: node2_LH13_Ent.nodeId });
    await Room.create({ roomNumber: 'LH14', name: 'Lecture Hall 14', roomType: 'Classroom', block: blockAcademic._id, floor: floor2._id, department: deptMech._id, capacity: 65, facilities: { wifi: true, projector: true }, status: 'Available', digitalTwinMapped: true, navigationNodeId: node2_LH14_Ent.nodeId });
    await Room.create({ roomNumber: 'SH01', name: 'Seminar Hall 1', roomType: 'Seminar Hall', block: blockAcademic._id, floor: floor2._id, department: deptCSE._id, capacity: 180, facilities: { wifi: true, projector: true, airConditioning: true }, status: 'Available', digitalTwinMapped: true, navigationNodeId: node2_SemHall1_Ent.nodeId });
    await Room.create({ roomNumber: 'LH15', name: 'Lecture Hall 15', roomType: 'Classroom', block: blockAcademic._id, floor: floor2._id, department: deptMech._id, capacity: 65, facilities: { wifi: true, projector: true }, status: 'Available', digitalTwinMapped: true, navigationNodeId: node2_LH15_Ent.nodeId });
    await Room.create({ roomNumber: 'LH16', name: 'Lecture Hall 16', roomType: 'Classroom', block: blockAcademic._id, floor: floor2._id, department: deptMech._id, capacity: 65, facilities: { wifi: true, projector: true }, status: 'Available', digitalTwinMapped: true, navigationNodeId: node2_LH16_Ent.nodeId });

    // --- THIRD FLOOR ROOMS ---
    const roomLH19 = await Room.create({ roomNumber: 'LH19', name: 'Lecture Hall 19', roomType: 'Classroom', block: blockAcademic._id, floor: floor3._id, department: deptAIDS._id, capacity: 65, facilities: { wifi: true, projector: true }, status: 'Available', digitalTwinMapped: true, navigationNodeId: node3_LH19_Ent.nodeId });
    const roomLH20 = await Room.create({ roomNumber: 'LH20', name: 'Lecture Hall 20', roomType: 'Classroom', block: blockAcademic._id, floor: floor3._id, department: deptAIDS._id, capacity: 65, facilities: { wifi: true, projector: true }, status: 'Available', digitalTwinMapped: true, navigationNodeId: node3_LH20_Ent.nodeId });
    await Room.create({ roomNumber: 'LH17', name: 'Lecture Hall 17', roomType: 'Classroom', block: blockAcademic._id, floor: floor3._id, department: deptCSE._id, capacity: 65, facilities: { wifi: true, projector: true }, status: 'Available', digitalTwinMapped: true, navigationNodeId: node3_LH17_Ent.nodeId });
    await Room.create({ roomNumber: 'LH18', name: 'Lecture Hall 18', roomType: 'Classroom', block: blockAcademic._id, floor: floor3._id, department: deptCSE._id, capacity: 65, facilities: { wifi: true, projector: true }, status: 'Available', digitalTwinMapped: true, navigationNodeId: node3_LH18_Ent.nodeId });
    await Room.create({ roomNumber: 'LH21', name: 'Lecture Hall 21', roomType: 'Classroom', block: blockAcademic._id, floor: floor3._id, department: deptECE._id, capacity: 65, facilities: { wifi: true, projector: true }, status: 'Available', digitalTwinMapped: true, navigationNodeId: node3_LH21_Ent.nodeId });
    await Room.create({ roomNumber: 'LH22', name: 'Lecture Hall 22', roomType: 'Classroom', block: blockAcademic._id, floor: floor3._id, department: deptECE._id, capacity: 65, facilities: { wifi: true, projector: true }, status: 'Available', digitalTwinMapped: true, navigationNodeId: node3_LH22_Ent.nodeId });
    await Room.create({ roomNumber: 'LH23A', name: 'Lecture Hall 23A', roomType: 'Classroom', block: blockAcademic._id, floor: floor3._id, department: deptMech._id, capacity: 50, facilities: { wifi: true, projector: true }, status: 'Available', digitalTwinMapped: true, navigationNodeId: node3_LH23A_Ent.nodeId });
    await Room.create({ roomNumber: 'LH23B', name: 'Lecture Hall 23B', roomType: 'Classroom', block: blockAcademic._id, floor: floor3._id, department: deptMech._id, capacity: 50, facilities: { wifi: true, projector: true }, status: 'Available', digitalTwinMapped: true, navigationNodeId: node3_LH23B_Ent.nodeId });
    await Room.create({ roomNumber: 'LH23', name: 'Lecture Hall 23', roomType: 'Classroom', block: blockAcademic._id, floor: floor3._id, department: deptMech._id, capacity: 65, facilities: { wifi: true, projector: true }, status: 'Available', digitalTwinMapped: true, navigationNodeId: node3_LH23_Ent.nodeId });

    await Room.create({ roomNumber: 'G101', name: 'SIET Central Admin Reception', roomType: 'Office', block: blockAdmin._id, floor: floorAdminG._id, capacity: 20, facilities: { wifi: true, airConditioning: true }, status: 'Available' });

    console.log('Seeding faculty...');
    await Faculty.create([
      { employeeId: 'EMP_CSE_01', name: 'Dr. R. Meenakshi', department: deptCSE._id, designation: 'Professor & Head', email: 'meenakshi.r@sreeshakthi.edu.in', phone: '+91 98422 11223', officeRoom: roomLH19._id, subjects: ['Data Structures', 'Database Systems'] },
      { employeeId: 'EMP_AIDS_01', name: 'Dr. S. Priya', department: deptAIDS._id, designation: 'Associate Professor', email: 'priya.s@sreeshakthi.edu.in', phone: '+91 98422 33445', officeRoom: roomLH20._id, subjects: ['Artificial Intelligence', 'Machine Learning'] }
    ]);

    console.log('Database seeded successfully for Academic Block Digital Twin including 3rd Floor!');
    process.exit();
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedData();
