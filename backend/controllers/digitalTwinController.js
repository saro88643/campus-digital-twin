import Room from '../models/Room.js';
import Block from '../models/Block.js';
import Floor from '../models/Floor.js';
import FloorPlan from '../models/FloorPlan.js';
import NavigationNode from '../models/NavigationNode.js';
import NavigationEdge from '../models/NavigationEdge.js';

// @desc    Get Digital Twin statistics
// @route   GET /api/digital-twin/stats
// @access  Public
export const getDigitalTwinStats = async (req, res) => {
  try {
    const totalRooms = await Room.countDocuments();
    const mappedRooms = await Room.countDocuments({ digitalTwinMapped: true });
    const unmappedRooms = totalRooms - mappedRooms;
    const coveragePercent = totalRooms > 0 ? ((mappedRooms / totalRooms) * 100).toFixed(1) : 0;

    const totalBlocks = await Block.countDocuments();
    const totalFloors = await Floor.countDocuments();
    const totalNodes = await NavigationNode.countDocuments();
    const totalEdges = await NavigationEdge.countDocuments();
    const publishedFloors = await Floor.countDocuments({ isPublished: true });

    res.status(200).json({
      success: true,
      data: {
        totalRooms,
        mappedRooms,
        unmappedRooms,
        coveragePercent: Number(coveragePercent),
        totalBlocks,
        totalFloors,
        totalNodes,
        totalEdges,
        publishedFloors,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get floor plan layout elements for a floor
// @route   GET /api/digital-twin/floor-plan/:floorId
// @access  Public
export const getFloorPlan = async (req, res) => {
  try {
    const { floorId } = req.params;
    let floorPlan = await FloorPlan.findOne({ floor: floorId }).populate('elements.roomId');

    if (!floorPlan) {
      const floor = await Floor.findById(floorId);
      if (!floor) {
        return res.status(404).json({ success: false, message: 'Floor not found' });
      }
      floorPlan = {
        floor: floorId,
        block: floor.block,
        elements: [],
        version: 1,
        isPublished: false,
      };
    }

    res.status(200).json({ success: true, data: floorPlan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Save/publish floor plan drawing elements
// @route   POST /api/digital-twin/floor-plan/:floorId
// @access  Private/Admin
export const saveFloorPlan = async (req, res) => {
  try {
    const { floorId } = req.params;
    const { elements, isPublished, calibration } = req.body;

    const floor = await Floor.findById(floorId);
    if (!floor) {
      return res.status(404).json({ success: false, message: 'Floor not found' });
    }

    if (calibration) {
      floor.calibration = calibration;
    }
    if (isPublished !== undefined) {
      floor.isPublished = isPublished;
      floor.status = isPublished ? 'Published' : 'Draft';
    }
    await floor.save();

    let floorPlan = await FloorPlan.findOne({ floor: floorId });
    if (floorPlan) {
      floorPlan.elements = elements || [];
      floorPlan.isPublished = isPublished !== undefined ? isPublished : floorPlan.isPublished;
      floorPlan.version = (floorPlan.version || 1) + 1;
      await floorPlan.save();
    } else {
      floorPlan = await FloorPlan.create({
        floor: floorId,
        block: floor.block,
        elements: elements || [],
        isPublished: !!isPublished,
        version: 1,
      });
    }

    res.status(200).json({ success: true, data: floorPlan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Map a room to geometry and entrance node
// @route   POST /api/digital-twin/map-room
// @access  Private/Admin
export const mapRoom = async (req, res) => {
  try {
    const { roomId, geometry, entrance, navigationNodeId } = req.body;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    room.digitalTwinMapped = true;
    if (geometry) room.geometry = geometry;
    if (entrance) room.entrance = entrance;
    if (navigationNodeId) room.navigationNodeId = navigationNodeId;

    await room.save();

    res.status(200).json({
      success: true,
      message: `Room ${room.roomNumber} mapped successfully`,
      data: room,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Validate Digital Twin integrity
// @route   POST /api/digital-twin/validate
// @access  Private/Admin
export const validateDigitalTwin = async (req, res) => {
  try {
    const errors = [];
    const warnings = [];

    const rooms = await Room.find().populate('block floor');
    const nodes = await NavigationNode.find();
    const edges = await NavigationEdge.find();

    let mappedCount = 0;

    for (const room of rooms) {
      if (!room.digitalTwinMapped) {
        warnings.push(`Room ${room.roomNumber} (${room.name}) is NOT MAPPED.`);
      } else {
        mappedCount++;
        if (!room.entrance || !room.entrance.x) {
          errors.push(`Mapped room ${room.roomNumber} lacks entrance coordinates.`);
        }
        if (!room.navigationNodeId) {
          warnings.push(`Mapped room ${room.roomNumber} is not assigned a navigation node ID.`);
        } else {
          const matchedNode = nodes.find((n) => n.nodeId === room.navigationNodeId);
          if (!matchedNode) {
            errors.push(`Room ${room.roomNumber} points to missing navigation node ${room.navigationNodeId}.`);
          }
        }
      }
    }

    // Node check
    for (const node of nodes) {
      const connectedEdges = edges.filter(
        (e) => e.fromNode === node.nodeId || e.toNode === node.nodeId
      );
      if (connectedEdges.length === 0) {
        errors.push(`Navigation Node ${node.nodeId} on level ${node.floorNumber} is isolated (0 edges).`);
      }
    }

    // Health Score calculation
    const totalRooms = rooms.length;
    const mappingRatio = totalRooms > 0 ? mappedCount / totalRooms : 1;
    const errorPenalty = errors.length * 5;
    const healthScore = Math.max(0, Math.min(100, Math.round(mappingRatio * 100 - errorPenalty)));

    res.status(200).json({
      success: true,
      data: {
        healthScore,
        mappedCount,
        totalRooms,
        valid: errors.length === 0,
        errors,
        warnings,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
