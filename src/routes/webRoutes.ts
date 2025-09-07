import { Router } from 'express';
import { AuthRequest } from '../middleware/auth';
import { authenticate } from '../middleware/auth';
import fetch from 'node-fetch';

const router = Router();

// Главная страница
router.get('/', (req, res) => {
  res.render('index', { title: 'User Service', user: null });
});

// Страница регистрации
router.get('/register', (req, res) => {
  res.render('register', { title: 'Регистрация', error: null, success: null });
});

// Страница входа (GET)
router.get('/login', (req, res) => {
  res.render('login', { title: 'Вход', error: null, success: null });
});

// Обработка входа (POST) - перенаправляем на API
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Перенаправляем запрос к API
    const apiResponse = await fetch(`http://localhost:${process.env.PORT || 3000}/api/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const result = await apiResponse.json();
    
    if (apiResponse.ok) {
      // Успешный вход - сохраняем токен в куки и перенаправляем
      res.cookie('token', result.token, { httpOnly: true });
      res.redirect('/users');
    } else {
      // Ошибка входа
      res.render('login', { 
        title: 'Вход', 
        error: result.message,
        success: null 
      });
    }
  } catch (error) {
    res.render('login', { 
      title: 'Вход', 
      error: 'Ошибка сервера',
      success: null 
    });
  }
});

// Страница пользователей (только для авторизованных)
router.get('/users', authenticate, async (req: AuthRequest, res) => {
  try {
    // Получаем список пользователей из API
    const apiResponse = await fetch(`http://localhost:${process.env.PORT || 3000}/api/users`, {
      headers: {
        'Authorization': `Bearer ${req.cookies.token}`
      }
    });
    
    const users = await apiResponse.json();
    
    res.render('users', { 
      title: 'Пользователи', 
      user: req.user,
      users: users
    });
  } catch (error) {
    res.render('error', { 
      title: 'Ошибка',
      message: 'Не удалось загрузить пользователей'
    });
  }
});

// Выход
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});

export default router;