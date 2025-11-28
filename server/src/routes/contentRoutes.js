import express from 'express';
import { fetchBlogContent, fetchYouTubeTranscript } from '../controllers/contentController.js';

const router = express.Router();

router.post('/blog', fetchBlogContent);
router.post('/youtube', fetchYouTubeTranscript);

export default router;
