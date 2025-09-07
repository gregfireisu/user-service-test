import { Response } from 'express';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, middleName, birthDate, email, password, role } = req.body;

    // Проверяем существование пользователя
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'Пользователь с таким email уже существует' });
      return;
    }

    // Создаем пользователя
    const user = new User({
      firstName,
      lastName,
      middleName,
      birthDate: new Date(birthDate),
      email,
      password,
      role: role || 'user'
    });

    await user.save();
    
    // Генерируем токен
    const token = user.generateAuthToken();
    
    res.status(201).json({
      user: user.toJSON(),
      token,
      message: 'Пользователь успешно зарегистрирован'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Ошибка при регистрации' });
  }
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Ищем пользователя
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Неверные учетные данные' });
      return;
    }

    // Проверяем пароль
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Неверные учетные данные' });
      return;
    }

    // Проверяем активность
    if (!user.isActive) {
      res.status(401).json({ message: 'Пользователь заблокирован' });
      return;
    }

    // Генерируем токен
    const token = user.generateAuthToken();

    res.json({
      user: user.toJSON(),
      token,
      message: 'Вход выполнен успешно'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Ошибка при входе' });
  }
};

export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      res.status(404).json({ message: 'Пользователь не найден' });
      return;
    }

    // Проверка прав доступа
    if (req.user!.role !== 'admin' && req.user!._id.toString() !== user._id.toString()) {
      res.status(403).json({ message: 'Доступ запрещен' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

export const toggleUserStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      res.status(404).json({ message: 'Пользователь не найден' });
      return;
    }

    // Проверка прав доступа
    if (req.user!.role !== 'admin' && req.user!._id.toString() !== user._id.toString()) {
      res.status(403).json({ message: 'Доступ запрещен' });
      return;
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({ 
      message: `Пользователь ${user.isActive ? 'активирован' : 'заблокирован'}`,
      isActive: user.isActive
    });
  } catch (error) {
    console.error('Toggle status error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};