import express from 'express';
import { getDepartments, getDepartment, createDepartment, updateDepartment, deleteDepartment } from '../controllers/departmentController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(getDepartments)
  .post(protect, admin, createDepartment);

router.route('/:id')
  .get(getDepartment)
  .put(protect, admin, updateDepartment)
  .delete(protect, admin, deleteDepartment);

export default router;
