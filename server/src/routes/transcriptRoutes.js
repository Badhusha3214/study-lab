import express from 'express';
import { getTranscript } from '../controllers/transcriptController.js';

const router = express.Router();

router.get('/:videoId', getTranscript);

export default router;
