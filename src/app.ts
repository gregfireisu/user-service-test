import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB } from './config/database';
import userRoutes from './routes/userRoutes';
import webRoutes from './routes/webRoutes';
import cookieParser from 'cookie-parser';

// Конфигурация
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Подключение к БД
connectDB();

// Настройка EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Логирование запросов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/users', userRoutes);
app.use('/', webRoutes);

// Обработка ошибок
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', error);
  res.status(500).render('error', { 
    message: 'Внутренняя ошибка сервера',
    title: 'Ошибка сервера'
  });
});

app.use(cookieParser());

// Обработка 404 - ДОЛЖЕН БЫТЬ ПОСЛЕДНИМ
app.use((req: express.Request, res: express.Response) => {
  res.status(404).render('error', { 
    message: 'Страница не найдена',
    title: '404 - Не найдено'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📋 Web interface: http://localhost:${PORT}`);
});