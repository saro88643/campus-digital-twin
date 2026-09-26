import express from 'express';
import {
  getDigitalTwinStats,
  getFloorPlan,
  saveFloorPlan,
  mapRoom,
  validateDigitalTwin,
} from '../controllers/digitalTwinController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', getDigitalTwinStats);
router.get('/floor-plan/:floorId', getFloorPlan);
router.post('/floor-plan/:floorId', protect, admin, saveFloorPlan);
router.post('/map-room', protect, admin, mapRoom);
router.post('/validate', protect, admin, validateDigitalTwin);

export default router;
