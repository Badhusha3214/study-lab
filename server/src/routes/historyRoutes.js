import express from 'express';
import { body, param } from 'express-validator';
import { createHistory, listHistory, getHistory, deleteHistory } from '../controllers/historyController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.use(auth(true));

router.post('/', [
  body('sources').isArray({ min: 1 }).withMessage('sources array required'),
  body('summary').isString().isLength({ min: 10 }).withMessage('summary too short'),
  body('quiz').optional().isArray()
], createHistory);

router.get('/', listHistory);
router.get('/:id', [param('id').isMongoId()], getHistory);
router.delete('/:id', [param('id').isMongoId()], deleteHistory);

export default router;
