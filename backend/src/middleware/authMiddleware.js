// authMiddleware.js المحدث
import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(403).json({ message: "يجب تسجيل الدخول" });

  try {
    // تأكد أن المفتاح 'traxos_secret' مطابق تماماً لما هو موجود في authController
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'traxos_secret');
    req.user = decoded;
    next();
  } catch (err) {
    console.log("JWT Error:", err.message); // سيظهر لك في الـ Terminal إذا فشل التحقق
    return res.status(401).json({ message: "جلسة العمل انتهت، يرجى تسجيل الدخول مجدداً" });
  }
};

export const isAdmin = (req, res, next) => {
  // إضافة علامة استفهام للأمان في حال كان req.user غير موجود
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ message: "غير مصرح لك، للأدمن فقط" });
  }
  next();
};