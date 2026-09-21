import express from 'express';
import { getBlocks, getBlock, createBlock, updateBlock, deleteBlock } from '../controllers/blockController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(getBlocks)
  .post(protect, admin, createBlock);

router.route('/:id')
  .get(getBlock)
  .put(protect, admin, updateBlock)
  .delete(protect, admin, deleteBlock);

export default router;
