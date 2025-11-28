import express from 'express';
import { body } from 'express-validator';
import { register, login, refresh, logout } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password >= 6 chars'),
  body('name').optional().isLength({ max: 100 })
], register);

router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty()
], login);

router.post('/refresh', [body('refreshToken').notEmpty()], refresh);
router.post('/logout', [body('refreshToken').notEmpty()], logout);

export default router;
