import { Router } from 'express';
import { 
  register, 
  login, 
  getUserById, 
  getUsers, 
  toggleUserStatus 
} from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';
import { validateUserRegistration } from '../middleware/validation';

const router = Router();

// Публичные маршруты
router.post('/register', validateUserRegistration, register);
router.post('/login', login);

// Защищенные маршруты
router.get('/:id', authenticate, getUserById);
router.get('/', authenticate, authorize('admin'), getUsers);
router.patch('/:id/toggle-status', authenticate, toggleUserStatus);

export default router;