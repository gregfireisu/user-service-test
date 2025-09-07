import { Request, Response, NextFunction } from 'express';

export const validateUserRegistration = (req: Request, res: Response, next: NextFunction): void => {
  const { firstName, lastName, email, password, birthDate } = req.body;

  if (!firstName || !lastName || !email || !password || !birthDate) {
    res.status(400).json({ message: 'Все обязательные поля должны быть заполнены' });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ message: 'Пароль должен содержать минимум 6 символов' });
    return;
  }

  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: 'Неверный формат email' });
    return;
  }

  next();
};