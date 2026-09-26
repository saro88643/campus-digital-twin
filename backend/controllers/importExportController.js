import Block from '../models/Block.js';
import Floor from '../models/Floor.js';
import Room from '../models/Room.js';
import Department from '../models/Department.js';
import Faculty from '../models/Faculty.js';
import Campus from '../models/Campus.js';
import FloorPlan from '../models/FloorPlan.js';
import NavigationNode from '../models/NavigationNode.js';
import NavigationEdge from '../models/NavigationEdge.js';

// @desc    Import bulk data from CSV or JSON
// @route   POST /api/import-export/import
// @access  Private/Admin
export const importData = async (req, res) => {
  try {
    const { csvText, jsonItems, entityType } = req.body;

    let itemsToProcess = [];

    if (jsonItems && Array.isArray(jsonItems)) {
      itemsToProcess = jsonItems;
    } else if (csvText && typeof csvText === 'string') {
      const lines = csvText.trim().split('\n');
      if (lines.length > 1) {
        const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(',').map((cell) => cell.trim());
          if (row.length === headers.length) {
            const item = {};
            headers.forEach((h, idx) => {
              item[h] = row[idx];
            });
            itemsToProcess.push(item);
          }
        }
      }
    }

    let imported = itemsToProcess.length;
    let successful = 0;
    let duplicate = 0;
    let invalid = 0;
    const errors = [];

    const defaultBlock = await Block.findOne();
    const defaultFloor = await Floor.findOne();

    for (const item of itemsToProcess) {
      try {
        if (entityType === 'rooms' || item.room_number || item.roomNumber) {
          const roomNum = item.room_number || item.roomNumber;
          const name = item.room_name || item.name || `Room ${roomNum}`;

          if (!roomNum) {
            invalid++;
            continue;
          }

          const existing = await Room.findOne({ roomNumber: roomNum });
          if (existing) {
            duplicate++;
            continue;
          }

          let blockObj = defaultBlock;
          if (item.building || item.block) {
            const bName = item.building || item.block;
            let foundBlock = await Block.findOne({
              $or: [{ name: new RegExp(bName, 'i') }, { code: new RegExp(bName, 'i') }],
            });
            if (!foundBlock) {
              foundBlock = await Block.create({ name: bName, code: bName.substring(0, 5).toUpperCase() });
            }
            blockObj = foundBlock;
          }

          let floorObj = defaultFloor;
          if (item.floor) {
            const fNum = parseInt(item.floor) || 0;
            let foundFloor = await Floor.findOne({ block: blockObj._id, floorNumber: fNum });
            if (!foundFloor) {
              foundFloor = await Floor.create({ name: `Floor ${fNum}`, floorNumber: fNum, block: blockObj._id });
            }
            floorObj = foundFloor;
          }

          await Room.create({
            roomNumber: roomNum,
            name: name,
            roomType: item.type || item.roomType || 'Classroom',
            block: blockObj._id,
            floor: floorObj._id,
            capacity: parseInt(item.capacity) || 40,
            status: 'Available',
          });

          successful++;
        } else if (entityType === 'departments' || item.code) {
          const existing = await Department.findOne({ code: item.code });
          if (existing) {
            duplicate++;
            continue;
          }
          await Department.create({
            name: item.name || item.department,
            code: item.code,
            head: item.head || item.hod,
            email: item.email,
          });
          successful++;
        } else {
          invalid++;
        }
      } catch (err) {
        invalid++;
        errors.push(err.message);
      }
    }

    res.status(200).json({
      success: true,
      data: {
        imported,
        successful,
        duplicate,
        invalid,
        errors,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export Digital Twin backup configuration
// @route   GET /api/import-export/export
// @access  Private/Admin
export const exportData = async (req, res) => {
  try {
    const campus = await Campus.findOne();
    const blocks = await Block.find();
    const floors = await Floor.find();
    const rooms = await Room.find();
    const departments = await Department.find();
    const faculty = await Faculty.find();
    const floorPlans = await FloorPlan.find();
    const nodes = await NavigationNode.find();
    const edges = await NavigationEdge.find();

    const backup = {
      exportTimestamp: new Date().toISOString(),
      institution: campus?.name || 'Sri Shakthi Institute of Engineering and Technology',
      campus,
      blocks,
      floors,
      rooms,
      departments,
      faculty,
      floorPlans,
      navigation: {
        nodes,
        edges,
      },
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=siet-digital-twin-backup.json');
    res.status(200).json(backup);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
