import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import userRoutes from './routes/userRoutes';

// Конфигурация
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Подключение к БД
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Логирование запросов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/users', userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Корневой маршрут
app.get('/', (req, res) => {
  res.json({ 
    message: 'User Service API', 
    version: '1.0.0',
    endpoints: {
      register: 'POST /api/users/register',
      login: 'POST /api/users/login',
      getUser: 'GET /api/users/:id',
      getUsers: 'GET /api/users',
      toggleStatus: 'PATCH /api/users/:id/toggle-status'
    }
  });
});

// Обработка ошибок middleware (должен быть после всех маршрутов)
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', error);
  res.status(500).json({ message: 'Внутренняя ошибка сервера' });
});

// Обработка 404 - ДОЛЖЕН БЫТЬ ПОСЛЕДНИМ
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({ 
    message: 'Маршрут не найден',
    path: req.path,
    method: req.method
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📋 API Documentation:`);
  console.log(`   POST   /api/users/register    - Регистрация`);
  console.log(`   POST   /api/users/login       - Вход`);
  console.log(`   GET    /api/users/:id         - Получить пользователя`);
  console.log(`   GET    /api/users/            - Список пользователей (admin)`);
  console.log(`   PATCH  /api/users/:id/toggle-status - Блокировка`);
});