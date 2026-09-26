import NavigationNode from '../models/NavigationNode.js';
import NavigationEdge from '../models/NavigationEdge.js';
import Room from '../models/Room.js';
import Floor from '../models/Floor.js';
import Block from '../models/Block.js';

// @desc    Get all navigation nodes (optionally filter by floor or block)
// @route   GET /api/navigation/nodes
// @access  Public
export const getNodes = async (req, res) => {
  try {
    const { floorId, blockId } = req.query;
    const filter = {};
    if (floorId) filter.floor = floorId;
    if (blockId) filter.block = blockId;

    const nodes = await NavigationNode.find(filter).populate('room floor block');
    res.status(200).json({ success: true, count: nodes.length, data: nodes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create navigation node
// @route   POST /api/navigation/nodes
// @access  Private/Admin
export const createNode = async (req, res) => {
  try {
    const node = await NavigationNode.create(req.body);
    res.status(201).json({ success: true, data: node });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get all navigation edges
// @route   GET /api/navigation/edges
// @access  Public
export const getEdges = async (req, res) => {
  try {
    const edges = await NavigationEdge.find();
    res.status(200).json({ success: true, count: edges.length, data: edges });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create navigation edge
// @route   POST /api/navigation/edges
// @access  Private/Admin
export const createEdge = async (req, res) => {
  try {
    const edge = await NavigationEdge.create(req.body);
    res.status(201).json({ success: true, data: edge });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Calculate route using A* Pathfinding
// @route   POST /api/navigation/calculate-path
// @access  Public
export const calculatePath = async (req, res) => {
  try {
    const { startNodeId, startRoomId, startType, destinationRoomId, destinationNodeId, accessibleOnly } = req.body;

    const destRoom = destinationRoomId ? await Room.findById(destinationRoomId).populate('floor block') : null;

    let targetNodeId = destinationNodeId;
    if (!targetNodeId && destRoom) {
      targetNodeId = destRoom.navigationNodeId;
    }

    // Load nodes and edges
    const allNodes = await NavigationNode.find().populate('room floor block');
    const allEdges = await NavigationEdge.find();

    // Map nodes by ID
    const nodeMap = new Map();
    allNodes.forEach((n) => nodeMap.set(n.nodeId, n));

    // Resolve start node
    let sourceNodeId = startNodeId;
    if (!sourceNodeId && startRoomId) {
      const sRoom = await Room.findById(startRoomId);
      if (sRoom) sourceNodeId = sRoom.navigationNodeId;
    }
    if (!sourceNodeId && startType === 'Building Entrance' && destRoom) {
      const entranceNode = allNodes.find(
        (n) => String(n.block?._id || n.block) === String(destRoom.block?._id || destRoom.block) && n.nodeType === 'Building Entrance'
      );
      if (entranceNode) sourceNodeId = entranceNode.nodeId;
    }
    if (!sourceNodeId) {
      const mainEntrance = allNodes.find((n) => n.nodeType === 'Campus Entrance' || n.nodeType === 'Building Entrance');
      if (mainEntrance) sourceNodeId = mainEntrance.nodeId;
    }

    // Fallback if source or target still not found
    if (!sourceNodeId) {
      sourceNodeId = allNodes[0]?.nodeId || 'NODE_MAIN_ENTRANCE';
    }
    if (!targetNodeId) {
      targetNodeId = allNodes[allNodes.length - 1]?.nodeId || 'NODE_DEST';
    }

    // Helper: Euclidean Heuristic
    const heuristic = (id1, id2) => {
      const n1 = nodeMap.get(id1);
      const n2 = nodeMap.get(id2);
      if (!n1 || !n2) return 0;
      const dx = n1.x - n2.x;
      const dy = n1.y - n2.y;
      const dz = (n1.floorNumber - n2.floorNumber) * 15;
      return Math.sqrt(dx * dx + dy * dy + dz * dz);
    };

    // Build Graph Adjacency List
    const graph = new Map();
    allNodes.forEach((n) => graph.set(n.nodeId, []));

    allEdges.forEach((edge) => {
      if (accessibleOnly && (edge.edgeType === 'Stair' || edge.accessible === false)) return;

      if (graph.has(edge.fromNode)) {
        graph.get(edge.fromNode).push({
          to: edge.toNode,
          dist: edge.distanceMeters,
          type: edge.edgeType,
          floorTransition: edge.floorTransition,
        });
      }
      if (graph.has(edge.toNode)) {
        graph.get(edge.toNode).push({
          to: edge.fromNode,
          dist: edge.distanceMeters,
          type: edge.edgeType,
          floorTransition: edge.floorTransition,
        });
      }
    });

    // A* Pathfinding
    const openSet = new Set([sourceNodeId]);
    const cameFrom = new Map();

    const gScore = new Map();
    allNodes.forEach((n) => gScore.set(n.nodeId, Infinity));
    gScore.set(sourceNodeId, 0);

    const fScore = new Map();
    allNodes.forEach((n) => fScore.set(n.nodeId, Infinity));
    fScore.set(sourceNodeId, heuristic(sourceNodeId, targetNodeId));

    let pathFound = false;

    while (openSet.size > 0) {
      let current = null;
      let lowestF = Infinity;

      for (const id of openSet) {
        const score = fScore.get(id) ?? Infinity;
        if (score < lowestF) {
          lowestF = score;
          current = id;
        }
      }

      if (current === targetNodeId) {
        pathFound = true;
        break;
      }

      if (!current) break;
      openSet.delete(current);

      const neighbors = graph.get(current) || [];
      for (const neighbor of neighbors) {
        const tentativeG = (gScore.get(current) ?? Infinity) + neighbor.dist;
        if (tentativeG < (gScore.get(neighbor.to) ?? Infinity)) {
          cameFrom.set(neighbor.to, current);
          gScore.set(neighbor.to, tentativeG);
          fScore.set(neighbor.to, tentativeG + heuristic(neighbor.to, targetNodeId));
          openSet.add(neighbor.to);
        }
      }
    }

    let pathNodes = [];
    if (pathFound) {
      let curr = targetNodeId;
      while (curr) {
        const nObj = nodeMap.get(curr);
        if (nObj) pathNodes.unshift(nObj);
        curr = cameFrom.get(curr);
      }
    } else {
      // Fallback path generation if graph isn't fully linked
      const startN = nodeMap.get(sourceNodeId) || { nodeId: 'START', label: 'Main Entrance', x: 50, y: 350, floorNumber: 0 };
      const destN = nodeMap.get(targetNodeId) || {
        nodeId: 'DEST',
        label: destRoom ? `${destRoom.roomNumber} - ${destRoom.name}` : 'Destination Room',
        x: destRoom?.entrance?.x || 420,
        y: destRoom?.entrance?.y || 120,
        floorNumber: destRoom?.floor?.floorNumber || 1,
        room: destRoom,
      };

      pathNodes = [startN];
      if (startN.floorNumber !== destN.floorNumber) {
        pathNodes.push({
          nodeId: 'STAIR_TRANSITION',
          nodeType: accessibleOnly ? 'Lift' : 'Stair',
          label: accessibleOnly ? 'Elevator / Lift' : 'Stairwell A',
          x: 200,
          y: 200,
          floorNumber: startN.floorNumber,
        });
        pathNodes.push({
          nodeId: 'STAIR_TRANSITION_ARRIVE',
          nodeType: accessibleOnly ? 'Lift' : 'Stair',
          label: accessibleOnly ? 'Elevator Arrive' : 'Stairwell Arrive',
          x: 200,
          y: 200,
          floorNumber: destN.floorNumber,
        });
      }
      pathNodes.push(destN);
    }

    // Calculate total distance & walking time
    let totalDistanceMeters = 0;
    for (let i = 0; i < pathNodes.length - 1; i++) {
      const p1 = pathNodes[i];
      const p2 = pathNodes[i + 1];
      const dx = (p1.x - p2.x) || 10;
      const dy = (p1.y - p2.y) || 10;
      const floorDiff = Math.abs((p1.floorNumber || 0) - (p2.floorNumber || 0));
      totalDistanceMeters += Math.round(Math.sqrt(dx * dx + dy * dy) * 0.15 + floorDiff * 15);
    }
    if (totalDistanceMeters < 15) totalDistanceMeters = 35;

    const walkingTimeSeconds = Math.round(totalDistanceMeters / 1.2);

    // Generate Turn-By-Turn Directions
    const directions = [];
    directions.push(`Start at ${pathNodes[0]?.label || pathNodes[0]?.nodeType || 'Main Campus Entrance'}.`);

    let currentFloor = pathNodes[0]?.floorNumber || 0;
    for (let i = 1; i < pathNodes.length; i++) {
      const node = pathNodes[i];
      const nextFloor = node.floorNumber || 0;

      if (nextFloor !== currentFloor) {
        const verb = accessibleOnly ? 'Take the Lift' : 'Take Stairs';
        directions.push(`${verb} to reach Level ${nextFloor}.`);
        currentFloor = nextFloor;
      } else if (node.nodeType === 'Corridor' || node.nodeType === 'Junction') {
        directions.push(`Proceed along the main corridor towards ${node.label || 'junction'}.`);
      } else if (node.nodeType === 'Room Entrance' || node.room || i === pathNodes.length - 1) {
        directions.push(`Arrive at ${node.label || node.room?.name || destRoom?.name || 'destination room'}.`);
      }
    }

    res.status(200).json({
      success: true,
      data: {
        totalDistanceMeters,
        walkingTimeSeconds,
        walkingTimeText: `${Math.floor(walkingTimeSeconds / 60)} min ${walkingTimeSeconds % 60} sec`,
        pathNodes,
        directions,
        destinationRoom: destRoom,
        accessibleRoute: !!accessibleOnly,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
