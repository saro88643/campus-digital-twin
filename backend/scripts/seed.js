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
    await User.create({ name: 'Administrator', email: 'admin@campus.edu', password: 'admin123', role: 'admin' });
    await User.create({ name: 'SIET Student', email: 'user@campus.edu', password: 'user123', role: 'user' });

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
      contact: { email: 'info@sreeshakthi.edu.in', phone: '+91 422 2683300', website: 'https://www.sreeshakthi.edu.in' },
      principal: 'Dr. R. Prakash',
      campusArea: '30 Acres',
      coordinates: { latitude: 11.0315, longitude: 77.0654 },
      vision: 'To be an institution of excellence in technical education and research producing ethical engineers.',
      mission: 'Provide state-of-the-art infrastructure, quality education, industry collaboration and value-based training.',
      accreditation: 'NAAC A+ Grade, NBA Accredited Programs',
      affiliation: 'Anna University, Chennai (Approved by AICTE, New Delhi)'
    });

    console.log('Seeding SIET departments...');
    const deptCSE = await Department.create({ name: 'Computer Science & Engineering', code: 'CSE' });
    const deptAIDS = await Department.create({ name: 'Artificial Intelligence & Data Science', code: 'AI&DS' });
    const deptECE = await Department.create({ name: 'Electronics & Communication Engineering', code: 'ECE' });
    const deptMech = await Department.create({ name: 'Mechanical Engineering', code: 'MECH' });
    const deptIT = await Department.create({ name: 'Information Technology', code: 'IT' });
    const deptAIML = await Department.create({ name: 'AI & Machine Learning', code: 'AIML' });
    const deptCyber = await Department.create({ name: 'Cyber Security', code: 'CYBER' });
    const deptCivil = await Department.create({ name: 'Civil Engineering', code: 'CIVIL' });
    const deptEEE = await Department.create({ name: 'Electrical & Electronics Engineering', code: 'EEE' });

    console.log('Seeding SIET blocks...');
    const blockAcademic = await Block.create({
      name: 'Academic Block',
      code: 'ACAB',
      buildingType: 'Academic',
      floorsCount: 4,
      description: 'Academic Block featuring Lecture Halls (LH01 - LH23), Seminar Hall 1, and Central Quadrangle.',
      location: 'Central Campus Quadrangle',
      departments: [deptCSE._id, deptAIDS._id, deptECE._id, deptMech._id],
      status: 'Active'
    });

    const blockAdmin = await Block.create({
      name: 'Administrative Block',
      code: 'ADMB',
      buildingType: 'Administrative',
      floorsCount: 4,
      description: 'Administrative Block featuring Computer Labs (CL01 - CL15), Lecture Halls (LH24 - LH55), Department Offices, Library, and Auditorium.',
      location: 'Main Gate Quadrangle',
      departments: [deptIT._id, deptAIML._id, deptCyber._id, deptCivil._id, deptEEE._id],
      status: 'Active'
    });

    console.log('Seeding Academic Block floors...');
    const floorAcaG = await Floor.create({ name: 'Ground Floor', floorNumber: 0, block: blockAcademic._id, isPublished: true, status: 'Published' });
    const floorAca1 = await Floor.create({ name: 'First Floor', floorNumber: 1, block: blockAcademic._id, isPublished: true, status: 'Published' });
    const floorAca2 = await Floor.create({ name: 'Second Floor', floorNumber: 2, block: blockAcademic._id, isPublished: true, status: 'Published' });
    const floorAca3 = await Floor.create({ name: 'Third Floor', floorNumber: 3, block: blockAcademic._id, isPublished: true, status: 'Published' });

    console.log('Seeding Administrative Block floors...');
    const floorAdmG = await Floor.create({ name: 'Ground Floor', floorNumber: 0, block: blockAdmin._id, isPublished: true, status: 'Published' });
    const floorAdm1 = await Floor.create({ name: 'First Floor', floorNumber: 1, block: blockAdmin._id, isPublished: true, status: 'Published' });
    const floorAdm2 = await Floor.create({ name: 'Second Floor', floorNumber: 2, block: blockAdmin._id, isPublished: true, status: 'Published' });
    const floorAdm3 = await Floor.create({ name: 'Third Floor', floorNumber: 3, block: blockAdmin._id, isPublished: true, status: 'Published' });

    console.log('Seeding navigation nodes...');
    // ACADEMIC BLOCK NODES
    const nodeAcaEntry = await NavigationNode.create({ nodeId: 'NODE_ACAB_G_ENTRY', block: blockAcademic._id, floor: floorAcaG._id, floorNumber: 0, x: 400, y: 440, nodeType: 'Building Entrance', label: 'Academic Block Entry' });
    const nodeAcaExit = await NavigationNode.create({ nodeId: 'NODE_ACAB_G_EXIT', block: blockAcademic._id, floor: floorAcaG._id, floorNumber: 0, x: 400, y: 60, nodeType: 'Exit', label: 'Academic Block Exit' });
    const nodeAcaStairsWestG = await NavigationNode.create({ nodeId: 'NODE_ACAB_G_STAIRS_WEST', block: blockAcademic._id, floor: floorAcaG._id, floorNumber: 0, x: 220, y: 250, nodeType: 'Stair', label: 'West Stairs (Ground)' });
    const nodeAcaStairsEastG = await NavigationNode.create({ nodeId: 'NODE_ACAB_G_STAIRS_EAST', block: blockAcademic._id, floor: floorAcaG._id, floorNumber: 0, x: 580, y: 250, nodeType: 'Stair', label: 'East Stairs (Ground)' });

    // ADMIN BLOCK NODES
    const nodeAdmEntry = await NavigationNode.create({ nodeId: 'NODE_ADMB_G_ENTRY', block: blockAdmin._id, floor: floorAdmG._id, floorNumber: 0, x: 400, y: 440, nodeType: 'Building Entrance', label: 'Admin Block Entry' });
    const nodeAdmStairs1 = await NavigationNode.create({ nodeId: 'NODE_ADMB_1_STAIRS', block: blockAdmin._id, floor: floorAdm1._id, floorNumber: 1, x: 580, y: 250, nodeType: 'Stair', label: 'Admin Stairs (Floor 1)' });
    const nodeAdmStairs2 = await NavigationNode.create({ nodeId: 'NODE_ADMB_2_STAIRS', block: blockAdmin._id, floor: floorAdm2._id, floorNumber: 2, x: 580, y: 250, nodeType: 'Stair', label: 'Admin Stairs (Floor 2)' });
    const nodeAdmStairs3 = await NavigationNode.create({ nodeId: 'NODE_ADMB_3_STAIRS', block: blockAdmin._id, floor: floorAdm3._id, floorNumber: 3, x: 580, y: 250, nodeType: 'Stair', label: 'Admin Stairs (Floor 3)' });

    console.log('Seeding rooms for Academic Block...');
    // ACADEMIC BLOCK ROOMS
    const roomLH01 = await Room.create({ roomNumber: 'LH01', name: 'Lecture Hall 01', roomType: 'Classroom', block: blockAcademic._id, floor: floorAcaG._id, capacity: 65, digitalTwinMapped: true, navigationNodeId: nodeAcaEntry.nodeId });
    await Room.create({ roomNumber: 'LH02', name: 'Lecture Hall 02', roomType: 'Classroom', block: blockAcademic._id, floor: floorAcaG._id, capacity: 65, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'LH03', name: 'Lecture Hall 03', roomType: 'Classroom', block: blockAcademic._id, floor: floorAcaG._id, capacity: 65, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'LH04', name: 'Lecture Hall 04', roomType: 'Classroom', block: blockAcademic._id, floor: floorAcaG._id, capacity: 65, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'LH05', name: 'Lecture Hall 05', roomType: 'Classroom', block: blockAcademic._id, floor: floorAcaG._id, capacity: 65, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'LH06', name: 'Lecture Hall 06', roomType: 'Classroom', block: blockAcademic._id, floor: floorAcaG._id, capacity: 65, digitalTwinMapped: true });

    await Room.create({ roomNumber: 'LH07', name: 'Lecture Hall 07', roomType: 'Classroom', block: blockAcademic._id, floor: floorAca1._id, capacity: 65, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'LH08', name: 'Lecture Hall 08', roomType: 'Classroom', block: blockAcademic._id, floor: floorAca1._id, capacity: 65, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'LH09', name: 'Lecture Hall 09', roomType: 'Classroom', block: blockAcademic._id, floor: floorAca1._id, capacity: 65, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'LH10', name: 'Lecture Hall 10', roomType: 'Classroom', block: blockAcademic._id, floor: floorAca1._id, capacity: 65, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'LH11', name: 'Lecture Hall 11', roomType: 'Classroom', block: blockAcademic._id, floor: floorAca1._id, capacity: 65, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'LH12', name: 'Lecture Hall 12', roomType: 'Classroom', block: blockAcademic._id, floor: floorAca1._id, capacity: 65, digitalTwinMapped: true });

    await Room.create({ roomNumber: 'LH13', name: 'Lecture Hall 13', roomType: 'Classroom', block: blockAcademic._id, floor: floorAca2._id, capacity: 65, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'LH14', name: 'Lecture Hall 14', roomType: 'Classroom', block: blockAcademic._id, floor: floorAca2._id, capacity: 65, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'SH01', name: 'Seminar Hall 1', roomType: 'Seminar Hall', block: blockAcademic._id, floor: floorAca2._id, capacity: 180, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'LH15', name: 'Lecture Hall 15', roomType: 'Classroom', block: blockAcademic._id, floor: floorAca2._id, capacity: 65, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'LH16', name: 'Lecture Hall 16', roomType: 'Classroom', block: blockAcademic._id, floor: floorAca2._id, capacity: 65, digitalTwinMapped: true });

    await Room.create({ roomNumber: 'LH17', name: 'Lecture Hall 17', roomType: 'Classroom', block: blockAcademic._id, floor: floorAca3._id, capacity: 65, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'LH18', name: 'Lecture Hall 18', roomType: 'Classroom', block: blockAcademic._id, floor: floorAca3._id, capacity: 65, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'LH19', name: 'Lecture Hall 19', roomType: 'Classroom', block: blockAcademic._id, floor: floorAca3._id, capacity: 65, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'LH20', name: 'Lecture Hall 20', roomType: 'Classroom', block: blockAcademic._id, floor: floorAca3._id, capacity: 65, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'LH21', name: 'Lecture Hall 21', roomType: 'Classroom', block: blockAcademic._id, floor: floorAca3._id, capacity: 65, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'LH22', name: 'Lecture Hall 22', roomType: 'Classroom', block: blockAcademic._id, floor: floorAca3._id, capacity: 65, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'LH23A', name: 'Lecture Hall 23A', roomType: 'Classroom', block: blockAcademic._id, floor: floorAca3._id, capacity: 50, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'LH23B', name: 'Lecture Hall 23B', roomType: 'Classroom', block: blockAcademic._id, floor: floorAca3._id, capacity: 50, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'LH23', name: 'Lecture Hall 23', roomType: 'Classroom', block: blockAcademic._id, floor: floorAca3._id, capacity: 65, digitalTwinMapped: true });

    console.log('Seeding rooms for Administrative Block...');
    // --- ADMINISTRATIVE BLOCK: GROUND FLOOR ---
    const roomLH51 = await Room.create({ roomNumber: 'LH51', name: 'Lecture Hall 51', roomType: 'Classroom', block: blockAdmin._id, floor: floorAdmG._id, capacity: 60, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'LH52', name: 'Lecture Hall 52', roomType: 'Classroom', block: blockAdmin._id, floor: floorAdmG._id, capacity: 60, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'LH50', name: 'Lecture Hall 50', roomType: 'Classroom', block: blockAdmin._id, floor: floorAdmG._id, capacity: 60, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'MECH_LAB', name: 'Mechanical Laboratory', roomType: 'Laboratory', block: blockAdmin._id, floor: floorAdmG._id, capacity: 40, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'MECH_DEPT', name: 'Mechanical Department Office', roomType: 'Office', block: blockAdmin._id, floor: floorAdmG._id, capacity: 20, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'EEE_LAB', name: 'EEE Laboratory', roomType: 'Laboratory', block: blockAdmin._id, floor: floorAdmG._id, capacity: 40, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'EEE_DEPT', name: 'EEE Department Office', roomType: 'Office', block: blockAdmin._id, floor: floorAdmG._id, capacity: 20, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'EE_LAB', name: 'EE Laboratory', roomType: 'Laboratory', block: blockAdmin._id, floor: floorAdmG._id, capacity: 40, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'AGRI_DEPT1', name: 'Agri Department Office 1', roomType: 'Office', block: blockAdmin._id, floor: floorAdmG._id, capacity: 20, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'AGRI_DEPT2', name: 'Agri Department Office 2', roomType: 'Office', block: blockAdmin._id, floor: floorAdmG._id, capacity: 20, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'CIVIL_DEPT', name: 'Civil Department Office', roomType: 'Office', block: blockAdmin._id, floor: floorAdmG._id, capacity: 20, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'SM_LAB', name: 'Strength of Materials Lab', roomType: 'Laboratory', block: blockAdmin._id, floor: floorAdmG._id, capacity: 40, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'LIBRARY', name: 'Central College Library', roomType: 'Library', block: blockAdmin._id, floor: floorAdmG._id, capacity: 150, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'SH02', name: 'Seminar Hall 2', roomType: 'Seminar Hall', block: blockAdmin._id, floor: floorAdmG._id, capacity: 150, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'OFFICE_ROOM', name: 'Main Administrative Office Room', roomType: 'Office', block: blockAdmin._id, floor: floorAdmG._id, capacity: 30, digitalTwinMapped: true });

    // --- ADMINISTRATIVE BLOCK: FIRST FLOOR ---
    const roomLH36 = await Room.create({ roomNumber: 'LH36', name: 'Lecture Hall 36', roomType: 'Classroom', block: blockAdmin._id, floor: floorAdm1._id, capacity: 60, digitalTwinMapped: true, navigationNodeId: nodeAdmStairs1.nodeId });
    await Room.create({ roomNumber: 'CL01', name: 'Computer Lab 01', roomType: 'Computer Lab', block: blockAdmin._id, floor: floorAdm1._id, capacity: 60, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'CL07', name: 'Computer Lab 07', roomType: 'Computer Lab', block: blockAdmin._id, floor: floorAdm1._id, capacity: 60, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'CL12', name: 'Computer Lab 12', roomType: 'Computer Lab', block: blockAdmin._id, floor: floorAdm1._id, capacity: 60, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'LH37', name: 'Lecture Hall 37', roomType: 'Classroom', block: blockAdmin._id, floor: floorAdm1._id, capacity: 60, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'LH30', name: 'Lecture Hall 30', roomType: 'Classroom', block: blockAdmin._id, floor: floorAdm1._id, capacity: 60, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'LH46', name: 'Lecture Hall 46', roomType: 'Classroom', block: blockAdmin._id, floor: floorAdm1._id, capacity: 60, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'LH47', name: 'Lecture Hall 47', roomType: 'Classroom', block: blockAdmin._id, floor: floorAdm1._id, capacity: 60, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'CSE_DEPT', name: 'CSE Department Office', roomType: 'Office', block: blockAdmin._id, floor: floorAdm1._id, capacity: 25, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'IT_DEPT', name: 'IT Department Office', roomType: 'Office', block: blockAdmin._id, floor: floorAdm1._id, capacity: 25, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'AIML_DEPT', name: 'AIML Department Office', roomType: 'Office', block: blockAdmin._id, floor: floorAdm1._id, capacity: 25, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'ECE_DEPT', name: 'ECE Department Office', roomType: 'Office', block: blockAdmin._id, floor: floorAdm1._id, capacity: 25, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'CHEM_DEPT', name: 'Chemistry Department Office', roomType: 'Office', block: blockAdmin._id, floor: floorAdm1._id, capacity: 20, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'ENG_DEPT', name: 'English Department Office', roomType: 'Office', block: blockAdmin._id, floor: floorAdm1._id, capacity: 20, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'PHY_LAB', name: 'Physics Laboratory', roomType: 'Laboratory', block: blockAdmin._id, floor: floorAdm1._id, capacity: 40, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'PROZONE_LAB', name: 'Prozone Innovation Lab', roomType: 'Laboratory', block: blockAdmin._id, floor: floorAdm1._id, capacity: 40, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'ECELL', name: 'Entrepreneurship Cell (E-Cell)', roomType: 'Office', block: blockAdmin._id, floor: floorAdm1._id, capacity: 20, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'ECE_LAB', name: 'ECE Hardware Lab', roomType: 'Laboratory', block: blockAdmin._id, floor: floorAdm1._id, capacity: 40, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'BIOTECH_LAB', name: 'Bio-Tech Laboratory', roomType: 'Laboratory', block: blockAdmin._id, floor: floorAdm1._id, capacity: 40, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'PLANT_LAB', name: 'Plant Tissue Culture Lab', roomType: 'Laboratory', block: blockAdmin._id, floor: floorAdm1._id, capacity: 40, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'EXAM_CELL', name: 'Controller of Examinations Cell', roomType: 'Office', block: blockAdmin._id, floor: floorAdm1._id, capacity: 30, digitalTwinMapped: true });

    // --- ADMINISTRATIVE BLOCK: SECOND FLOOR ---
    const roomLH38 = await Room.create({ roomNumber: 'LH38', name: 'Lecture Hall 38', roomType: 'Classroom', block: blockAdmin._id, floor: floorAdm2._id, capacity: 60, digitalTwinMapped: true, navigationNodeId: nodeAdmStairs2.nodeId });
    await Room.create({ roomNumber: 'CL02', name: 'Computer Lab 02', roomType: 'Computer Lab', block: blockAdmin._id, floor: floorAdm2._id, capacity: 60, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'CL03', name: 'Computer Lab 03', roomType: 'Computer Lab', block: blockAdmin._id, floor: floorAdm2._id, capacity: 60, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'CL06', name: 'Computer Lab 06', roomType: 'Computer Lab', block: blockAdmin._id, floor: floorAdm2._id, capacity: 60, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'CL09', name: 'Computer Lab 09', roomType: 'Computer Lab', block: blockAdmin._id, floor: floorAdm2._id, capacity: 60, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'CL10', name: 'Computer Lab 10', roomType: 'Computer Lab', block: blockAdmin._id, floor: floorAdm2._id, capacity: 60, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'CL11', name: 'Computer Lab 11', roomType: 'Computer Lab', block: blockAdmin._id, floor: floorAdm2._id, capacity: 60, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'CL13', name: 'Computer Lab 13', roomType: 'Computer Lab', block: blockAdmin._id, floor: floorAdm2._id, capacity: 60, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'LH39', name: 'Lecture Hall 39', roomType: 'Classroom', block: blockAdmin._id, floor: floorAdm2._id, capacity: 60, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'LH32', name: 'Lecture Hall 32', roomType: 'Classroom', block: blockAdmin._id, floor: floorAdm2._id, capacity: 60, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'LH33', name: 'Lecture Hall 33', roomType: 'Classroom', block: blockAdmin._id, floor: floorAdm2._id, capacity: 60, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'LH42', name: 'Lecture Hall 42', roomType: 'Classroom', block: blockAdmin._id, floor: floorAdm2._id, capacity: 60, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'LH43', name: 'Lecture Hall 43', roomType: 'Classroom', block: blockAdmin._id, floor: floorAdm2._id, capacity: 60, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'LH48', name: 'Lecture Hall 48', roomType: 'Classroom', block: blockAdmin._id, floor: floorAdm2._id, capacity: 60, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'LH49', name: 'Lecture Hall 49', roomType: 'Classroom', block: blockAdmin._id, floor: floorAdm2._id, capacity: 60, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'LH53', name: 'Lecture Hall 53', roomType: 'Classroom', block: blockAdmin._id, floor: floorAdm2._id, capacity: 60, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'LH54', name: 'Lecture Hall 54', roomType: 'Classroom', block: blockAdmin._id, floor: floorAdm2._id, capacity: 60, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'LH55', name: 'Lecture Hall 55', roomType: 'Classroom', block: blockAdmin._id, floor: floorAdm2._id, capacity: 60, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'LH24', name: 'Lecture Hall 24', roomType: 'Classroom', block: blockAdmin._id, floor: floorAdm2._id, capacity: 60, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'LH25', name: 'Lecture Hall 25', roomType: 'Classroom', block: blockAdmin._id, floor: floorAdm2._id, capacity: 60, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'LH26', name: 'Lecture Hall 26', roomType: 'Classroom', block: blockAdmin._id, floor: floorAdm2._id, capacity: 60, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'MATHS_DEPT', name: 'Mathematics Department Office', roomType: 'Office', block: blockAdmin._id, floor: floorAdm2._id, capacity: 20, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'ELE_LAB', name: 'Electronics Core Laboratory', roomType: 'Laboratory', block: blockAdmin._id, floor: floorAdm2._id, capacity: 40, digitalTwinMapped: true });

    // --- ADMINISTRATIVE BLOCK: THIRD FLOOR ---
    const roomLH19_adm = await Room.create({ roomNumber: 'LH19_ADM', name: 'Lecture Hall 19 (Admin)', roomType: 'Classroom', block: blockAdmin._id, floor: floorAdm3._id, capacity: 60, digitalTwinMapped: true, navigationNodeId: nodeAdmStairs3.nodeId });
    await Room.create({ roomNumber: 'CL04', name: 'Computer Lab 04', roomType: 'Computer Lab', block: blockAdmin._id, floor: floorAdm3._id, capacity: 60, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'CL14', name: 'Computer Lab 14', roomType: 'Computer Lab', block: blockAdmin._id, floor: floorAdm3._id, capacity: 60, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'CL15', name: 'Computer Lab 15 (AIDS)', roomType: 'Computer Lab', block: blockAdmin._id, floor: floorAdm3._id, capacity: 60, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'LH27', name: 'Lecture Hall 27', roomType: 'Classroom', block: blockAdmin._id, floor: floorAdm3._id, capacity: 60, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'LH28', name: 'Lecture Hall 28', roomType: 'Classroom', block: blockAdmin._id, floor: floorAdm3._id, capacity: 60, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'LH34', name: 'Lecture Hall 34', roomType: 'Classroom', block: blockAdmin._id, floor: floorAdm3._id, capacity: 60, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'LH34A', name: 'Lecture Hall 34A', roomType: 'Classroom', block: blockAdmin._id, floor: floorAdm3._id, capacity: 60, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'LH34B', name: 'Lecture Hall 34B', roomType: 'Classroom', block: blockAdmin._id, floor: floorAdm3._id, capacity: 60, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'LH34C', name: 'Lecture Hall 34C', roomType: 'Classroom', block: blockAdmin._id, floor: floorAdm3._id, capacity: 60, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'LH40', name: 'Lecture Hall 40', roomType: 'Classroom', block: blockAdmin._id, floor: floorAdm3._id, capacity: 60, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'LH41', name: 'Lecture Hall 41', roomType: 'Classroom', block: blockAdmin._id, floor: floorAdm3._id, capacity: 60, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'LH44', name: 'Lecture Hall 44', roomType: 'Classroom', block: blockAdmin._id, floor: floorAdm3._id, capacity: 60, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'LH45', name: 'Lecture Hall 45', roomType: 'Classroom', block: blockAdmin._id, floor: floorAdm3._id, capacity: 60, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'CYBER_DEPT', name: 'Cyber Security Department Office', roomType: 'Office', block: blockAdmin._id, floor: floorAdm3._id, capacity: 25, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'AIDS_DEPT', name: 'AIDS Department Office', roomType: 'Office', block: blockAdmin._id, floor: floorAdm3._id, capacity: 25, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'INTEL_AI_LAB', name: 'Intel AI Excellence Laboratory', roomType: 'Laboratory', block: blockAdmin._id, floor: floorAdm3._id, capacity: 50, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'BALL_ROOM', name: 'Main Conference Ball Room', roomType: 'Auditorium', block: blockAdmin._id, floor: floorAdm3._id, capacity: 120, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'AUDITORIUM', name: 'SIET Grand Auditorium', roomType: 'Auditorium', block: blockAdmin._id, floor: floorAdm3._id, capacity: 500, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'BME_LAB01', name: 'BME Research Lab 01', roomType: 'Laboratory', block: blockAdmin._id, floor: floorAdm3._id, capacity: 30, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'BME_LAB02', name: 'BME Research Lab 02', roomType: 'Laboratory', block: blockAdmin._id, floor: floorAdm3._id, capacity: 30, digitalTwinMapped: true });
    await Room.create({ roomNumber: 'BME_LAB03', name: 'BME Research Lab 03', roomType: 'Laboratory', block: blockAdmin._id, floor: floorAdm3._id, capacity: 30, digitalTwinMapped: true });

    console.log('Seeding faculty...');
    await Faculty.create([
      { employeeId: 'EMP_CSE_01', name: 'Dr. R. Meenakshi', department: deptCSE._id, designation: 'Professor & Head', email: 'meenakshi.r@sreeshakthi.edu.in', phone: '+91 98422 11223', officeRoom: roomLH36._id, subjects: ['Data Structures', 'Database Systems'] },
      { employeeId: 'EMP_AIDS_01', name: 'Dr. S. Priya', department: deptAIDS._id, designation: 'Associate Professor', email: 'priya.s@sreeshakthi.edu.in', phone: '+91 98422 33445', officeRoom: roomLH38._id, subjects: ['Artificial Intelligence', 'Machine Learning'] }
    ]);

    console.log('Database seeded successfully for Academic Block & Administrative Block Digital Twin!');
    process.exit();
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedData();
