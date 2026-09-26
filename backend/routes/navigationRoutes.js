import express from 'express';
import {
  getNodes,
  createNode,
  getEdges,
  createEdge,
  calculatePath,
} from '../controllers/navigationController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/nodes', getNodes);
router.post('/nodes', protect, admin, createNode);

router.get('/edges', getEdges);
router.post('/edges', protect, admin, createEdge);

router.post('/calculate-path', calculatePath);

export default router;
