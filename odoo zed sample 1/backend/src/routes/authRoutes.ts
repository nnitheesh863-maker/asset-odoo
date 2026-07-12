import { Router } from 'express';
import { login, signup, refreshToken, getProfile, changePassword } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.post('/signup', signup);
router.post('/refresh', refreshToken);
router.get('/profile', authenticate, getProfile);
router.put('/change-password', authenticate, changePassword);

export default router;
