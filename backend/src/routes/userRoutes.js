// userRoutes.js المطور
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';
import bcrypt from 'bcryptjs'; 

const prisma = new PrismaClient();
const router = express.Router();

// جلب جميع المستخدمين
router.get('/all', verifyToken, isAdmin, async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "حدث خطأ أثناء جلب المستخدمين" });
    }
});

// مسار لحذف مستخدم - أضفنا الحماية هنا
router.delete('/delete/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        await prisma.user.delete({
            where: { id: req.params.id }
        });
        res.json({ message: "تم حذف المستخدم بنجاح" });
    } catch (error) {
        res.status(500).json({ error: "خطأ في حذف المستخدم" });
    }
});

// مسار لترقية المستخدم - أضفنا الحماية هنا
router.post('/update-role', verifyToken, isAdmin, async (req, res) => {
    const { id, role } = req.body;
    try {
        const updatedUser = await prisma.user.update({
            where: { id: id },
            data: { role: role }
        });
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: "خطأ في تحديث الرتبة" });
    }
});

// مسار تحديث بيانات المستخدم
router.put('/update-profile', verifyToken, async (req, res) => {
  try {
    const id = req.user.userId; 
    const { name, password } = req.body; // استقبل الباسورد أيضاً

    const updateData = { name };

    // إذا تم إرسال كلمة مرور جديدة، قم بتشفيرها وإضافتها للتحديث
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: updateData
    });

    res.json({ 
      message: "تم تحديث البيانات بنجاح", 
      user: { name: updatedUser.name, email: updatedUser.email } 
    });
  } catch (error) {
    res.status(500).json({ message: "فشل تحديث البيانات" });
  }
});

export default router;