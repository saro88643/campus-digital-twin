import express from 'express';
import { importData, exportData } from '../controllers/importExportController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.post('/import', protect, admin, importData);
router.get('/export', protect, admin, exportData);

export default router;
