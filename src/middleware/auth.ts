import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Пробуем получить токен из заголовка
    let token = req.header('Authorization')?.replace('Bearer ', '');
    
    // Если нет в заголовке, пробуем из кук
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }
    
    if (!token) {
      res.status(401).json({ message: 'Токен не предоставлен' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    const user = await User.findById(decoded.id);
    
    if (!user) {
      res.status(401).json({ message: 'Пользователь не найден' });
      return;
    }

    if (!user.isActive) {
      res.status(401).json({ message: 'Пользователь заблокирован' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Неверный токен' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ message: 'Требуется авторизация' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ 
        message: 'Недостаточно прав. Требуемые роли: ' + roles.join(', ') 
      });
      return;
    }

    next();
  };
};