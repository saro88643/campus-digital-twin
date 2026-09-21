import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.route('/').get(getSettings).put(requireAuth, requireAdmin, updateSettings);

export default router;
