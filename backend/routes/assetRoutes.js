import express from 'express';
import {
  getAssets,
  createAsset,
  updateAsset,
  deleteAsset,
} from '../controllers/assetController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(getAssets)
  .post(protect, admin, createAsset);

router.route('/:id')
  .put(protect, admin, updateAsset)
  .delete(protect, admin, deleteAsset);

export default router;
