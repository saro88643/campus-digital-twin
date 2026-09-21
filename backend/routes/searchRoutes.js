import express from 'express';
import { searchRooms } from '../controllers/roomController.js';

const router = express.Router();

router.get('/rooms', searchRooms);

export default router;
