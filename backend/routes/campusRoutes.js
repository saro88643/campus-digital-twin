import express from 'express';
import { getCampus, updateCampus } from '../controllers/campusController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(getCampus)
  .put(protect, admin, updateCampus);

export default router;
