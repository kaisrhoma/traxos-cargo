import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import userRoutes from './routes/userRoutes.js'; // 1. استيراد المسار الجديد

dotenv.config();

// هذا الكود اختياري، إذا كنت تريد السيرفر أن يحاول الربط عند البدء
import { execSync } from 'child_process';
try {
  console.log("Attempting to sync database...");
  execSync('npx prisma db push --accept-data-loss');
  console.log("Database synced successfully.");
} catch (error) {
  console.error("Database sync failed, but starting server anyway...", error);
}

const app = express();

app.use(cors()); 
app.use(express.json());

// المسارات (Routes)
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes); // 2. تفعيل المسار الجديد هنا

app.get('/', (req, res) => {
  res.send('Traxos API (JavaScript) is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 السيرفر يعمل الآن على: http://localhost:${PORT}`);
});