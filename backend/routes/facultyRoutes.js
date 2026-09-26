import express from 'express';
import {
  getFacultyList,
  createFaculty,
  updateFaculty,
  deleteFaculty,
} from '../controllers/facultyController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(getFacultyList)
  .post(protect, admin, createFaculty);

router.route('/:id')
  .put(protect, admin, updateFaculty)
  .delete(protect, admin, deleteFaculty);

export default router;
