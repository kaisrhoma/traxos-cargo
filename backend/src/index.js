import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { execSync } from 'child_process';

dotenv.config();

const app = express();

app.use(cors()); 
app.use(express.json());

// المسارات (Routes)
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('Traxos API (JavaScript) is running...');
});

// إعداد المنفذ ليتوافق مع البيئات السحابية (Render)
const PORT = process.env.PORT || 5000;

// تشغيل السيرفر أولاً لفتح المنفذ فوراً ومنع Render من إيقاف الخدمة
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  
  // الآن نقوم بمحاولة مزامنة قاعدة البيانات في الخلفية بعد أن أصبح السيرفر Live
  try {
    console.log("Attempting to sync database in background...");
    // استخدام exec بدون Sync لضمان عدم تجميد السيرفر، أو تركه كما هو لأنه بعد الـ listen
    execSync('npx prisma db push --accept-data-loss');
    console.log("Database synced successfully.");
  } catch (error) {
    console.error("Database sync failed, but server is already live.", error.message);
  }
});