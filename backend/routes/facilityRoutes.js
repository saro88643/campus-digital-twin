import express from 'express';
import { getFacilities, getFacility, createFacility, updateFacility, deleteFacility } from '../controllers/facilityController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(getFacilities)
  .post(protect, admin, createFacility);

router.route('/:id')
  .get(getFacility)
  .put(protect, admin, updateFacility)
  .delete(protect, admin, deleteFacility);

export default router;
