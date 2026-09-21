import express from 'express';
import { getFloors, getFloor, createFloor, updateFloor, deleteFloor } from '../controllers/floorController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(getFloors)
  .post(protect, admin, createFloor);

router.route('/:id')
  .get(getFloor)
  .put(protect, admin, updateFloor)
  .delete(protect, admin, deleteFloor);

export default router;
